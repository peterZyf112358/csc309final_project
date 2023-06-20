from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

app_name="accounts"
urlpatterns = [
    path('register/', views.RegisterUser.as_view(), name='register'),
    path('obtainToken/', TokenObtainPairView.as_view(), name='obtainToken'),
    path('refreshToken/', TokenRefreshView.as_view(), name='refreshToken'),
    path('update/', views.UserUpdateView.as_view(), name='update'),
    path('detail/', views.UserDetailView.as_view(), name='detail'),
    path('change_password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('getUser/<int:pk>/', views.GetUserView.as_view(), name='getUser'),
]