from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend_app.services.category_service import (
    create_category,
    list_categories,
    update_category,
    delete_category,
    get_category_connections,
)
from backend_app.serializers.category_serializer import CategorySerializer


class CategoryListCreateView(APIView):
    def get(self, request):
        """
        List categories with pagination
        """
        page = int(request.query_params.get("page", 1))
        limit = int(request.query_params.get("limit", 3))
        offset = (page - 1) * limit

        data = list_categories(limit=limit, offset=offset)
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new category
        """
        serializer = CategorySerializer(data=request.data)

        if serializer.is_valid():
            create_category(serializer.validated_data)
            return Response(
                {"message": "Category created"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryUpdateDeleteView(APIView):
    def put(self, request, id):
        """
        Update category
        """
        serializer = CategorySerializer(data=request.data)

        if serializer.is_valid():
            update_category(id, serializer.validated_data)
            return Response(
                {"message": "Category updated"},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        """
        Delete category
        """
        delete_category(id)

        return Response(
            {"message": "Category deleted"},
            status=status.HTTP_200_OK,
        )


class CategoryConnectionView(APIView):
    """
    API View to handle category-product-supplier relationships
    """

    def get(self, request):
        try:
            data = get_category_connections()
            return Response(
                {"status": "success", "data": data},
                status=status.HTTP_200_OK,
            )
        except Exception:
            # Custom middleware will handle the exception
            raise
