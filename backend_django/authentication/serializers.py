# authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from attendance.models import Ficha
from face_recognition_app.models import FaceEncoding
from face_recognition_app.services import get_face_encoding_from_image

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
    face_image = serializers.ImageField(write_only=True, required=True, help_text="Imagen del rostro para el registro")

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'first_name', 'last_name', 'email', 'student_id', 'ficha_numero', 'face_image']

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
        face_image = validated_data.pop('face_image')
        
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

        # Procesar y guardar la codificación facial
        encoding = get_face_encoding_from_image(face_image)
        if encoding is None:
            user.delete() # Eliminar usuario si el rostro no es válido
            raise serializers.ValidationError({
                "face_image": "No se pudo encontrar un rostro en la imagen o se detectó más de uno. Por favor, suba una imagen clara de su rostro."
            })

        face_encoding_obj = FaceEncoding(user=user, profile_image=face_image)
        face_encoding_obj.set_encoding_array(encoding)
        face_encoding_obj.save()

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs