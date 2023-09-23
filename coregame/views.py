from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def play(request):
    context = {
        "player": request.user.username,
    }
    return render(request, "coregame/play.html", context)
