# authentication/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterStudentView,
    UserProfileView,
    CustomTokenObtainPairView,
    UserViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Endpoint para registro de aprendices
    path('register/student/', RegisterStudentView.as_view(), name='register-student'),
    
    # Endpoints para autenticación JWT
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoint para perfil de usuario
    path('profile/', UserProfileView.as_view(), name='user-profile'),

    # Endpoints para gestión de usuarios por admin
    path('', include(router.urls)),
]

