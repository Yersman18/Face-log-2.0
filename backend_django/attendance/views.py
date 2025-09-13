# attendance/views.py
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Ficha, AttendanceSession, Attendance
from .serializers import (
    FichaSerializer,
    AttendanceSessionSerializer,
    AttendanceLogSerializer,
    AttendanceLogUpdateSerializer
)
from .permissions import IsAdminOrReadOnly, IsInstructorOfFicha
from django.db.models import Count # Added import
from excuses.models import Excuse # Added import for InstructorDashboardSummaryView
from django.utils import timezone

class FichaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que los Administradores gestionen Fichas (CRUD completo).
    Otros roles solo pueden leer.
    """
    queryset = Ficha.objects.all().select_related('instructor').prefetch_related('students')
    serializer_class = FichaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

class InstructorFichaListView(generics.ListAPIView):
    """
    Endpoint para que un instructor autenticado vea solo sus fichas asignadas.
    """
    serializer_class = FichaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ficha.objects.filter(instructor=self.request.user).select_related('instructor').prefetch_related('students')

class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que un Instructor gestione las sesiones de sus fichas.
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfFicha]

    def get_queryset(self):
        """Un instructor solo puede ver/gestionar sesiones de sus propias fichas."""
        if self.request.user.role == 'instructor':
            return AttendanceSession.objects.filter(ficha__instructor=self.request.user)
        return AttendanceSession.objects.none()

    def perform_create(self, serializer):
        ficha = serializer.validated_data.get('ficha')
        # La validación de permisos ya se hace en IsInstructorOfFicha, pero una doble verificación no hace daño.
        if ficha.instructor != self.request.user:
            raise permissions.PermissionDenied("No puede crear sesiones para una ficha que no tiene asignada.")
        
        # Al crear la sesión, se generan los registros de asistencia para cada estudiante.
        session = serializer.save()
        students_in_ficha = session.ficha.students.all()
        attendance_records = [Attendance(session=session, student=student) for student in students_in_ficha]
        Attendance.objects.bulk_create(attendance_records)

    @action(detail=True, methods=['get'], url_path='attendance-log')
    def attendance_log(self, request, pk=None):
        """
        Devuelve la lista de asistencia para una sesión específica.
        """
        session = self.get_object()
        attendance_logs = Attendance.objects.filter(session=session).select_related('student')
        serializer = AttendanceLogSerializer(attendance_logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='toggle-activation')
    def toggle_activation(self, request, pk=None):
        """
        Activa o desactiva el reconocimiento facial para una sesión.
        """
        session = self.get_object()
        session.is_active = not session.is_active
        session.save()
        return Response({'status': 'success', 'is_active': session.is_active})

class ManualAttendanceUpdateView(generics.UpdateAPIView):
    """
    Vista para que un instructor actualice manualmente el estado de una asistencia.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceLogUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfFicha]

    def get_object(self):
        # Se necesita el objeto de permiso antes de la comprobación.
        # El permiso IsInstructorOfFicha necesita una Ficha.
        obj = super().get_object()
        self.check_object_permissions(self.request, obj.session.ficha)
        return obj

class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para que los usuarios vean sus registros de asistencia.
    - Estudiantes: Ven solo sus propios registros.
    - Instructores: Ven los registros de todas sus fichas.
    - Admins: Ven todos los registros.
    """
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Attendance.objects.filter(student=user).select_related('student', 'session__ficha')
        if user.role == 'instructor':
            return Attendance.objects.filter(session__ficha__instructor=user).select_related('student', 'session__ficha')
        if user.role == 'admin':
            return Attendance.objects.all().select_related('student', 'session__ficha')
        return Attendance.objects.none()

class GlobalReportView(generics.GenericAPIView):
    """
    Vista para que un Administrador obtenga un reporte global de estadísticas.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        total_fichas = Ficha.objects.count()
        total_instructors = User.objects.filter(role='instructor').count()
        total_students = User.objects.filter(role='student').count()

        attendance_stats = Attendance.objects.values('status').annotate(count=Count('status'))
        stats_dict = {stat['status']: stat['count'] for stat in attendance_stats}

        data = {
            'total_fichas': total_fichas,
            'total_instructors': total_instructors,
            'total_students': total_students,
            'attendance_by_status': {
                'present': stats_dict.get('present', 0),
                'absent': stats_dict.get('absent', 0),
                'late': stats_dict.get('late', 0),
                'excused': stats_dict.get('excused', 0),
            }
        }
        return Response(data)

class InstructorDashboardSummaryView(generics.GenericAPIView):
    """
    Vista para que un Instructor obtenga un resumen de su dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'instructor':
            return Response({'detail': 'Acceso denegado. Solo instructores.'}, status=status.HTTP_403_FORBIDDEN)

        # Fichas asignadas
        assigned_fichas = Ficha.objects.filter(instructor=user)
        total_assigned_fichas = assigned_fichas.count()

        # Sesiones programadas del día
        today = timezone.now().date()
        today_sessions = AttendanceSession.objects.filter(
            ficha__in=assigned_fichas,
            date=today
        ).count()

        # Excusas pendientes de revisión
        pending_excuses = Excuse.objects.filter(
            session__ficha__in=assigned_fichas,
            status='pending'
        ).count()

        # Estadísticas de asistencia de sus aprendices (ejemplo: total de asistencias)
        # Esto podría ser más complejo, pero para un resumen inicial:
        total_attendances_by_instructor = Attendance.objects.filter(
            session__ficha__instructor=user
        ).count()
        
        # Example: count of students in assigned fichas
        total_students_in_assigned_fichas = 0
        for ficha in assigned_fichas:
            total_students_in_assigned_fichas += ficha.students.count()

        data = {
            'total_assigned_fichas': total_assigned_fichas,
            'today_sessions': today_sessions,
            'pending_excuses': pending_excuses,
            'total_students_in_assigned_fichas': total_students_in_assigned_fichas,
            'total_attendances_recorded': total_attendances_by_instructor,
        }
        return Response(data)

class ApprenticeDashboardSummaryView(generics.GenericAPIView):
    """
    Vista para que un Aprendiz obtenga un resumen de su dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'student':
            return Response({'detail': 'Acceso denegado. Solo aprendices.'}, status=status.HTTP_403_FORBIDDEN)

        # Su porcentaje de asistencia personal
        total_sessions_attended = Attendance.objects.filter(student=user, status__in=['present', 'late', 'excused']).count()
        total_sessions_for_student = Attendance.objects.filter(student=user).count()
        
        attendance_percentage = 0
        if total_sessions_for_student > 0:
            attendance_percentage = (total_sessions_attended / total_sessions_for_student) * 100

        # Próximas sesiones
        now = timezone.now()
        upcoming_sessions = AttendanceSession.objects.filter(
            ficha__students=user,
            date__gte=now.date(),
            start_time__gte=now.time()
        ).exclude(attendance__student=user, attendance__status__in=['present', 'late', 'excused']).count()

        # Estado de sus excusas (pendientes)
        pending_excuses = Excuse.objects.filter(student=user, status='pending').count()

        # Resumen de tardanzas e inasistencias
        late_count = Attendance.objects.filter(student=user, status='late').count()
        absent_count = Attendance.objects.filter(student=user, status='absent').count()

        data = {
            'attendance_percentage': round(attendance_percentage, 2),
            'upcoming_sessions': upcoming_sessions,
            'pending_excuses': pending_excuses,
            'late_count': late_count,
            'absent_count': absent_count,
        }
        return Response(data)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from django.http import HttpResponse

class GlobalAttendancePDFReportView(generics.GenericAPIView):
    """
    Vista para que un Administrador genere un reporte PDF de estadísticas globales de asistencia.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="global_attendance_report.pdf"'

        p = canvas.Canvas(response, pagesize=letter)
        p.drawString(inch, 10 * inch, "Reporte Global de Asistencia SENA")
        p.drawString(inch, 9.5 * inch, "Fecha: %s" % timezone.now().strftime("%Y-%m-%d %H:%M"))

        # Obtener los datos de GlobalReportView
        global_report_data = GlobalReportView().get(request).data

        y_position = 8.5 * inch
        p.drawString(inch, y_position, "Total de Fichas: %s" % global_report_data['total_fichas'])
        y_position -= 0.2 * inch
        p.drawString(inch, y_position, "Total de Instructores: %s" % global_report_data['total_instructors'])
        y_position -= 0.2 * inch
        p.drawString(inch, y_position, "Total de Aprendices: %s" % global_report_data['total_students'])
        y_position -= 0.4 * inch

        p.drawString(inch, y_position, "Estadísticas de Asistencia por Estado:")
        y_position -= 0.2 * inch
        for status, count in global_report_data['attendance_by_status'].items():
            p.drawString(1.5 * inch, y_position, "- %s: %s" % (status.capitalize(), count))
            y_position -= 0.2 * inch

        p.showPage()
        p.save()
        return response
