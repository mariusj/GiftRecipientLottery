from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class Wish(models.Model):
    name = models.CharField(max_length=100)
    person = models.ForeignKey(User)
    
    def __unicode__(self):
        return self.name


class Choice(models.Model):
    buyer = models.ForeignKey(User, related_name="buyer")
    receiver = models.ForeignKey(User, related_name="receiver")

    def __unicode__(self):
        return self.buyer.username + " -> " + self.receiver.username
