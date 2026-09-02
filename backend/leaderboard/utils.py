from .models import PointLog, ImpactProfile

POINT_RULES = {
    'note_upload': {
        'category': 'academic',
        'action_name': 'Useful note uploaded',
        'points': 10,
    },
    'blood_donation': {
        'category': 'community',
        'action_name': 'Blood donation recorded',
        'points': 50,
    },
    'blood_request_post': {
        'category': 'community',
        'action_name': 'Blood request posted',
        'points': 10,
    },
    'blood_community_post': {
        'category': 'community',
        'action_name': 'Blood community post shared',
        'points': 10,
    },
    'lost_item_returned': {
        'category': 'community',
        'action_name': 'Lost/found item posted',
        'points': 20,
    },
    'ct_question_post': {
        'category': 'academic',
        'action_name': 'CT question posted',
        'points': 10,
    },
    'job_post': {
        'category': 'career',
        'action_name': 'Job opportunity posted',
        'points': 10,
    },
}

def award_points(user, category, action_name, points):
    """
    Awards (or deducts) points for a specific user action and logs it.
    """
    if not user.is_authenticated:
        return False
        
    # Create the log
    PointLog.objects.create(
        user=user,
        category=category,
        action_name=action_name,
        points=points
    )
    
    # Update the Impact Profile
    profile, _ = ImpactProfile.objects.get_or_create(user=user)
    
    if category == 'academic':
        profile.academic_points += points
    elif category == 'career':
        profile.career_points += points
    elif category == 'club':
        profile.club_points += points
    elif category == 'community':
        profile.community_points += points
    elif category == 'marketplace':
        profile.marketplace_points += points
        
    profile.save()
    return True


def award_points_once(user, category, action_name, points):
    """
    Award points only once for an exact action label.
    Use object ids in action_name when the same action can happen many times.
    """
    if not user.is_authenticated:
        return False

    if PointLog.objects.filter(user=user, action_name=action_name).exists():
        return False

    return award_points(user, category, action_name, points)
