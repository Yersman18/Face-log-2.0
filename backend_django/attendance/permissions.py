# attendance/permissions.py
from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores crear/editar/eliminar.
    Otros usuarios (autenticados) pueden ver (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'admin'

class IsInstructorOfFicha(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es el instructor de la ficha asociada al objeto.
    """
    def has_object_permission(self, request, view, obj):
        # Para vistas que tienen get_permission_object(), como ManualAttendanceUpdateView
        if hasattr(view, 'get_permission_object'):
            ficha = view.get_permission_object()
            return ficha.instructor == request.user

        # Para objetos Ficha
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        
        # Para objetos AttendanceSession
        if hasattr(obj, 'ficha'):
            return obj.ficha.instructor == request.user
        
        return False

class IsStudentInFicha(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es un estudiante inscrito en la ficha.
    """
    def has_object_permission(self, request, view, obj):
        ficha = obj.ficha if hasattr(obj, 'ficha') else obj
        return ficha.students.filter(id=request.user.id).exists()