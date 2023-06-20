from rest_framework.serializers import ModelSerializer
from .models import comments
from property.models import property as property_
from accounts.models import User as user_
from reservations.models import reservations
from rest_framework import serializers
from notifications.models import notifications as notification_
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('avatar',)


class PropertyCommentSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    class Meta:
        model = comments
        fields = ('id', 'sender_id', 'receiver_id', 'content', 'created_time', 'object_id', 'comments', 'rating',
                  'base_comment', 'sender')


class ReplySerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    class Meta:
        model = comments
        fields = ('id', 'sender_id', 'receiver_id', 'content', 'created_time', 'object_id', 'comments', 'rating',
                  'base_comment', 'sender')


class UserCommentSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    class Meta:
        model = comments
        fields = ('id', 'sender_id', 'receiver_id', 'content', 'created_time', 'object_id', 'comments', 'rating',
                  'base_comment', 'sender')


class PropertyCommentCreate(serializers.ModelSerializer):
    class Meta:
        model = comments
        fields = ('sender_id', 'receiver_id', 'content', 'comments', 'object_id', 'rating')
        read_only_fields = ('sender_id', 'comments', 'object_id', 'receiver_id')

    def validate(self, data):

        request = self.context.get('request')
        user = request.user
        property_id = request.parser_context.get('kwargs').get('id')
        properties = property_.objects.filter(id=property_id)

        rating = data.get('rating')
        if not rating:
            raise serializers.ValidationError({'rating': 'you have to rate'})
        if rating not in [0, 1, 2, 3, 4, 5]:
            raise serializers.ValidationError({'rating': 'you have to rate in 1 to 5'})

        content = data.get('content')
        if not content:
            raise serializers.ValidationError({'content': 'you have to write something'})

        result1 = reservations.objects.filter(property_id=property_id).filter(reserver=user).filter(status='completed')
        result2 = reservations.objects.filter(property_id=property_id).filter(reserver=user).filter(status='terminated')
        num_rese = len(result1) + len(result2)
        comments_list = properties.first().comments
        num_com = 0
        for items in comments_list.all().iterator():
            if items.sender == user and items.comments:
                num_com += 1
        if num_com >= num_rese:
            raise serializers.ValidationError({'detail': 'you cannot comment on this property'})

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        content = validated_data['content']
        rating = validated_data['rating']
        property_id = self.context.get('request').parser_context.get('kwargs').get('id')
        properties = property_.objects.filter(id=property_id).first()
        receiver = properties.owner
        old_rates = properties.rating
        comments_list = properties.comments
        num_com = 0
        for items in comments_list.all().iterator():
            if items.sender == user and items.comments:
                num_com += 1
        new_rates = round((old_rates * num_com + rating) / (num_com + 1), 2)

        properties.rating = new_rates
        properties.save()

        result = comments.objects.create(sender=self.context.get('request').user,
                                         content=content,
                                         rating=rating,
                                         content_object=properties,
                                         receiver=receiver,
                                         comments=True,
                                         )
        notfications = notification_.objects.create(receiver=receiver,
                                                    content_object=properties,
                                                    content="You have a new comment on your property. Please click to check it."
                                                    )
        notfications.save()
        result.save()
        return result


class UserCommentCreate(serializers.ModelSerializer):
    class Meta:
        model = comments
        fields = ('sender_id', 'content', 'comments', 'object_id', 'receiver_id', 'rating')
        read_only_fields = ('sender_id', 'comments', 'object_id', 'receiver_id')

    def validate(self, data):

        request = self.context.get('request')
        user = request.user
        user_id = request.parser_context.get('kwargs').get('id')
        reservation_list = reservations.objects.filter(reserver=user_id).filter(host=user).filter(status='completed')
        user_file = user_.objects.filter(id=user_id)
        content = data.get('content')
        if not content:
            raise serializers.ValidationError({'content': 'you have to write something'})
        rating = data.get('rating')
        if not rating:
            raise serializers.ValidationError({'rating': 'you have to rate'})
        if rating not in [0, 1, 2, 3, 4, 5]:
            raise serializers.ValidationError({'rating': 'you have to rate in 1 to 5'})
        comments_list = user_file.first().comments
        num_com = 0
        for items in comments_list.all().iterator():
            if items.sender == user and items.comments:
                num_com += 1
        if num_com >= len(reservation_list):
            raise serializers.ValidationError({'detail': 'you cannot comment this user'})
        return data

    def create(self, validated_data):
        content = validated_data['content']
        rating = validated_data['rating']
        username = self.context.get('request').parser_context.get('kwargs').get('id')
        user = user_.objects.filter(id=username).first()
        old_rates = user.rating
        comments_list = user.comments
        num_com = 0
        for items in comments_list.all().iterator():
            if items.comments:
                num_com += 1
        new_rates = round((old_rates * num_com + rating) / (num_com + 1), 2)

        user.rating = new_rates
        user.save()
        result = comments.objects.create(sender=self.context.get('request').user,
                                         content=content,
                                         content_object=user,
                                         receiver=user,
                                         rating=rating,
                                         comments=True,
                                         )
        notfications = notification_.objects.create(receiver=user,
                                                    content_object=user,
                                                    content="You have a new comment on your profile. Please click to check it."
                                                    )
        notfications.save()
        result.save()
        return result


class PropertyReplyCreate(serializers.ModelSerializer):
    class Meta:
        model = comments
        fields = ('sender_id', 'content', 'comments', 'object_id', 'receiver_id')
        read_only_fields = ('sender_id', 'comments', 'object_id', 'receiver_id')

    def validate(self, data):

        request = self.context.get('request')
        user = request.user
        comment_id = request.parser_context.get('kwargs').get('id')
        parent_comment = comments.objects.filter(base_comment=comment_id).order_by("-created_time").first()
        p_receiver = comments.objects.filter(id=comment_id).first().receiver
        if parent_comment is not None:
            p_receiver = parent_comment.receiver

        if user != p_receiver:
            raise serializers.ValidationError({'errors': 'you are not allowed to reply to this post'})

        content = data.get('content')
        if not content:
            raise serializers.ValidationError({'content': 'you have to write something'})

        return data

    def create(self, validated_data):
        content = validated_data['content']
        request = self.context.get('request')
        comment_id = request.parser_context.get('kwargs').get('id')
        parent_comment = comments.objects.filter(id=comment_id).first()
        base_commenet = comments.objects.filter(id=comment_id).first().base_comment
        p_owner = parent_comment.sender
        p_content_object = parent_comment.content_object

        if base_commenet is None:
            result = comments.objects.create(sender=self.context.get('request').user,
                                             content=content,
                                             content_object=p_content_object,
                                             receiver=p_owner,
                                             comments=False,
                                             base_comment=parent_comment
                                             )
        else:
            result = comments.objects.create(sender=self.context.get('request').user,
                                             content=content,
                                             content_object=p_content_object,
                                             receiver=p_owner,
                                             comments=False,
                                             base_comment=base_commenet
                                             )

        notfications = notification_.objects.create(receiver=p_owner,
                                                    content_object=p_content_object,
                                                    content="You have a new reply on your property. Please click to check it."
                                                    )
        notfications.save()
        result.save()
        return result


class UserReplyCreate(serializers.ModelSerializer):
    class Meta:
        model = comments
        fields = ('sender_id', 'content', 'comments', 'object_id', 'receiver_id')
        read_only_fields = ('sender_id', 'comments', 'object_id', 'receiver_id')

    def validate(self, data):

        request = self.context.get('request')
        user = request.user
        comment_id = request.parser_context.get('kwargs').get('id')
        parent_comment = comments.objects.filter(base_comment=comment_id).order_by("-created_time").first()
        p_receiver = comments.objects.filter(id=comment_id).first().receiver
        if parent_comment is not None:
            p_receiver = parent_comment.receiver

        if user != p_receiver:
            raise serializers.ValidationError({'errors': 'you are not allowed to reply to this post'})

        content = data.get('content')
        if not content:
            raise serializers.ValidationError({'content': 'you have to write something'})

        return data

    def create(self, validated_data):
        content = validated_data['content']
        request = self.context.get('request')
        comment_id = request.parser_context.get('kwargs').get('id')
        parent_comment = comments.objects.filter(id=comment_id).first()
        base_comment = comments.objects.filter(id=comment_id).first().base_comment
        p_owner = parent_comment.sender
        p_content_object = parent_comment.content_object

        if base_comment is None:
            result = comments.objects.create(sender=self.context.get('request').user,
                                             content=content,
                                             content_object=p_content_object,
                                             receiver=p_owner,
                                             comments=False,
                                             base_comment=parent_comment
                                             )
        else:
            result = comments.objects.create(sender=self.context.get('request').user,
                                             content=content,
                                             content_object=p_content_object,
                                             receiver=p_owner,
                                             comments=False,
                                             base_comment=base_comment
                                             )

        notfications = notification_.objects.create(receiver=p_owner,
                                                    content_object=p_content_object,
                                                    content="You have a new reply on your profile. Please click to check it."
                                                    )
        notfications.save()
        parent_comment.save()
        result.save()
        return result
