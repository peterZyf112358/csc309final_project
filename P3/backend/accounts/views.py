from django.shortcuts import render
from rest_framework.generics import RetrieveAPIView, UpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import RegisterSerializer, ChangePasswordSerializer, UserUpdateSerializer, UserProfileSerializer
from .models import User
from django.shortcuts import get_object_or_404

class RegisterUser(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class ChangePasswordView(UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer
    def get_object(self):
        return self.request.user

class UserUpdateView(UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user
    
class UserDetailView(RetrieveAPIView, UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user
    
class GetUserView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserProfileSerializer
    def get_object(self):
        return get_object_or_404(User, id=self.kwargs['pk'])