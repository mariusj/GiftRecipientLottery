from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^add_wish$', views.add_wish, name='add_wish'),
    url(r'^draw$', views.draw, name='draw'),
]
