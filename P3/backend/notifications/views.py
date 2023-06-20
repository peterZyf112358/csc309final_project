from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import NotificationsSerializer
from .models import notifications
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from reservations.models import reservations
import datetime
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes

class AllNotifications(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationsSerializer

    def get_queryset(self):
        return notifications.objects.filter(receiver=self.request.user).order_by('-created_time')
    
class ReadNotification(RetrieveAPIView):
    serializer_class = NotificationsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return notifications.objects.filter(receiver=self.request.user)
    
    def get_object(self):
        return get_object_or_404(notifications, id=self.kwargs['pk'])
    
class ClearNotification(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationsSerializer
    def get_queryset(self):
        return notifications.objects.filter(receiver=self.request.user)
    
    def get_object(self):
        return get_object_or_404(notifications, id=self.kwargs['pk'])

class UpcomingNotif(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        tomorrow = datetime.date.today() + datetime.timedelta(days=1)
        if not reservations.objects.filter(reserver=request.user).filter(status="approved").filter(start_day=tomorrow).filter(notified=False).exists():
            return Response({"message" : "No upcoming reservation for the logged in user"})
        reser = reservations.objects.filter(reserver=request.user).filter(status="approved").filter(start_day=tomorrow).filter(notified=False).all()
        r = []
        for reservation in reser.iterator():
            n = notifications.objects.create(receiver=request.user, content="You have a reservations tomorrow at " + reservation.property.address + ". Please check your reservation list to see details.", content_object=reservation)
            n.save()
            reservation.notified = True
            reservation.save()
            record = {"receiver" : request.user.id, "content" : "You have a reservations tomorrow at " + reservation.property.address + ". Please check your reservation list to see details.", "reservation" : reservation.id}
            r.append(record)
        return Response(r)
    