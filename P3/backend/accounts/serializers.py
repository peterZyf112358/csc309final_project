from rest_framework.serializers import ModelSerializer
from .models import User
from rest_framework import serializers

class RegisterSerializer(ModelSerializer):

    email = serializers.EmailField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name', 'avatar', 'password1', 'password2']

    def validate(self, args):
        err_mess = {}
        if args.get('email', None) == None:
            err_mess['email'] = 'This field is required'
        if args.get('password1', None) == None:
            err_mess['password1'] = 'This field is required'
        if args.get('password2', None) == None:
            err_mess['password2'] = 'This field is required'
        if args.get('password1') != args.get('password2') and len(args.get('password1')) != 0 and len(args.get('password2')) != 0:
            err_mess.update({'password1': 'The two password fields didn\'t match'})
        if len(args.get('password1')) < 8 and len(args.get('password1')) != 0:
            err_mess.update({'password1': 'This password is too short. It must contain at least 8 characters'})
        if len(args.get('password2')) < 8 and len(args.get('password1')) != 0:
            err_mess.update({'password2': 'This password is too short. It must contain at least 8 characters'})
        if User.objects.filter(email = args.get('email')).exists():
            err_mess.update({'email' : 'A user with this email already exists'})
        if len(err_mess) != 0:
            raise serializers.ValidationError(err_mess)
        return super().validate(args)
    
    def create(self, validated_data):
        if validated_data.get('avatar') == None:
            return User.objects.create_user(email=validated_data['email'], password=validated_data['password1'], phone=validated_data.get('phone'), first_name=validated_data.get('first_name'), last_name=validated_data.get('last_name'))
        return User.objects.create_user(email=validated_data['email'], password=validated_data['password1'], phone=validated_data.get('phone'), first_name=validated_data.get('first_name'), last_name=validated_data.get('last_name'), avatar=validated_data.get('avatar'))
    
class ChangePasswordSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    old_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone', 'avatar', 'password1', 'password2', 'old_password')
        read_only_fields = ('email', 'first_name', 'last_name', 'phone', 'avatar')

    def validate(self, args):
        err_mess = {}
        if args.get('password1', None) == None:
            err_mess['password1'] = 'This field is required'
        if args.get('password2', None) == None:
            err_mess['password2'] = 'This field is required'
        if args.get('password1') != args.get('password2') and len(args.get('password1')) != 0 and len(args.get('password2')) != 0:
            err_mess.update({'password1': 'The two password fields didn\'t match'})
        if len(args.get('password1')) < 8 and len(args.get('password1')) != 0:
            err_mess.update({'password1': 'This password is too short. It must contain at least 8 characters'})
        if len(args.get('password2')) < 8 and len(args.get('password1')) != 0:
            err_mess.update({'password2': 'This password is too short. It must contain at least 8 characters'})
        if len(err_mess) != 0:
            raise serializers.ValidationError(err_mess)
        return args

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError({"old_password": "Old password is not correct"})
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data.get('password1'))
        instance.save()
        return instance
    
class UserUpdateSerializer(ModelSerializer):
    email = serializers.EmailField(required=False)
    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name', 'avatar']

    def validate(self, args):
        err_mess = {}
        if args.get('email', None) == None:
            args.update({'email' : self.context['request'].user.email})
        if args.get('avatar', None) == None:
            args.update({'avatar' : self.context['request'].user.avatar})
        if User.objects.filter(email = args.get('email')).exists() and args.get('email') != self.context['request'].user.email:
            err_mess.update({'email' : 'A user with this email already exists'})
        if len(err_mess) != 0:
            raise serializers.ValidationError(err_mess)
        return args
    
class UserProfileSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'first_name', 'last_name', 'avatar', 'rating']