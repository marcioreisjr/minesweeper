from urllib.request import Request
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from coregame.models import GameScoring
import json

ALLOWED_SIZES = [7, 10, 12, 15, 20]


@api_view(["GET"])
def get_scores(request: Request) -> JsonResponse:
    """
    Return a list of scores, a dict with player name, timing in seconds and
    board size.
    """
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
    return JsonResponse({"err": None, "scores": out}, status=200)


@login_required
@api_view(["PUT"])
def set_score(request: Request, board: int) -> JsonResponse:
    """
    Update the best score if the newer timing is smaller than the best timing
    on the database and return the "accepted" attribute set to True, otherwise
    return the "accepted" attribute set to False.

    Returns a dict {"err": None, "accepted": False}. Provide any error message
    in case of having any error.
    """
    if board not in ALLOWED_SIZES:
        return JsonResponse(
            {"err:": "Invalid board size", "accepted": False}, status=400
        )
    try:
        content = json.loads(request.body)
        score = GameScoring.objects.get(board_size=board)
    except GameScoring.DoesNotExist:
        GameScoring.objects.create(
            **{
                "timing": content["timing"],
                "board_size": board,
                "player_id": request.user.id,
            }
        )
        return JsonResponse({"err": None, "accepted": True}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"err": "Bad Request", "accepted": False},
                            status=400)
    if content["timing"] == 0:
        # there is a very small chance to get timing=0, on this case reject it.
        return JsonResponse({"err": "Bad score", "accepted": False},
                            status=400)
    if content["timing"] < score.timing:
        # Update score
        GameScoring.objects.filter(board_size=board).update(
            timing=content["timing"],
            player=User.objects.get(id=request.user.id),
        )
        return JsonResponse({"err": None, "accepted": True}, status=200)
    return JsonResponse({"err": None, "accepted": False}, status=200)
