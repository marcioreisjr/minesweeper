from django.contrib import admin
from coregame.models import GameScoring


@admin.register(GameScoring)
class GameScoringAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "player",
        "timing",
        "board_size",
    ]
