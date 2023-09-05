from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from accounts.forms import LoginForm, SignUpForm, UpdatePassForm
from django.contrib.auth.models import User

# Create your views here.


def user_login(request):
    context = {}
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(
                request,
                username=username,
                password=password,
            )
            if user is not None:
                login(request, user)
                return redirect("play")
            else:
                context["show_badge"] = {"msg": "Invalid credentials"}
    else:
        form = LoginForm()
    context["form"] = form
    return render(request, "accounts/login.html", context)


def user_logout(request):
    logout(request)
    return redirect("login")


def user_signup(request):
    context = {}
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            usename = form.cleaned_data['username']
            password = form.cleaned_data['password']
            password_confirmation = form.cleaned_data['password_confirmation']
            if password == password_confirmation:
                user = User.objects.create_user(
                    usename,
                    password=password)
                login(request, user)
                return redirect("play")
            else:
                context["show_badge"] = {"msg": "The passwords do not match"}
    else:
        form = SignUpForm()
    context["form"] = form
    return render(request, "accounts/signup.html", context)


@login_required
def user_delete(request):
    if request.method == "POST":
        request.user.delete()
        return redirect("signup")
    return render(request, "accounts/delete.html", None)


@login_required
def user_change_pwd(request):
    context = {}
    if request.method == "POST":
        form = UpdatePassForm(request.POST)
        if form.is_valid():
            user = request.user
            password = form.cleaned_data['password']
            new_password = form.cleaned_data['new_password']
            password_confirmation = form.cleaned_data['password_confirmation']
            if user.check_password(password):
                if new_password == password_confirmation:
                    user.set_password(new_password)
                    user.save()
                    return render(request, "coregame/play.html", context={
                        "show_badge": {
                            "msg": "Successfully updated the password", }
                    })
                else:
                    context["show_badge"] = {
                        "msg": "The passwords do not match"}
            else:
                context["show_badge"] = {"msg": "Invalid credentials"}
        else:
            context["show_badge"] = {"msg": "Invalid credentials"}
    else:
        form = UpdatePassForm()
    context["form"] = form
    return render(request, "accounts/user_change_pwd.html", context)
