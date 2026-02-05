from rest_framework import serializers

class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    status = serializers.BooleanField(required=False)
    created_by = serializers.CharField(required=False)
    updated_by = serializers.CharField(required=False)
    update_reason = serializers.CharField(required=False, allow_blank=True)
