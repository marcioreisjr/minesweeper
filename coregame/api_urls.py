from django.urls import path
from coregame.api_views import get_scores, set_score

urlpatterns = [
    path("", get_scores, name="get_scores"),
    path("<int:board>/", set_score, name="set_score"),
]
