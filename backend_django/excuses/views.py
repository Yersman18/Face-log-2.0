# excuses/views.py
from rest_framework import viewsets, permissions
from .models import Excuse
from .serializers import ExcuseSerializer, ExcuseCreateSerializer, ExcuseReviewSerializer
from attendance.permissions import IsInstructorOfFicha
from attendance.models import Attendance
from rest_framework.exceptions import ValidationError

class ExcuseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de Excusas.
    - Estudiantes: Pueden crear excusas para sus sesiones y ver las suyas.
    - Instructores: Pueden ver las excusas de sus fichas y aprobarlas/rechazarlas.
    - Administradores: Pueden ver todas las excusas.
    """
    queryset = Excuse.objects.all().select_related('student', 'session__ficha', 'reviewed_by')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ExcuseCreateSerializer
        # Para PATCH, un instructor está revisando
        if self.action == 'partial_update':
            return ExcuseReviewSerializer
        return ExcuseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return self.queryset.filter(student=user)
        if user.role == 'instructor':
            return self.queryset.filter(session__ficha__instructor=user)
        if user.role == 'admin':
            return self.queryset
        return Excuse.objects.none()

    def perform_create(self, serializer):
        session = serializer.validated_data.get('session')
        user = self.request.user

        # Validar que el estudiante solo pueda crear excusas para sesiones en las que está inscrito.
        if not session.ficha.students.filter(id=user.id).exists():
            raise permissions.PermissionDenied("No puede crear una excusa para una sesión a la que no pertenece.")

        # Validar que el estudiante solo pueda presentar excusas para sesiones en las que faltó.
        try:
            attendance_record = Attendance.objects.get(student=user, session=session)
            if attendance_record.status != 'absent':
                raise ValidationError("Solo puede presentar excusas para las sesiones a las que ha faltado.")
        except Attendance.DoesNotExist:
            raise ValidationError("No se encontró un registro de asistencia para esta sesión.")

        # Validar que no exista ya una excusa para esa sesión
        if Excuse.objects.filter(student=user, session=session).exists():
            raise ValidationError("Ya existe una excusa para esta sesión.")
            
        serializer.save(student=user)

    def perform_update(self, serializer):
        excuse = self.get_object()
        user = self.request.user

        if user.role != 'instructor':
            raise permissions.PermissionDenied("Solo los instructores pueden revisar excusas.")

        # Usar el permiso para verificar que el instructor es el de la ficha correcta
        permission = IsInstructorOfFicha()
        if not permission.has_object_permission(self.request, self, excuse.session.ficha):
             raise permissions.PermissionDenied("No tiene permiso para revisar excusas de esta ficha.")

        if excuse.status != 'pending':
            raise ValidationError("Esta excusa ya ha sido revisada.")

        # El modelo ya se encarga de actualizar la asistencia si se aprueba
        serializer.save(reviewed_by=user)
