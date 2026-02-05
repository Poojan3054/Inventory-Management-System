from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes, permission_classes
from backend_app.services import auth_service

@authentication_classes([])
@permission_classes([AllowAny])

class RegisterView(APIView):
    def post(self, request):
        res, code = auth_service.register_user(request.data)
        return Response(res, status=code)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)
            
        res, code = auth_service.login_user(username, password)
        return Response(res, status=code)

class RefreshTokenView(APIView):
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