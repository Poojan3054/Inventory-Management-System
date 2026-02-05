from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from rest_framework.permissions import AllowAny 

class DashboardStatsView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT count(*) FROM tbl_products")
                total_products = cursor.fetchone()[0]
                
                cursor.execute("SELECT count(*) FROM tbl_categories")
                total_categories = cursor.fetchone()[0]
                
                cursor.execute("SELECT count(*) FROM tbl_suppliers")
                total_suppliers = cursor.fetchone()[0]

            return Response({
                "totalProducts": total_products,
                "totalCategories": total_categories,
                "totalSuppliers": total_suppliers
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)