from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)   # confirm pwd

     # Profile fields flattened with source
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    date_of_birth = serializers.DateField(source='profile.date_of_birth', required=False)
    address = serializers.CharField(source='profile.address', required=False, allow_blank=True)
    profile_image = serializers.ImageField(source='profile.profile_image', required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "date_of_birth",
            "address",
            "profile_image",
            "password",
            "password2",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        # If password is provided, password2 must also be provided
        if "password" in attrs and attrs["password"]:
            if "password2" not in attrs or not attrs["password2"]:
                raise serializers.ValidationError({"password2": "Password confirmation is required when changing password."})
            if attrs["password"] != attrs["password2"]:
                raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        # Pop nested profile data
        profile_data = validated_data.pop("profile", {})
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data.get("role", User.Role.PUBLIC),
        )
        # Create profile (only if profile fields are included)
        if profile_data:
            for key, value in profile_data.items():
                setattr(user.profile, key, value)
            user.profile.save()
        return user

    def update(self, instance, validated_data):
        # Remove password2 from validated_data
        validated_data.pop("password2", None)
        password = validated_data.pop("password", None)
        profile_data = validated_data.pop("profile", {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance

class RegistrationSerializer(serializers.ModelSerializer):
    """
    Public sign-up: only username, email, password.
    Always creates with role=PUBLIC.
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=User.Role.PUBLIC,     # <— force PUBLIC
        )
