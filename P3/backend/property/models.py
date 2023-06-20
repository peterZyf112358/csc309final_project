from django.db import models
from comments.models import comments
from django.contrib.contenttypes.fields import GenericRelation

class property(models.Model):
    owner = models.ForeignKey('accounts.User', null=False, on_delete=models.CASCADE, related_name='property')
    address = models.CharField(max_length=300, null=False)
    comments = GenericRelation(comments)
    rating = models.FloatField(default=0, null=False, blank=True)
    available_start = models.DateField(default=None, blank=False, null=False)
    available_end = models.DateField(default=None, blank=False, null=False)
    amenities = models.CharField(null=True, blank=True, max_length=500)
    image_cover = models.ImageField(null=False, blank=False, upload_to='property')
    num_guest = models.IntegerField(null=False, blank=False)
    description = models.TextField(null=False, blank=False, default="No descriptions available")
    price = models.FloatField(null=False)
    num_bed = models.IntegerField(null=False)
    num_bath = models.IntegerField(null=False)

class PropImage(models.Model):
    prop = models.ForeignKey(property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=False, blank=False, upload_to='property', default=None)