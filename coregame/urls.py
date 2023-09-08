from django.urls import path
from coregame.views import play, get_scores

urlpatterns = [
    path("play/", play, name='play'),
    path("get_scores/", get_scores, name='get_scores'),
]
