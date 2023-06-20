from django.urls import path
from . import views

app_name="notifications"
urlpatterns = [
    path('list/', views.AllNotifications.as_view(), name='list'),
    path('read/<int:pk>/', views.ReadNotification.as_view(), name='read'),
    path('clear/<int:pk>/', views.ClearNotification.as_view(), name='clear'),
    path('notupcoming/', views.UpcomingNotif.as_view(), name='notupcoming'),
]