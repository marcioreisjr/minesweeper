from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from coregame.models import GameScoring

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
        out.append({
            "player": score.player.username,
            "timing": score.timing,
            "board_size": score.board_size,
        })
    return Response(out)


# @login_required
# @api_view()
# def set_score(request):
#     out = {"error": "", "accepted": False}
#     score = {
#             "player": "none",
#             "timing": 1000,
#             "board_size": 7,
#         }
#     if score["board_size"] not in ALLOWED_SIZES:
#         out["error"] = "Invalid board size"
#         return Response(out)
#     curr = GameScoring.objects.get(board_size=score["board_size"])
#     if curr is None:
#         gameScoring = GameScoring()
#     gameScoring.timing = score["timing"]
#     gameScoring.board_size = score["board_size"]
#     gameScoring.player.username = score["player"]
#     return Response(out)
