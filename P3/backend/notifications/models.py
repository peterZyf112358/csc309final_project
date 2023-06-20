from django.db import models
from accounts.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class notifications(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=150)
    created_time = models.DateTimeField(auto_now_add=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object=GenericForeignKey('content_type', 'object_id')