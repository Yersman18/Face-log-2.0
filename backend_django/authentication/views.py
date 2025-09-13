# authentication/views.py
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterStudentSerializer
from attendance.permissions import IsAdminOrReadOnly # Reusing this permission

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Personaliza el token JWT para incluir el rol y el nombre del usuario.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadir campos personalizados al payload del token
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterStudentView(generics.CreateAPIView):
    """
    Vista para que un nuevo aprendiz se registre.
    No requiere autenticación.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse
    serializer_class = RegisterStudentSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para que un usuario vea o actualice su perfil.
    Requiere autenticación.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Devuelve el perfil del usuario que hace la petición
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que los Administradores gestionen usuarios (CRUD completo).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] # Solo administradores pueden gestionar usuarios

    def get_serializer_class(self):
        if self.action == 'create':
            # When creating a user from admin, allow setting role
            class AdminUserCreateSerializer(UserSerializer):
                class Meta(UserSerializer.Meta):
                    fields = UserSerializer.Meta.fields + ['password']
                    extra_kwargs = {'password': {'write_only': True}}

                def create(self, validated_data):
                    user = User.objects.create_user(
                        username=validated_data['username'],
                        email=validated_data['email'],
                        password=validated_data['password'],
                        first_name=validated_data.get('first_name', ''),
                        last_name=validated_data.get('last_name', ''),
                        role=validated_data.get('role', 'student'),
                        student_id=validated_data.get('student_id', None)
                    )
                    return user
            return AdminUserCreateSerializer
        return UserSerializer
