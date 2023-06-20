from django.urls import path
from . import views

app_name="property"
urlpatterns = [
    path('all/', views.PropertyListView.as_view(), name="all"),
    path('delete/<int:pk>/', views.PropertyDeleteView.as_view(), name='delete'),
    path('update/<int:pk>/', views.PropertyEditView.as_view(), name='update'),
    path('details/<int:pk>/', views.PropertyDetailView.as_view(), name='detail'),
    path('create/', views.PropertyCreateView.as_view(), name='create'),
    path('getAva/<int:pk>/', views.PropertyAvailable.as_view(), name='getAva'),
    path('getProperty/<int:pk>/', views.getPropertyView.as_view(), name='getProperty'),
    ]