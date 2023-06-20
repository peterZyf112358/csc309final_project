from .models import property, PropImage
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
import datetime
from notifications.models import notifications
from reservations.models import reservations


class PropertySerializer(ModelSerializer):
  class Meta:
      model = property
      fields = ['pk', 'owner', 'address', 'rating', 'available_start', 'available_end', 'amenities', 'image_cover', 
                'num_guest', 'price']

class PropertyDetailSerializer(ModelSerializer):
  class Meta:
      model = property
      exclude = []

class PropertyCreateSerializer(ModelSerializer):
   image_cover = serializers.ImageField(error_messages={'required' : "upload a cover image"})
   images = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
   class Meta:
      model = property
      fields = '__all__'
      read_only_fields = ['owner', 'comments', 'rating']

   def validate(self, data):
      errors = {}
      if not data.get('available_start'):
         errors['available_start'] = 'Please enter the start of the availability'
      if not data.get('available_end'):
         errors['available_end'] = 'Please enter the end of the availability'
      if data.get('available_start') and data.get('available_end') and not data.get('available_end') > data.get('available_start'):
         errors['available_end']='end time should be greater than start time'
      amenities = data.get('amenities')
      am = {'wifi', 'kitchen', 'washer', 'dryer', 'air_cond', 'heating', 'hair_dryer', 'TV', 'pool', 
              'hot_tub', 'bbq', 'gym'}
      if amenities:
         for amenity in amenities.split(','):
            if not amenity in am:
               errors['amenities'] = 'invalid amenity'
      if not data.get('num_guest') > 0:
         errors['num_guest']='number of guests should be greater than 0'
      if not data.get('price'):
         errors['price'] = 'enter a price'
      elif data.get('price') < 0:
         errors['price'] = 'enter a price greater than 0'
        
      if errors:
         raise serializers.ValidationError(errors)
      return data
   
   def create(self, validated_data):
      request = self.context['request']
      if not request.user.is_authenticated:
         raise serializers.ValidationError('You need to login to create a property.')
      owner = request.user
      address = validated_data['address']
      amenities = validated_data.get('amenities')
      image_cover = validated_data['image_cover']
      numguest = validated_data['num_guest']
      description = validated_data.get('description')
      price = validated_data['price']
      num_bed = validated_data['num_bed']
      num_bath = validated_data['num_bath']
      p = property.objects.create(owner=owner, address=address, available_start=validated_data['available_start'], 
                                  available_end=validated_data['available_end'], 
                                  amenities=amenities, image_cover=image_cover, num_guest=numguest, description=description, 
                                  price=price, num_bed=num_bed, num_bath=num_bath)
      p.save()
      images_data = validated_data.get('images', None)
      if images_data != None:
         for image_data in images_data:
            i = PropImage.objects.create(prop=p, image=image_data)
            i.save()
      return p
   
class PropertyUpdateSerializer(ModelSerializer):
   image_cover = serializers.ImageField(required=False)
   images = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
   uploaded_images = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
   class Meta:
      model = property
      fields = '__all__'
      read_only_fields = ['owner', 'comments', 'rating']

   def validate(self, data):
      errors = {}
      original_property = property.objects.get(pk=self.instance.pk)
      if not data.get('available_start'):
         data['available_start'] = original_property.available_start
      if not data.get('available_end'):
         data['available_end'] = original_property.available_end
      if not data['available_start'] < data['available_end']:
         errors['available_end']='end time should be greater than start time'
      reservation = reservations.objects.filter(property=original_property).filter(status__in=['pending', 'approved', 'cancel_pending']).all()
      for reser in reservation:
         if reser.start_day < data['available_start'] or reser.end_day > data['available_end']:
            raise serializers.ValidationError({'error' : 'You have some active reservation that is outside of this new available interval. Please terminate all those reservation before making this update to the property'})
      amenities = data.get('amenities')
      am = {'wifi', 'kitchen', 'washer', 'dryer', 'air_cond', 'heating', 'hair_dryer', 'TV', 'pool', 
              'hot_tub', 'bbq', 'gym'}
      if amenities:
         for amenity in amenities.split(','):
            if not amenity in am:
               errors['amenities'] = 'invalid amenity'   
      if not data.get('image_cover'):
         data['image_cover'] = original_property.image_cover
      if data.get('num_guest') and not data.get('num_guest') > 0:
         errors['num_guest']='number of guests should be greater than 0'
      if data.get('price') and data.get('price') < 0:
         errors['price'] = 'enter a price greater than 0'
      
      if errors:
         raise serializers.ValidationError(errors)
      return data
   
   def update(self, instance, validated_data):
      instance.address = validated_data.get('address')
      instance.available_start = validated_data.get('available_start')
      instance.available_end = validated_data.get('available_end')
      instance.amenities = validated_data.get('amenities')
      instance.image_cover = validated_data.get('image_cover')
      instance.num_guest = validated_data.get('num_guest')
      instance.description = validated_data.get('description')
      instance.price = validated_data.get('price')
      instance.num_bed = validated_data.get('num_bed')
      instance.num_bath = validated_data.get('num_bath')
      instance.save()
      if validated_data.get('uploaded_images', None) == None:
         PropImage.objects.filter(prop=instance).delete()
      else:
         PropImage.objects.filter(prop=instance).exclude(id__in=validated_data.get('uploaded_images')).delete()
      images_data = validated_data.get('images', None)
      if images_data != None:
         for image_data in images_data:
            i = PropImage.objects.create(prop=instance, image=image_data)
            i.save()
      
      return instance
      
class PropertyDeleteSerializer(ModelSerializer):
   def delete(self, data):
      all_reservations = reservations.objects.all()
      active_reservations = all_reservations.filter(
         property=data,
         status__in=['approved', 'pending', 'cancel_pending'])
      for reservation in active_reservations:
         notification = notifications.objects.create(
               reciever=reservation.reserver,
               content=f"Property at {data.address} has been deleted so you reservation is terminated automatically. Click to go to the host's profile to see their contact information.",
               content_object=reservation.host
         )
         notification.save()
         