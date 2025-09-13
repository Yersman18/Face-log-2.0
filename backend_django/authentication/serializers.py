# authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from attendance.models import Ficha

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo User.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'student_id', 'is_active']
        read_only_fields = ['id', 'role']

class RegisterStudentSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro de nuevos aprendices.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    ficha_numero = serializers.CharField(write_only=True, required=True, help_text="Número de la ficha a la que se inscribe el aprendiz")

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'first_name', 'last_name', 'email', 'student_id', 'ficha_numero']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        
        try:
            Ficha.objects.get(numero_ficha=attrs['ficha_numero'])
        except Ficha.DoesNotExist:
            raise serializers.ValidationError({"ficha_numero": "La ficha especificada no existe."})

        return attrs

    def create(self, validated_data):
        ficha_numero = validated_data.pop('ficha_numero')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            student_id=validated_data['student_id'],
            role='student'  # Rol asignado por defecto
        )
        user.set_password(validated_data['password'])
        user.save()

        # Inscribir al estudiante en la ficha
        ficha = Ficha.objects.get(numero_ficha=ficha_numero)
        ficha.students.add(user)

        return user