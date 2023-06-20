from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import reservations
from property.models import property
import datetime
from notifications.models import notifications
 
class ReservationListSerializer(ModelSerializer):
    class Meta:
        model = reservations
        exclude = ['reserve_time', 'notified']

class reserveSerializer(ModelSerializer):
    property_id = serializers.IntegerField()
    start_day = serializers.CharField()
    end_day = serializers.CharField()
    class Meta:
        model = reservations
        fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status', 'price']
        read_only_fields = ['host_id', 'reserver_id', 'reserve_time', 'status']

    def validate(self, args):
        error_mess = {}
        if args.get('property_id', None) == None:
            error_mess['property_id'] = 'This field is required'
        if args.get('start_day', None) == None:
            error_mess['start_day'] = 'This field is required'
        if args.get('end_day', None) == None:
            error_mess['end_day'] = 'This field is required'
        if len(error_mess) != 0:
            raise serializers.ValidationError(error_mess)
        if not property.objects.filter(id=args.get('property_id')).exists():
            error_mess['property_id'] = "There is no property with the given id"
        try:
            start_day = datetime.date.fromisoformat(args.get('start_day'))
        except ValueError:
            error_mess['start_day'] = "The format of the day is invalid. Should be YYYY-MM-DD."
        try:
            end_day = datetime.date.fromisoformat(args.get('end_day'))
        except ValueError:
            error_mess['end_day'] = "The format of the day is invalid. Should be YYYY-MM-DD."
        if len(error_mess) != 0:
            raise serializers.ValidationError(error_mess)
        ava_start = property.objects.filter(id=args.get('property_id')).first().available_start
        ava_end = property.objects.filter(id=args.get('property_id')).first().available_end
        if start_day > end_day:
            error_mess['date'] = 'Your start day cannot be later than your end day of reservation.'
        if start_day < ava_start:
            error_mess['start_day'] = 'Your start day cannot be earlier than the available start day of the property.'
        if end_day > ava_end:
            error_mess['end_day'] = 'Your end day cannot be later than the available end day of the property.'
        if len(error_mess) != 0:
            raise serializers.ValidationError(error_mess)
        reser = reservations.objects.filter(property=property.objects.filter(id=args.get('property_id')).first()).all()
        for reservation in reser.iterator():
            if reservation.status == 'pending' or reservation.status == 'approved' or reservation.status == 'cancel_pending':
                if not (end_day < reservation.start_day or start_day > reservation.end_day):
                    raise serializers.ValidationError({'date' : 'There is time conflicts on this property. Please choose another time interval.'})
        return super().validate(args)
    
    def create(self, validated_data):
        p = property.objects.filter(id=validated_data['property_id']).first()
        host = p.owner
        reserver = self.context['request'].user
        start = datetime.date.fromisoformat(validated_data['start_day'])
        end = datetime.date.fromisoformat(validated_data['end_day'])
        r = reservations.objects.create(host=host, property=p, reserver=reserver, start_day=start, end_day=end, status='pending', price=validated_data['price'])
        r.save()
        n = notifications.objects.create(receiver=host, content_object=r, content="You have a new reservation on your property. Please click to check it.")
        n.save()
        return r
    
class cancelSerializer(ModelSerializer):
    class Meta:
        model = reservations
        fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']
        read_only_fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']

    def update(self, instance, validated_data):
        if instance.status == 'pending':
            instance.status = 'canceled'
        elif instance.status == 'approved':
            instance.status = 'cancel_pending'
            n = notifications.objects.create(receiver=instance.property.owner, content_object=instance, content="You have a new cancelation request on your property. Please click to check it.")
            n.save()
        else:
            raise serializers.ValidationError({'status' : 'This reservation cannot be canceled'})
        instance.save()
        return instance
    
class pendingSerializer(ModelSerializer):
    action = serializers.CharField(write_only=True)
    class Meta:
        model = reservations
        fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status', 'action']
        read_only_fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']

    def update(self, instance, validated_data):
        if validated_data.get('action', None) == None:
            raise serializers.ValidationError({'action' : 'This field is required'})
        if validated_data.get('action') != 'approve' and validated_data.get('action') != 'deny':
            raise serializers.ValidationError({'action' : 'This is invalid action'})
        if validated_data.get('action') == 'approve':
            instance.status = 'approved'
            n = notifications.objects.create(receiver=instance.reserver, content_object=instance, content="Your pending reservation request is approved. Please click to check it.")
            n.save()
        else:
            instance.status = 'denied'
            n = notifications.objects.create(receiver=instance.reserver, content_object=instance, content="Your pending reservation request is denied. Please click to check it.")
            n.save()
        instance.save()
        return instance
    
class cancelActionSerializer(ModelSerializer):
    action = serializers.CharField(write_only=True)
    class Meta:
        model = reservations
        fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status', 'action']
        read_only_fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']

    def update(self, instance, validated_data):
        if validated_data.get('action', None) == None:
            raise serializers.ValidationError({'action' : 'This field is required'})
        if validated_data.get('action') != 'approve' and validated_data.get('action') != 'deny':
            raise serializers.ValidationError({'action' : 'This is invalid action'})
        if validated_data.get('action') == 'approve':
            instance.status = 'canceled'
            n = notifications.objects.create(receiver=instance.reserver, content_object=instance, content="Your canceltaion request is approved. Please click to check it.")
            n.save()
        else:
            instance.status = 'approved'
            n = notifications.objects.create(receiver=instance.reserver, content_object=instance, content="Your cancelation request is denied. Please click to check it.")
            n.save()
        instance.save()
        return instance
    
class terminateSerializer(ModelSerializer):
    class Meta:
        model = reservations
        fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']
        read_only_fields = ['host_id', 'property_id', 'reserver_id', 'reserve_time', 'start_day', 'end_day', 'status']

    def update(self, instance, validated_data):
        if instance.status != 'pending' and instance.status != 'approved' and instance.status != 'cancel_pending':
            raise serializers.ValidationError({'status' : 'This reservation is no longer active so you cannot terminate it.'})
        instance.status = 'terminated'
        instance.save()
        n = notifications.objects.create(receiver=instance.reserver, content_object=instance, content="Your reservation has been terminated. Please click to check it.")
        n.save()
        return instance