from pathlib import Path

from django.conf import settings
from django.http import FileResponse
from docxtpl import DocxTemplate
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone

from .models import Assignment, AssignmentTemplate, Note, CTQuestion, JobPosting
from .serializers import NoteSerializer, CTQuestionSerializer, JobPostingSerializer
from .permissions import CanUploadNote


ASSIGNMENT_TEMPLATE_DEFAULTS = {
    'reportTitle': 'LAB REPORT',
    'university': 'Bangladesh University of Business and Technology',
    'experimentDate': '24/06/2026',
    'experimentNo': '01',
    'courseTitle': 'Principles Of Economics',
    'courseCode': 'ECO 101',
    'experimentName': 'abcd',
    'studentName': 'Shamim Hoshen',
    'studentId': '267',
    'intake': '51',
    'section': '6',
    'program': 'B.Sc. in CSE',
    'facultyName': 'Mr. Sudipto Chaki',
    'facultyDesignation': 'Assistant Professor',
    'facultyDepartment': 'CSE',
    'submissionDate': '25/06/2026',
}


def get_assignment_template_path():
    active_template = AssignmentTemplate.objects.filter(is_active=True).first()
    if active_template and active_template.template_file:
        return Path(active_template.template_file.path)
    return Path(settings.MEDIA_ROOT) / 'assignment_templates' / 'assignment.docx'


def fill_assignment_docx(template_path, values):
    merged = {**ASSIGNMENT_TEMPLATE_DEFAULTS, **values}

    # template এর placeholder নামের সাথে exact match
    context = {
        'exp_date':             merged['experimentDate'],
        'exp_no':               merged['experimentNo'],
        'course_title':         merged['courseTitle'],
        'course_code':          merged['courseCode'],
        'exp_name':             merged['experimentName'],
        'student_name':         merged['studentName'],
        'student_id':           merged['studentId'],
        'intake':               merged['intake'],
        'section':              merged['section'],
        'program':              merged['program'],
        'teacher_name':         merged['facultyName'],
        'teacher_designation':  merged['facultyDesignation'],
        'teacher_dept':         merged['facultyDepartment'],
        'submission_date':      merged['submissionDate'],
    }

    output = settings.BASE_DIR / 'media' / 'generated_assignments' / f"assignment-cover-{merged['studentId'] or 'student'}.docx"
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = DocxTemplate(template_path)
    doc.render(context)
    doc.save(output)
    return str(output)


class NoteListCreateView(generics.ListCreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [CanUploadNote]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class NoteDetailView(generics.RetrieveDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]


class CTQuestionListCreateView(generics.ListCreateAPIView):
    queryset = CTQuestion.objects.all()
    serializer_class = CTQuestionSerializer
    permission_classes = [CanUploadNote]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CTQuestionDetailView(generics.RetrieveDestroyAPIView):
    queryset = CTQuestion.objects.all()
    serializer_class = CTQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPosting.objects.filter(status='approved')

    def perform_create(self, serializer):
        serializer.save(
            posted_by=self.request.user,
            status='pending',
        )


class JobMySubmissionsView(generics.ListAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPosting.objects.filter(posted_by=self.request.user)


class JobDetailView(generics.RetrieveAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return JobPosting.objects.all()
        return JobPosting.objects.filter(
            Q(status='approved') | Q(posted_by=user)
        )


class AdminJobListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.query_params.get('status')
        qs = JobPosting.objects.all()
        if status_filter:
            qs = qs.filter(status=status_filter)

        serializer = JobPostingSerializer(qs, many=True)
        pending_count = JobPosting.objects.filter(status='pending').count()

        return Response({
            'pending_count': pending_count,
            'jobs': serializer.data,
        })


class AdminJobReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = JobPosting.objects.get(pk=pk)
        except JobPosting.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action not in ('approve', 'reject'):
            return Response({'detail': 'action must be approve or reject'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            job.status = 'approved'
            job.rejection_reason = ''
        else:
            job.status = 'rejected'
            job.rejection_reason = request.data.get('rejection_reason', 'Does not meet posting guidelines.')

        job.reviewed_by = request.user
        job.reviewed_at = timezone.now()
        job.save()

        return Response(JobPostingSerializer(job).data)


class AssignmentCoverGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        active_template = AssignmentTemplate.objects.filter(is_active=True).first()
        template_path = (
            Path(active_template.template_file.path)
            if active_template and active_template.template_file
            else get_assignment_template_path()
        )

        if not template_path.exists():
            return Response(
                {'detail': 'Assignment template file not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        generated_path = fill_assignment_docx(template_path, request.data)
        filename = f"assignment-cover-{request.data.get('studentId', 'student')}.docx"

        Assignment.objects.create(
            student=request.user,
            template=active_template,
            course_title=request.data.get('courseTitle', ''),
            course_code=request.data.get('courseCode', ''),
            experiment_name=request.data.get('experimentName', ''),
            generated_file=f"generated_assignments/{filename}",
        )

        return FileResponse(
            open(generated_path, 'rb'),
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )