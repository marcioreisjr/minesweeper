from django.shortcuts import render
# from coregame.models import GameScoring

# Create your views here.


def play(request):
    # player = GameScoring.objects.filter(player=request.user)
    context = {
        "player": request.user,
    }
    return render(request, "coregame/play.html", context)
