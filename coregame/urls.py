from django.urls import path
from coregame.views import play

urlpatterns = [
    path("play/", play, name='play'),
]
