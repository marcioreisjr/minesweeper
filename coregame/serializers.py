from rest_framework import serializers
from .models import GameScoring


class GameScoringSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameScoring
        fields = ['id', 'player', 'timing', 'board_size']
