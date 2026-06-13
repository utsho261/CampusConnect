from django.urls import path

from .views import (
    NoteListCreateView,
    NoteDetailView,
    CTQuestionListCreateView,
    CTQuestionDetailView,
    JobListCreateView,
    JobMySubmissionsView,
    JobDetailView,
    AdminJobListView,
    AdminJobReviewView,
    AssignmentCoverGenerateView,
)

urlpatterns = [
    path(
        'notes/',
        NoteListCreateView.as_view()
    ),

    path(
        'notes/<int:pk>/',
        NoteDetailView.as_view()
    ),

    path(
        'ct-questions/',
        CTQuestionListCreateView.as_view()
    ),

    path(
        'ct-questions/<int:pk>/',
        CTQuestionDetailView.as_view()
    ),

    path(
        'jobs/',
        JobListCreateView.as_view()
    ),

    path(
        'jobs/mine/',
        JobMySubmissionsView.as_view()
    ),

    path(
        'jobs/<int:pk>/',
        JobDetailView.as_view()
    ),

    path(
        'admin/jobs/',
        AdminJobListView.as_view()
    ),

    path(
        'admin/jobs/<int:pk>/review/',
        AdminJobReviewView.as_view()
    ),

    path(
        'assignment-cover/generate/',
        AssignmentCoverGenerateView.as_view()
    ),
]
