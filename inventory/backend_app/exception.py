from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_drf_exception_handler(exc, context):
    # call the default DRF exception handler first
    response = exception_handler(exc, context)
    # if DRF caught an error, we format it in our preferred way
    if response is not None:
        custom_data = {
            "status": "error",
            "message": response.data.get("detail", str(exc)),
            "error_type": exc.__class__.__name__
        }
        response.data = custom_data
    return response
class ProductAppError(Exception):
    """Base class for all custom exceptions in the Product application"""
    def __init__(self, message="A product application error occurred"):
        self.message = message
        super().__init__(self.message)

class ValidationError(ProductAppError):
    """Raised when request validation fails in views (e.g. invalid params)"""
    def __init__(self, message="Invalid input data provided"):
        super().__init__(message)

class DatabaseFetchError(ProductAppError):
    """Raised when data retrieval from the database fails or returns no results"""
    def __init__(self, message="Failed to retrieve data from database"):
        super().__init__(message)

class DatabaseUpdateError(ProductAppError):
    """Raised when an INSERT, UPDATE, or DELETE operation fails in the database"""
    def __init__(self, message="Failed to update database record"):
        super().__init__(message)

class APICallingError(ProductAppError):
    """Raised when there is an issue calling internal or external APIs"""
    def __init__(self, message="Error while calling external API"):
        super().__init__(message)

class InvalidFileFormatError(ProductAppError):
    """Raised when the uploaded file type is not supported"""
    def __init__(self, message="Unsupported file format uploaded"):
        super().__init__(message)

class PermissionDeniedError(ProductAppError):
    """Raised when a user attempts an unauthorized action"""
    def __init__(self, message="You do not have permission to perform this action"):
        super().__init__(message)