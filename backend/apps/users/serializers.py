"""
Serializers for User authentication and management.

These serializers handle:
- User registration
- User login
- User profile retrieval and updates
- JWT token responses
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - used for profile display."""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'date_joined', 'phone_number',
            'profile_picture', 'bio'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active']
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create a new user with validated data."""
        validated_data.pop('password_confirm')
        
        # First user becomes admin automatically
        user_count = User.objects.count()
        role = UserRole.ADMIN if user_count == 0 else UserRole.VISITOR
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', None),
            role=role
        )
        
        # If first user, also set superuser flags
        if user_count == 0:
            user.is_staff = True
            user.is_superuser = True
            user.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.',
                    code='authorization'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".',
                code='authorization'
            )


class TokenResponseSerializer(serializers.Serializer):
    """Serializer for JWT token response."""
    
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'profile_picture', 'bio'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        return attrs
    
    def save(self, **kwargs):
        """Save the new password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class AdminUserListSerializer(serializers.ModelSerializer):
    """Serializer for admin user list view."""
    
    full_name = serializers.SerializerMethodField()
    account_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'email_verified', 'email_subscribed',
            'is_suspended', 'date_joined', 'last_login', 'account_status'
        ]
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()
    
    def get_account_status(self, obj):
        """Get current account status."""
        return obj.account_status


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Serializer for admin user detail view."""
    
    full_name = serializers.SerializerMethodField()
    account_status = serializers.SerializerMethodField()
    suspended_by_email = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'email_verified', 'email_subscribed',
            'is_suspended', 'suspended_at', 'suspended_by', 'suspended_by_email',
            'suspension_reason', 'suspension_expires_at',
            'date_joined', 'last_login', 'phone_number',
            'profile_picture', 'bio', 'account_status'
        ]
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()
    
    def get_account_status(self, obj):
        """Get current account status."""
        return obj.account_status
    
    def get_suspended_by_email(self, obj):
        """Get email of admin who suspended this user."""
        return obj.suspended_by.email if obj.suspended_by else None


class ChangeRoleSerializer(serializers.Serializer):
    """Serializer for changing user role."""
    
    role = serializers.ChoiceField(choices=UserRole.choices, required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class SuspendUserSerializer(serializers.Serializer):
    """Serializer for suspending a user."""
    
    reason = serializers.CharField(required=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class UpdateEmailSubscriptionSerializer(serializers.Serializer):
    """Serializer for updating email subscription."""
    
    email_subscribed = serializers.BooleanField(required=True)
