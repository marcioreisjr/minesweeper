from django.db import models
from django.conf import settings

# Create your models here.


class GameScoring(models.Model):
    player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="scoring",
        on_delete=models.CASCADE,
    )
    timing = models.PositiveIntegerField(null=True)
    board_size = models.PositiveSmallIntegerField(null=True)
