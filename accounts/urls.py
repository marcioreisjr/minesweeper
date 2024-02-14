from django.urls import path
from accounts.views import (
    user_login,
    user_logout,
    user_signup,
    user_delete,
    user_change_pwd,
    MinePasswordResetConfirmView,
)
from accounts.forms import ReqResetPassForm
from django.contrib.auth.views import (
    PasswordResetView,
    PasswordResetDoneView,
    PasswordResetCompleteView,
)

urlpatterns = [
    path("login/", user_login, name="login"),
    path("logout/", user_logout, name="logout"),
    path("signup/", user_signup, name="signup"),
    path("delete/", user_delete, name="delete"),
    path("user_change_pwd/", user_change_pwd, name="user_change_pwd"),
    path(
        "password-reset/",
        PasswordResetView.as_view(
            template_name="accounts/password_reset.html",
            html_email_template_name="accounts/password_reset_email.html",
            form_class=ReqResetPassForm,
        ),
        name="password-reset",
    ),
    path(
        "password-reset/done/",
        PasswordResetDoneView.as_view(
            template_name="accounts/password_reset_done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        MinePasswordResetConfirmView.as_view(
            template_name="accounts/password_reset_confirm.html"
        ),
        name="password_reset_confirm",
    ),
    path(
        "password-reset-complete/",
        PasswordResetCompleteView.as_view(
            template_name="accounts/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),
]
