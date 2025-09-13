# attendance/serializers.py
from rest_framework import serializers
from .models import Ficha, AttendanceSession, Attendance
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializador simple para mostrar información de usuarios (estudiantes/instructores)
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class FichaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Ficha. Permite ver y gestionar fichas.
    """
    instructor = SimpleUserSerializer(read_only=True)
    students = SimpleUserSerializer(many=True, read_only=True)
    
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='instructor'), 
        write_only=True, 
        source='instructor'
    )
    student_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'), 
        write_only=True, 
        many=True, 
        source='students', 
        required=False
    )

    class Meta:
        model = Ficha
        fields = [
            'id', 'programa_formacion', 'numero_ficha', 'instructor', 'students',
            'instructor_id', 'student_ids', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def update(self, instance, validated_data):
        # El pop previene que se intente asignar students directamente
        students_data = validated_data.pop('students', None)
        
        instance = super().update(instance, validated_data)
        
        # Si se proporcionaron student_ids, se actualiza la relación ManyToMany
        if students_data is not None:
            instance.students.set(students_data)
            
        return instance

class AttendanceSessionSerializer(serializers.ModelSerializer):
    """
    Serializador para las sesiones de asistencia.
    """
    class Meta:
        model = AttendanceSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class AttendanceLogSerializer(serializers.ModelSerializer):
    """
    Serializador para los registros de asistencia individuales.
    """
    student = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'session', 'student', 'status', 'check_in_time', 'verified_by_face']
        read_only_fields = ['id', 'session', 'student', 'check_in_time', 'verified_by_face']

class AttendanceLogUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador para la edición manual de un registro de asistencia por parte de un instructor.
    """
    class Meta:
        model = Attendance
        fields = ['status'] # Solo se puede cambiar el estado