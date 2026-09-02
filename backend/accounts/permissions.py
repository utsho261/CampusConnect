from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    Assumes the model instance has an owner attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        # Check different possible owner field names
        owner_attributes = ['uploaded_by', 'seller', 'requested_by', 'author', 'created_by', 'posted_by']
        
        for attr in owner_attributes:
            if hasattr(obj, attr):
                owner = getattr(obj, attr)
                return owner == request.user

        # If no known owner attribute is found, deny permission to be safe
        return False
