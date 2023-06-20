from django.db import models
from accounts.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from property.models import property

class reservations(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservation_as_host")
    reserver = models.ForeignKey(User, on_delete=models.CASCADE)
    property = models.ForeignKey(property, on_delete=models.CASCADE)
    reserve_time = models.DateTimeField(auto_now_add=True)
    price = models.FloatField(null=False)
    start_day = models.DateField()
    end_day = models.DateField()
    status = models.CharField(max_length=100)
    notified = models.BooleanField(default=False)
