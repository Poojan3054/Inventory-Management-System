from rest_framework import serializers
# ---------------- CREATE ----------------
class ProductCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField()
    supplier_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    created_by = serializers.CharField()
    product_image = serializers.FileField(required=False, allow_null=True)
# ---------------- UPDATE ----------------
class ProductUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    quantity = serializers.IntegerField(required=False)
    product_image = serializers.FileField(required=False, allow_null=True)    # 🔥 ALWAYS REQUIRED (PUT + PATCH)
    updated_by = serializers.CharField(required=True)
    update_reason = serializers.CharField(required=True)

    def validate(self, attrs):
        """
        Even in PATCH, updated_by & update_reason must be present
        """
        if "updated_by" not in attrs:
            raise serializers.ValidationError({
                "updated_by": "This field is required while updating product."
            })
        if "update_reason" not in attrs:
            raise serializers.ValidationError({
                "update_reason": "This field is required while updating product."
            })
        return attrs