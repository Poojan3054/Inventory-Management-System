from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status  # status ઇમ્પોર્ટ કરવું જરૂરી છે
from rest_framework.permissions import AllowAny
# ડેકોરેટર્સની જરૂર નથી જો તમે ક્લાસની અંદર વેરીએબલ વાપરો છો
from backend_app.services import auth_service

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        res, code = auth_service.register_user(request.data)
        return Response(res, status=code)

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)
            
        res, code = auth_service.login_user(username, password)
        return Response(res, status=code)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            access = auth_service.refresh_access_token(request.data.get("refresh"))
            return Response({"access": access})
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=401)

class SendOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        res, code = auth_service.send_otp(request.data.get("email"))
        return Response(res, status=code)

class ResetPasswordWithOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        res, code = auth_service.reset_password_with_otp(
            request.data.get("email"),
            request.data.get("otp"),
            request.data.get("new_password")
        )
        return Response(res, status=code)

class UserListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            # ખાતરી કરજો કે ડેટાબેઝમાં ટેબલનું નામ 'tbl_users' જ છે
            query = "SELECT id, username, email FROM tbl_users ORDER BY id ASC"
            
            # auth_service માંથી execute_query કોલ કરો
            users = auth_service.execute_query(query, fetch=True)
            
            return Response(users if users else [], status=status.HTTP_200_OK)
            
        except Exception as e:
            # જો execute_query ફંક્શન auth_service માં ન હોય તો સીધું ઇમ્પોર્ટ કરવું પડશે
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)