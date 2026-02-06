from rest_framework.views import APIView
from rest_framework.response import Response
from backend_app.services.supplier_service import (create_supplier,update_supplier,delete_supplier,list_suppliers)
import rest_framework.status as status

class SupplierView(APIView):
    def get(self, request):
        # params from frontend
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        offset = (page - 1) * limit

        # passing parameters to service
        data = list_suppliers(limit=limit, offset=offset)
        
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        create_supplier(request.data)
        return Response({"message": "Supplier created successfully."})

    def put(self, request, id):
        update_supplier(id, request.data)
        return Response({"message": "Supplier updated successfully."})

    def delete(self, request, id):
        delete_supplier(id)
        return Response({"message": "Supplier deleted successfully."})