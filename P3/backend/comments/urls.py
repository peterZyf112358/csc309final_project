from django.urls import path
from . import views

app_name = "comments"
urlpatterns = [
    path('property/<int:id>/comments/', views.PropertyCommentCreateView.as_view(), name='property_comments'),
    path('user/<int:id>/comments/', views.UserCommentCreateView.as_view(), name='user_comments'),
    path('property/<int:id>/reply/', views.PropertyReplyCreateView.as_view(), name='property_replies'),
    path('user/<int:id>/reply/', views.UserReplyCreateView.as_view(), name='user_replies'),
    path('property/<int:id>/', views.PropertyCommentListView.as_view(), name='property_comments_list'),
    path('user/<int:id>/', views.UserCommentListView.as_view(), name='user_comments_list'),
    path('reply/<int:id>/', views.ReplyListView.as_view(), name='reply_list'),

]
