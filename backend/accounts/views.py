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

from .models import User, FeaturePermission, EmailOTP
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    AdminStudentSerializer,
    FeaturePermissionSerializer,
)


class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(university_email=email).exists():
            return Response({"error": "Email is already registered"}, status=status.HTTP_400_BAD_REQUEST)

        otp = f"{random.randint(100000, 999999)}"
        EmailOTP.objects.update_or_create(
            email=email,
            defaults={'otp': otp, 'created_at': timezone.now()}
        )

        send_mail(
            "Your CampusConnect Verification Code",
            f"Your OTP code is: {otp}\nIt is valid for 5 minutes.",
            "noreply@campusconnect.edu.bd",
            [email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent successfully"})


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = EmailOTP.objects.get(email=email)
        except EmailOTP.DoesNotExist:
            return Response({"error": "No OTP requested for this email"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > record.created_at + timedelta(minutes=5):
            return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)

        if record.otp != str(otp):
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "OTP verified"})


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("university_email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required for registration"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = EmailOTP.objects.get(email=email)
            if timezone.now() > record.created_at + timedelta(minutes=5):
                return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)
            if record.otp != str(otp):
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        except EmailOTP.DoesNotExist:
            return Response({"error": "OTP not found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        response = super().create(request, *args, **kwargs)
        
        EmailOTP.objects.filter(email=email).delete()

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


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from academic.models import Note, JobPosting
        from blood_donation.models import BloodRequest, CommunityPost
        from django.utils import timezone
        from datetime import timedelta
        
        total_notes = Note.objects.count()
        total_jobs = JobPosting.objects.count()
        total_posts = CommunityPost.objects.count()
        total_blood_requests = BloodRequest.objects.count()

        # Gather recent activity
        activities = []
        for note in Note.objects.order_by('-created_at')[:3]:
            activities.append({"id": f"note_{note.id}", "title": note.title, "type": "academic", "time": note.created_at.isoformat()})
        for job in JobPosting.objects.order_by('-created_at')[:3]:
            activities.append({"id": f"job_{job.id}", "title": job.title, "type": "career", "time": job.created_at.isoformat()})
        for req in BloodRequest.objects.order_by('-created_at')[:3]:
            activities.append({"id": f"blood_{req.id}", "title": f"Blood Required: {req.blood_group}", "type": "community", "time": req.created_at.isoformat()})
        for post in CommunityPost.objects.order_by('-created_at')[:3]:
            activities.append({"id": f"post_{post.id}", "title": post.content[:30] + ("..." if len(post.content) > 30 else ""), "type": "community", "time": post.created_at.isoformat()})
        
        # Sort by time descending and take top 4
        activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = activities[:4]

        today = timezone.now().date()
        graph_data = []
        for i in range(11, -1, -1):
            day = today - timedelta(days=i)
            c1 = Note.objects.filter(created_at__date=day).count()
            c2 = JobPosting.objects.filter(created_at__date=day).count()
            c3 = BloodRequest.objects.filter(created_at__date=day).count()
            c4 = CommunityPost.objects.filter(created_at__date=day).count()
            graph_data.append(c1 + c2 + c3 + c4)

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