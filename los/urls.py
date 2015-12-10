from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^add_wish$', views.add_wish, name='add_wish'),
    url(r'^draw$', views.draw, name='draw'),
    url(r'^wish_remove/(?P<wish_id>[0-9]+)$', views.wish_remove, name='wish_remove'),
]
