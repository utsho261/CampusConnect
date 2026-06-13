from django.contrib import admin
from .models import Assignment, AssignmentTemplate, CTQuestion, JobPosting, Note

admin.site.register(Note)
admin.site.register(CTQuestion)
admin.site.register(JobPosting)
admin.site.register(AssignmentTemplate)
admin.site.register(Assignment)
