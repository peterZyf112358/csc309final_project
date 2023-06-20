from rest_framework.serializers import ModelSerializer
from .models import notifications
from accounts.models import User
from rest_framework import serializers

class NotificationsSerializer(ModelSerializer):
    class Meta:
        model = notifications
        fields = ['id', 'receiver_id', 'content', 'object_id', 'content_type']