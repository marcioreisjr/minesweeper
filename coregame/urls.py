from django.urls import path
from coregame.views import play, get_scores, set_score

urlpatterns = [
    path("play/", play, name="play"),
    path("get_scores/", get_scores, name="get_scores"),
    path("set_score/<str:score>/", set_score, name="set_score"),
]
