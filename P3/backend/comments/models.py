from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models


class comments(models.Model):
    sender = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name="sent_comments")
    content = models.CharField(max_length=150,)
    created_time = models.DateTimeField(auto_now_add=True)
    comments = models.BooleanField(default=False)
    base_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='base_commenet')
    rating = models.IntegerField(null=True, blank=True, default=None)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    receiver = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name="received_comments")
    content_object = GenericForeignKey('content_type', 'object_id')
