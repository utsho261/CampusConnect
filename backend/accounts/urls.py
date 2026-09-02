from django.urls import path
from .views import (
    RegisterView,
    StudentLoginView,
    AdminLoginView,
    ProfileView,
    AdminStudentStatsView,
    AdminStudentControlView,
    AdminStudentPermissionsView,
    StudentPermissionsView,
    DashboardStatsView,
    ChangePasswordView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", StudentLoginView.as_view()),
    path("admin-login/", AdminLoginView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("admin/student-usage/", AdminStudentStatsView.as_view()),
    path("admin/student-control/<int:user_id>/", AdminStudentControlView.as_view()),
    path("admin/student-permissions/<int:user_id>/", AdminStudentPermissionsView.as_view()),
    path("student/my-permissions/", StudentPermissionsView.as_view()),
    path("dashboard/stats/", DashboardStatsView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]