from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend_app.services.product_service import (
    create_product,
    list_products,
    update_product,
    delete_product,
)
from backend_app.serializers.product_serializer import (
    ProductCreateSerializer,
    ProductUpdateSerializer,
)
from backend_app.exception import ValidationError

class ProductListCreateView(APIView):
    def get(self, request):
        """
        List products with pagination
        """
        try:
            page = int(request.query_params.get("page", 1))
            limit = int(request.query_params.get("limit", 100))

            if page <= 0 or limit <= 0:
                raise ValidationError("Page and Limit must be positive integers.")

            offset = (page - 1) * limit
            data = list_products(limit=limit, offset=offset)

            return Response(data, status=status.HTTP_200_OK)

        except ValueError:
            raise ValidationError("Invalid pagination parameters provided.")

    def post(self, request):
        """
        Create a new product
        """
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file_obj = request.FILES.get("product_image")

        create_product(
            serializer.validated_data,
            file_obj
        )

        return Response(
            {"message": "Product created successfully"},
            status=status.HTTP_201_CREATED,
        )


class ProductUpdateDeleteView(APIView):
    def put(self, request, id):
        """
        Update full product details
        """
        if not id:
            raise ValidationError("Product ID is required for update.")

        serializer = ProductUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file_obj = request.FILES.get("product_image")

        update_product(
            id,
            serializer.validated_data,
            file_obj
        )

        return Response(
            {"message": "Product updated successfully"},
            status=status.HTTP_200_OK,
        )

    def patch(self, request, id):
        """
        Partial update of product
        """
        serializer = ProductUpdateSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        file_obj = request.FILES.get("product_image")

        update_product(
            id,
            serializer.validated_data,
            file_obj
        )

        return Response(
            {"message": "Product partially updated successfully"},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, id):
        """
        Delete a product
        """
        if not id or int(id) <= 0:
            raise ValidationError("A valid Product ID is required for deletion.")

        delete_product(id)

        return Response(
            {"message": "Product deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
