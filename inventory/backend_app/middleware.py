import logging
import jwt
import datetime
from django.conf import settings
from django.http import JsonResponse
from .exception import (
    DatabaseFetchError,
    APICallingError,
    ValidationError,
)
logger = logging.getLogger("django")
class CustomExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        """
        Middleware entry point:
        - JWT authentication
        - Attach user_id to request
        """
        # ---------------- JWT AUTH LOGIC ----------------
        exempt_urls = [
            "/api/login/",
            "/api/register/",
            "/api/token/refresh/",
            "/api/send-otp/",
            "/api/reset-password/",
        ]


        # Allow media files without auth
        if request.path.startswith("/media/"):
            return self.get_response(request)

        # Allow exempt URLs without token
        if any(request.path.startswith(url) for url in exempt_urls):
            return self.get_response(request)

        # Get Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse(
                {
                    "status": "error",
                    "message": "Unauthorized: Access token is missing or invalid.",
                },
                status=401,
            )

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
            )
            # Debug logs (terminal visibility)
            exp_time = datetime.datetime.fromtimestamp(
                payload["exp"]
            ).strftime("%Y-%m-%d %H:%M:%S")

            iat_time = datetime.datetime.fromtimestamp(
                payload["iat"]
            ).strftime("%Y-%m-%d %H:%M:%S")

            print("----------------------------")
            print(f"JWT PAYLOAD: {payload}")
            print(f"Issued At (IST): {iat_time}")
            print(f"Expires At (IST): {exp_time}")
            print("----------------------------")

            # Attach user_id to request
            request.user_id = payload.get("user_id")

        except jwt.ExpiredSignatureError:
            return JsonResponse(
                {"status": "error", "message": "Token has expired."},
                status=401,
            )
        except jwt.InvalidTokenError:
            return JsonResponse(
                {"status": "error", "message": "Invalid token."},
                status=401,
            )

        return self.get_response(request)

    def process_exception(self, request, exception):
        """
        Centralized exception handling
        """
        logger.error(
            f"Error: {type(exception).__name__} | Message: {str(exception)}"
        )

        if isinstance(exception, DatabaseFetchError):
            status_code = 500
            message = f"Database Error: {str(exception)}"

        elif isinstance(exception, APICallingError):
            status_code = 502
            message = f"API Connection Error: {str(exception)}"

        elif isinstance(exception, ValidationError):
            status_code = 400
            message = f"Input Error: {str(exception)}"

        else:
            status_code = 500
            message = "This is an unexpected error. Please contact support."

        return JsonResponse(
            {
                "status": "error",
                "message": message,
                "error_type": type(exception).__name__,
            },
            status=status_code,
        )
