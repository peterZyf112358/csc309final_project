from django.urls import path
from . import views
 
app_name="reservations"
urlpatterns = [
    path('list/<str:user_type>/<str:state>/', views.listReservation.as_view(), name="list"),
    path('reserve/', views.Reserve.as_view(), name='reserve'),
    path('cancel/<int:pk>/', views.Cancel.as_view(), name='cancel'),
    path('pendingAction/<int:pk>/', views.PendingAction.as_view(), name='pendingAction'),
    path('cancelAction/<int:pk>/', views.CancelAction.as_view(), name='cancelAction'),
    path('terminate/<int:pk>/', views.Terminate.as_view(), name='terminate'),
    path('markExpired/', views.MarkExpired.as_view(), name='markExpired'),
    path('markCompleted/', views.MarkCompleted.as_view(), name='markCompleted'),
]