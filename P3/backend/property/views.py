from django.db.models import Q
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.views import APIView
from .models import property
from rest_framework.response import Response
from reservations.models import reservations
from .serializers import PropertySerializer, PropertyCreateSerializer, PropertyUpdateSerializer, PropertyDeleteSerializer, PropertyDetailSerializer
from django.http import HttpResponseBadRequest, HttpResponse
from django.core.exceptions import ValidationError
import datetime
from restify import settings
from rest_framework import status
from rest_framework.exceptions import APIException
from datetime import timedelta
from django.utils.encoding import force_str

class CustomValidation(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'A server error occurred.'

    def __init__(self, detail, field, status_code):
        if status_code is not None:self.status_code = status_code
        if detail is not None:
            self.detail = {field: force_str(detail)}
        else: self.detail = {'detail': force_str(self.default_detail)}

# Create your views here.
class PropertyListView(ListAPIView):
    serializer_class = PropertySerializer
    permission_classes = [AllowAny]
    def get_queryset(self): 
        queryset = property.objects.all()
        amenities = self.request.query_params.get('amenities')
        available_start = self.request.query_params.get('available_start')
        available_end = self.request.query_params.get('available_end')
        address = self.request.query_params.get('address')
        num_guest = self.request.query_params.get('num_guest')
        order_by = self.request.query_params.get('order_by')
        
        am = {'wifi', 'kitchen', 'washer', 'dryer', 'air_cond', 'heating', 'hair_dryer', 'TV', 'pool', 
              'hot_tub', 'bbq', 'gym'}
        orders = {'price', 'rating', '-price', '-rating'}
        # Filter the properties based on the search parameters
        if amenities:
            amenities_query = Q()
            for amenity in amenities.split(','):
                if amenity in am:
                    amenities_query &= Q(amenities__contains=amenity)
            queryset = queryset.filter(amenities_query)
        if available_start: 
            try:
                available_start = datetime.date.fromisoformat(available_start)
            except ValueError:
                raise CustomValidation(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid format of start time", field="available_start")
            queryset = queryset.filter(available_start__lte=available_start).filter(available_end__gte=available_start)
        if available_end: 
            try:
                available_end = datetime.date.fromisoformat(available_end)
            except ValueError:
                raise CustomValidation(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid format of end time",  field="available_end")
            queryset = queryset.filter(available_end__gte=available_end).filter(available_start__lte = available_end)
        if address:
            queryset = queryset.filter(address__contains=address)
        if num_guest:
            queryset = queryset.filter(num_guest__gte=num_guest)
        if order_by:
            all_order = [x for x in order_by.split(',') if x in orders]
            queryset = queryset.order_by(*all_order)
        if available_start or available_end:
            for prop in queryset.all().iterator():
                reser = reservations.objects.filter(property=prop).all()
                for reservation in reser.iterator():
                    if reservation.status == 'pending' or reservation.status == 'approved' or reservation.status == 'cancel_pending':
                        if available_start and available_end:
                            if not (available_end < reservation.start_day or available_start > reservation.end_day):
                                queryset.exclude(property=prop)
                        elif available_start and not available_end:
                            if available_start <= reservation.end_day and available_start >= reservation.start_day:
                                queryset.exclude(property=prop)
                        else:
                            if available_end <= reservation.end_day and available_end >= reservation.start_day:
                                queryset.exclude(property=prop)
        return queryset
    

class PropertyDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        prop = property.objects.filter(id=pk).first()
        
        return Response({'id': prop.id, 
                         'owner': prop.owner.id,
                         'address': prop.address, 
                         'comments': [{'id': comment.id , 'content': comment.content} for comment in prop.comments.all()],
                         'images': [settings.MEDIA_URL + str(propimage.image) for propimage in prop.images.all()],
                         'images_id' : [{'id' : propimage.id, 'image' : settings.MEDIA_URL + str(propimage.image)} for propimage in prop.images.all()],
                         'rating': prop.rating, 
                         'available_start': prop.available_start, 
                         'available_end': prop.available_end, 
                         'amenities': prop.amenities, 
                         'num_guest': prop.num_guest, 
                         'description': prop.description, 
                         'price': prop.price,
                         'num_bed' : prop.num_bed, 
                         'num_bath' : prop.num_bath, 
                         'image_cover' : settings.MEDIA_URL + str(prop.image_cover)})

class PropertyCreateView(CreateAPIView):
    serializer_class = PropertyCreateSerializer
    permission_classes = [IsAuthenticated]

class PropertyDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyDeleteSerializer
    def get_queryset(self):
        return property.objects.filter(owner=self.request.user)

class PropertyEditView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyUpdateSerializer
    def get_queryset(self):
        return property.objects.filter(owner=self.request.user)
    
class PropertyAvailable(APIView):
    permission_classes = [AllowAny]
    def get(self, reuqest , pk):
        prop = property.objects.filter(id=pk).first()
        reserv = reservations.objects.filter(property=prop).order_by("start_day").all()
        res = []
        if(len(reserv) == 1):
            if(prop.available_start == reserv[0].start_day):
                return Response({'time' : [{"start" : reserv[0].end_day + timedelta(days=1) , "end" : prop.available_end}]})
            elif prop.available_end == reserv[0].end_day : 
                return Response({'time' : [{"start" : prop.available_start , "end" : reserv[0].start_day - timedelta(days=1)}]})
            else:
                return Response({'time' : [{"start" : prop.available_start , "end" : reserv[0].start_day - timedelta(days=1)}, {"start" : reserv[0].end_day +  timedelta(days=1), "end" : prop.available_end}]})
            
        for index, reser in enumerate(reserv):
            if(index == 0):
                if(prop.available_start != reser.start_day):
                    res.append({"start" : prop.available_start, "end" : reser.start_day - timedelta(days=1)})
            elif(index == len(reserv) - 1):
                if reserv[index - 1].end_day + timedelta(days=1) != reser.start_day:
                    res.append({"start" : reserv[index - 1].end_day + timedelta(days=1), "end" : reser.start_day - timedelta(days=1)})
                if(reser.end_day != prop.available_end):
                    res.append({"start" : reser.end_day + timedelta(days=1), "end" : prop.available_end})
            else:
                if reserv[index - 1].end_day + timedelta(days=1) != reser.start_day:
                    res.append({"start" : reserv[index - 1].end_day + timedelta(days=1), "end" : reser.start_day - timedelta(days=1)})
        
        if len(reserv) == 0:
            res.append({"start" : prop.available_start, "end" : prop.available_end})
        return Response({'time' : res})
    
class getPropertyView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PropertySerializer
    def get_queryset(self):
        return property.objects.filter(owner=self.kwargs['pk']).all()