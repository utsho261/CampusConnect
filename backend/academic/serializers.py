from rest_framework import serializers
from .models import Note, CTQuestion, JobPosting


class NoteSerializer(serializers.ModelSerializer):

    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Note
        fields = [
            'id',
            'title',
            'subject',
            'department',
            'intake',
            'description',
            'pdf_file',
            'uploaded_by',
            'created_at',
            'updated_at',
        ]


class CTQuestionSerializer(serializers.ModelSerializer):

    uploaded_by = serializers.StringRelatedField(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CTQuestion
        fields = [
            'id',
            'title',
            'course',
            'department',
            'intake',
            'total_questions',
            'difficulty',
            'description',
            'pdf_file',
            'file_url',
            'uploaded_by',
            'created_at',
            'updated_at',
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        if obj.pdf_file:
            return obj.pdf_file.url
        return None


class JobPostingSerializer(serializers.ModelSerializer):

    posted_by = serializers.StringRelatedField(read_only=True)
    reviewed_by = serializers.StringRelatedField(read_only=True)
    apply_link = serializers.URLField(required=False, allow_blank=True)
    apply_email = serializers.EmailField(required=False, allow_blank=True)
    deadline = serializers.DateField(required=False, allow_null=True)
    department = serializers.CharField(required=False, allow_blank=True)
    salary_range = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = JobPosting
        fields = [
            'id',
            'title',
            'company_name',
            'job_type',
            'department',
            'location',
            'work_mode',
            'salary_range',
            'deadline',
            'description',
            'requirements',
            'apply_link',
            'apply_email',
            'contact_phone',
            'status',
            'rejection_reason',
            'posted_by',
            'reviewed_by',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'status',
            'rejection_reason',
            'posted_by',
            'reviewed_by',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict):
            cleaned = dict(data)
            for key in ('apply_link', 'apply_email', 'department', 'salary_range', 'contact_phone', 'deadline'):
                if cleaned.get(key) == '':
                    cleaned[key] = None if key == 'deadline' else ''
            apply_link = (cleaned.get('apply_link') or '').strip()
            if apply_link and not apply_link.startswith(('http://', 'https://')):
                cleaned['apply_link'] = f'https://{apply_link}'
            data = cleaned
        return super().to_internal_value(data)

    def validate(self, data):
        for field in ('apply_link', 'apply_email', 'department', 'salary_range', 'contact_phone'):
            if field in data and data[field] is None:
                data[field] = ''

        apply_link = (data.get('apply_link') or '').strip()
        apply_email = (data.get('apply_email') or '').strip()
        if not apply_link and not apply_email:
            raise serializers.ValidationError(
                'Provide at least an apply link or apply email.'
            )
        data['apply_link'] = apply_link
        data['apply_email'] = apply_email
        return data