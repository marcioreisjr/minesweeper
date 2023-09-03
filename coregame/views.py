from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# from coregame.models import GameScoring

# Create your views here.


@login_required
def play(request):
    # player = GameScoring.objects.filter(player=request.user)
    context = {
        "player": request.user.username,
    }
    return render(request, "coregame/play.html", context)
