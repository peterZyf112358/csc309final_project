from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView, CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from reservations.models import reservations
import datetime
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from .serializers import ReservationListSerializer, reserveSerializer, cancelSerializer, pendingSerializer, cancelActionSerializer, terminateSerializer
from django.http import Http404
from rest_framework.views import APIView

status = ["pending", "denied", "expired", "approved", "cancel_pending", "canceled", "terminated", "completed"]
user_type = ["host", "reserver"]

class listReservation(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationListSerializer

    def get_queryset(self):
        type = self.kwargs['user_type']
        state = self.kwargs['state']
        if state not in status and state != 'all' and state != 'n_complete' and state != 'end':
            raise Http404()
        if type not in user_type and type != 'both':
            raise Http404()
        if type == "host":
            if state == 'all':
                return reservations.objects.filter(host=self.request.user)
            if state == 'n_complete':
                return reservations.objects.filter(host=self.request.user).\
                    exclude(status='completed').exclude(status='expired').exclude(status='denied').\
                    exclude(status='canceled').exclude(status='terminated')
            if state == 'end':
                return reservations.objects.filter(host=self.request.user).\
                    exclude(status='pending').exclude(status='cancel_pending').exclude(status='approved')
            return reservations.objects.filter(host=self.request.user).filter(status=state)
        elif type == "reserver":
            if state == 'all':
                return reservations.objects.filter(reserver=self.request.user)
            if state == 'n_complete':
                return reservations.objects.filter(reserver=self.request.user). \
                    exclude(status='completed').exclude(status='expired').exclude(status='denied'). \
                    exclude(status='canceled').exclude(status='terminated')
            if state == 'end':
                return reservations.objects.filter(reserver=self.request.user).\
                    exclude(status='pending').exclude(status='cancel_pending').exclude(status='approved')
            return reservations.objects.filter(reserver=self.request.user).filter(status=state) 
        else:
            if state == "all":
                return reservations.objects.filter(host=self.request.user).union(reservations.objects.filter(reserver=self.request.user))
            if state == 'n_complete':
                return reservations.objects.filter(reserver=self.request.user).\
                    exclude(status='completed').exclude(status='expired').exclude(status='denied').\
                    exclude(status='canceled').exclude(status='terminated')\
                    .union(reservations.objects.filter(host=self.request.user).exclude(status='completed').
                           exclude(status='expired').exclude(status='denied').exclude(status='canceled').
                           exclude(status='terminated'))
            if state == 'end':
                return reservations.objects.filter(reserver=self.request.user).\
                    exclude(status='pending').exclude(status='cancel_pending').exclude(status='approved')\
                    .union(reservations.objects.filter(host=self.request.user)
                           .exclude(status='pending').exclude(status='cancel_pending').exclude(status='approved')
                           )
            return reservations.objects.filter(host=self.request.user).filter(status=state).union(reservations.objects.filter(reserver=self.request.user).filter(status=state))
        
class Reserve(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = reserveSerializer

class Cancel(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = cancelSerializer

    def get_queryset(self):
        return reservations.objects.filter(reserver=self.request.user)
    
class PendingAction(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = pendingSerializer

    def get_queryset(self):
        return reservations.objects.filter(host=self.request.user).filter(status='pending')
    
class CancelAction(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = cancelActionSerializer

    def get_queryset(self):
        return reservations.objects.filter(host=self.request.user).filter(status='cancel_pending')
    
class Terminate(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = terminateSerializer

    def get_queryset(self):
        return reservations.objects.filter(host=self.request.user)
    
class MarkExpired(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = datetime.date.today()
        reser = reservations.objects.filter(reserver=request.user).union(reservations.objects.filter(host=request.user))
        r = []
        for reservation in reser.iterator():
            if reservation.start_day < today and reservation.status == 'pending':
                reservation.status = 'expired'
                reservation.save()
                record = {"reservation" : reservation.id, "status" : reservation.status}
                r.append(record)
        if len(r) == 0:
            return Response({"detail" : "No reservation should be marked expired"})
        return Response(r)
    
class MarkCompleted(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = datetime.date.today()
        reser = reservations.objects.filter(reserver=request.user).union(reservations.objects.filter(host=request.user))
        r = []
        for reservation in reser.iterator():
            if reservation.start_day < today and (reservation.status == 'approved'or reservation.status == 'cancel_pending'):
                reservation.status = 'completed'
                reservation.save() 
                record = {"reservation" : reservation.id, "status" : reservation.status}
                r.append(record)
        if len(r) == 0:
            return Response({"detail" : "No reservation should be marked completed"})
        return Response(r)