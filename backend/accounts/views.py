from datetime import timedelta

from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.core.mail import send_mail

from .models import User, FeaturePermission
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    AdminStudentSerializer,
    FeaturePermissionSerializer,
)



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("university_email")

        if not email:
            return Response({"error": "Email is required for registration"}, status=status.HTTP_400_BAD_REQUEST)

        response = super().create(request, *args, **kwargs)

        return response


class StudentLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        student_id = request.data.get("student_id")
        password = request.data.get("password")

        if not student_id or not password:
            return Response(
                {"error": "Student ID and Password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(student_id=student_id)

            if user.role == 'admin':
                return Response(
                    {"error": "Admins must use the admin login page."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if user.is_blocked:
                return Response(
                    {"error": "This student account has been blocked."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if user.max_usage_limit > 0 and user.login_count >= user.max_usage_limit:
                return Response(
                    {"error": "Student login limit reached for this account."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not user.check_password(password):
                return Response(
                    {"error": "Invalid Password"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            refresh = RefreshToken.for_user(user)
            user.login_count += 1
            user.last_login = timezone.now()
            user.save(update_fields=["login_count", "last_login"])

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "student_id": user.student_id,
                "role": user.role,
            })

        except User.DoesNotExist:
            return Response(
                {"error": "Student ID not found"},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminLoginView(APIView):
    """Admin login via username + password. Rejects non-admin roles."""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and Password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.role != "admin":
            return Response(
                {"error": "Access denied. This login is for administrators only."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role,
        })


class AdminStudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        students = User.objects.filter(role='student').order_by('-last_login')
        active_students = students.filter(last_login__gte=timezone.now() - timedelta(hours=24)).count()
        blocked_students = students.filter(is_blocked=True).count()
        total_students = students.count()

        serializer = AdminStudentSerializer(students, many=True)

        return Response({
            "total_students": total_students,
            "active_students": active_students,
            "blocked_students": blocked_students,
            "students": serializer.data,
        })


class AdminStudentControlView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if request.user.role != 'admin':
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = User.objects.get(id=user_id, role='student')
        except User.DoesNotExist:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        if 'is_blocked' in request.data:
            student.is_blocked = bool(request.data.get('is_blocked'))

        if 'max_usage_limit' in request.data:
            try:
                student.max_usage_limit = int(request.data.get('max_usage_limit'))
            except (TypeError, ValueError):
                return Response({"detail": "Invalid max_usage_limit"}, status=status.HTTP_400_BAD_REQUEST)

        student.save()
        return Response(AdminStudentSerializer(student).data)


class AdminStudentPermissionsView(APIView):
    """GET all feature permissions for a student; PATCH to bulk-update them."""
    permission_classes = [IsAuthenticated]

    def _ensure_admin(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return None

    def _get_student(self, user_id):
        try:
            return User.objects.get(id=user_id, role="student")
        except User.DoesNotExist:
            return None

    def _ensure_all_permissions_exist(self, student):
        """Create missing FeaturePermission rows so every feature is visible."""
        existing_keys = set(
            student.feature_permissions.values_list("feature_key", flat=True)
        )
        to_create = []
        for key, _label in FeaturePermission.FEATURE_CHOICES:
            if key not in existing_keys:
                to_create.append(
                    FeaturePermission(student=student, feature_key=key)
                )
        if to_create:
            FeaturePermission.objects.bulk_create(to_create)

    def get(self, request, user_id):
        err = self._ensure_admin(request)
        if err:
            return err

        student = self._get_student(user_id)
        if student is None:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        self._ensure_all_permissions_exist(student)
        perms = student.feature_permissions.all()
        return Response(FeaturePermissionSerializer(perms, many=True).data)

    def patch(self, request, user_id):
        """
        Expects JSON body like:
        {
            "permissions": [
                {"feature_key": "notes", "is_allowed": false, "daily_limit": 5},
                ...
            ]
        }
        """
        err = self._ensure_admin(request)
        if err:
            return err

        student = self._get_student(user_id)
        if student is None:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        self._ensure_all_permissions_exist(student)

        updates = request.data.get("permissions", [])
        for item in updates:
            fk = item.get("feature_key")
            if not fk:
                continue
            try:
                perm = FeaturePermission.objects.get(student=student, feature_key=fk)
            except FeaturePermission.DoesNotExist:
                continue

            if "is_allowed" in item:
                perm.is_allowed = bool(item["is_allowed"])
            if "daily_limit" in item:
                try:
                    perm.daily_limit = max(0, int(item["daily_limit"]))
                except (TypeError, ValueError):
                    pass
            perm.save()

        perms = student.feature_permissions.all()
        return Response(FeaturePermissionSerializer(perms, many=True).data)


class StudentPermissionsView(APIView):
    """Students fetch their own feature permissions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Auto-create missing permission rows (all allowed by default)
        existing_keys = set(
            user.feature_permissions.values_list("feature_key", flat=True)
        )
        to_create = []
        for key, _label in FeaturePermission.FEATURE_CHOICES:
            if key not in existing_keys:
                to_create.append(
                    FeaturePermission(student=user, feature_key=key)
                )
        if to_create:
            FeaturePermission.objects.bulk_create(to_create)

        perms = user.feature_permissions.all()
        data = {}
        for p in perms:
            data[p.feature_key] = {
                "is_allowed": p.is_allowed,
                "daily_limit": p.daily_limit,
                "usage_count": p.usage_count,
            }
        return Response(data)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data
        import base64
        from django.core.files.base import ContentFile
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'university_email' in data:
            user.university_email = data['university_email']
        if 'blood_group' in data:
            user.blood_group = data['blood_group']
        if 'bio' in data:
            user.bio = data['bio']
            
        def process_base64_image(base64_str, filename):
            if base64_str and ';base64,' in base64_str:
                format, imgstr = base64_str.split(';base64,') 
                ext = format.split('/')[-1].split(';')[0]
                return ContentFile(base64.b64decode(imgstr), name=f'{filename}.{ext}')
            return None

        if 'profile_picture' in data and data['profile_picture']:
             file = process_base64_image(data['profile_picture'], f"profile_{user.id}")
             if file: user.profile_picture = file
             
        if 'cover_photo' in data and data['cover_photo']:
             file = process_base64_image(data['cover_photo'], f"cover_{user.id}")
             if file: user.cover_photo = file
             
        # Verification fields
        if 'id_front' in request.FILES:
             user.id_front = request.FILES['id_front']
        elif 'id_front' in data and data['id_front']:
             file = process_base64_image(data['id_front'], f"id_front_{user.id}")
             if file: user.id_front = file
             
        if 'id_back' in request.FILES:
             user.id_back = request.FILES['id_back']
        elif 'id_back' in data and data['id_back']:
             file = process_base64_image(data['id_back'], f"id_back_{user.id}")
             if file: user.id_back = file
             
        if 'semester' in data:
             user.semester = data['semester']
        if 'department' in data:
             user.department = data['department']
        if 'intake' in data:
             user.intake = data['intake']
             
        if 'verified' in data:
             user.verified = str(data['verified']).lower() == 'true'

        user.save()
        return Response(ProfileSerializer(user).data)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from academic.models import Note, JobPosting
        from blood_donation.models import BloodRequest, CommunityPost
        from django.utils import timezone
        from datetime import timedelta

        # Efficient single queries for counts
        total_notes = Note.objects.count()
        total_jobs = JobPosting.objects.filter(status='approved').count()
        total_posts = CommunityPost.objects.count()
        total_blood_requests = BloodRequest.objects.count()

        # Gather recent activity — only fetch needed fields
        activities = []
        for note in Note.objects.only('id', 'title', 'created_at').order_by('-created_at')[:3]:
            activities.append({"id": f"note_{note.id}", "title": note.title, "type": "academic", "time": note.created_at.isoformat()})
        for job in JobPosting.objects.only('id', 'title', 'created_at').filter(status='approved').order_by('-created_at')[:3]:
            activities.append({"id": f"job_{job.id}", "title": job.title, "type": "career", "time": job.created_at.isoformat()})
        for req in BloodRequest.objects.only('id', 'blood_group', 'created_at').order_by('-created_at')[:3]:
            activities.append({"id": f"blood_{req.id}", "title": f"Blood Required: {req.blood_group}", "type": "community", "time": req.created_at.isoformat()})
        for post in CommunityPost.objects.only('id', 'content', 'created_at').order_by('-created_at')[:3]:
            activities.append({"id": f"post_{post.id}", "title": post.content[:30] + ("..." if len(post.content) > 30 else ""), "type": "community", "time": post.created_at.isoformat()})

        activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = activities[:4]

        # Graph data: last 12 days
        today = timezone.now().date()
        graph_data = []
        for i in range(11, -1, -1):
            day = today - timedelta(days=i)
            c = (
                Note.objects.filter(created_at__date=day).count()
                + JobPosting.objects.filter(created_at__date=day).count()
                + BloodRequest.objects.filter(created_at__date=day).count()
                + CommunityPost.objects.filter(created_at__date=day).count()
            )
            graph_data.append(c)

        # Fallback to demo data if nothing was created recently
        if sum(graph_data) == 0:
            graph_data = [40, 60, 30, 80, 50, 90, 70, 100, 40, 60, 85, 45]

        return Response({
            "total_notes": total_notes,
            "total_jobs": total_jobs,
            "total_posts": total_posts,
            "total_blood_requests": total_blood_requests,
            "recent_activity": recent_activity,
            "graph_data": graph_data
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({"error": "Both current and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(current_password):
            return Response({"error": "Invalid current password."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)