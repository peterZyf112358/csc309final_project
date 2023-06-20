from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from property.models import property as property_
from accounts.models import User as user_
from comments.models import comments as comments_
from .serializers import PropertyCommentSerializer, UserCommentSerializer, PropertyCommentCreate,\
    UserCommentCreate, PropertyReplyCreate, UserReplyCreate, ReplySerializer
from reservations.models import reservations
from property.views import CustomValidation
from rest_framework import status

class PropertyCommentListView(ListAPIView):
    serializer_class = PropertyCommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        property_id = self.kwargs.get('id')
        com = comments_.objects.filter(content_type=9).\
            filter(comments=True).filter(object_id=property_id).order_by("-created_time")

        return com.all()


class ReplyListView(ListAPIView):
    serializer_class = ReplySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        comment_id = self.kwargs.get('id')
        base_comment = get_object_or_404(comments_, id=comment_id)
        reply_list = comments_.objects.filter(base_comment=base_comment).order_by("created_time")

        return reply_list.all()


class UserCommentListView(ListAPIView):
    serializer_class = UserCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('id')
        user_list = get_object_or_404(user_, id=user_id)

        if not reservations.objects.filter(host=self.request.user).filter(reserver=user_list).exists() and not self.request.user == user_list:
            raise CustomValidation(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot see the comments about this user.", field="detail")

        use_ = comments_.objects.filter(content_type=6).filter(comments=True).filter(object_id=user_id).order_by("-created_time")
        return use_.all()


class PropertyCommentCreateView(CreateAPIView):
    serializer_class = PropertyCommentCreate
    permission_classes = [IsAuthenticated]


class UserCommentCreateView(CreateAPIView):
    serializer_class = UserCommentCreate
    permission_classes = [IsAuthenticated]


class PropertyReplyCreateView(CreateAPIView):
    serializer_class = PropertyReplyCreate
    permission_classes = [IsAuthenticated]


class UserReplyCreateView(CreateAPIView):
    serializer_class = UserReplyCreate
    permission_classes = [IsAuthenticated]