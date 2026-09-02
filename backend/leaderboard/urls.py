from django.urls import path
from .views import AwardActionView, LeaderboardDashboardView, LeaderboardFullView, MyPointsView

urlpatterns = [
    path('dashboard/', LeaderboardDashboardView.as_view(), name='leaderboard-dashboard'),
    path('my-points/', MyPointsView.as_view(), name='leaderboard-my-points'),
    path('award-action/', AwardActionView.as_view(), name='leaderboard-award-action'),
    path('', LeaderboardFullView.as_view(), name='leaderboard-full'),
]
