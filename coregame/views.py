from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from coregame.models import GameScoring
import json

ALLOWED_SIZES = [7, 10, 12, 15, 20]


@login_required
def play(request):
    context = {
        "player": request.user.username,
    }
    return render(request, "coregame/play.html", context)


@api_view()
def get_scores(request):
    out = []
    scores = GameScoring.objects.all()
    for score in scores:
        if score.board_size not in ALLOWED_SIZES:
            continue
        out.append(
            {
                "player": score.player.username,
                "timing": score.timing,
                "board_size": score.board_size,
            }
        )
    return Response(out)


@login_required
@api_view(["GET"])
def set_score(request, score):
    data = None
    new_entry = False
    if request.method != "GET":
        return JsonResponse({"err": "Invalid query method", "accepted": False})
    try:
        data = json.loads(score)
    except json.JSONDecodeError as err:
        return JsonResponse({"err": str(err), "accepted": False})
    if data["board_size"] not in ALLOWED_SIZES:
        return JsonResponse({"err": "Invalid board size", "accepted": False})
    try:
        higherScore = GameScoring.objects.get(board_size=data["board_size"])
    except GameScoring.DoesNotExist:
        higherScore = GameScoring(board_size=data["board_size"])
        new_entry = True
    out = {"err": None, "accepted": False}
    if new_entry or data["timing"] < higherScore.timing:
        higherScore.timing = data["timing"]
        higherScore.player_id = request.user.id
        higherScore.save()
        out["accepted"] = True
    return JsonResponse(out)
