from django.urls import path
from backend_app.views.supplier import SupplierView
from backend_app.views.category import *
from backend_app.views.product import *
from .views.auth_views import RegisterView, LoginView, RefreshTokenView,SendOTPView,ResetPasswordWithOTPView

urlpatterns = [
    # Registration Route
    path('register/', RegisterView.as_view(), name='register'),
    
    # Login Route
    path('login/', LoginView.as_view(), name='login'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('reset-password/', ResetPasswordWithOTPView.as_view(), name='reset-password'),
    
    # Token Refresh Route - Used by Axios when access token expires
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('suppliers/', SupplierView.as_view()),
    path('suppliers/<int:id>/', SupplierView.as_view()),
    
    path('categories/', CategoryListCreateView.as_view()),
    path('categories/<int:id>/', CategoryUpdateDeleteView.as_view()),
    path('category-connections/', CategoryConnectionView.as_view(), name='category-connections'),

    path('products/', ProductListCreateView.as_view()),
    path('products/<int:id>/', ProductUpdateDeleteView.as_view()),
]
