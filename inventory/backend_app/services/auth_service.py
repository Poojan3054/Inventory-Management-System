import jwt
import bcrypt
import re
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from backend_app.services.db import execute_query

# ---------------- PASSWORD UTILS ----------------
def validate_password(password):
    """Checks if the password meets security requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password):
        return False, "Password must contain uppercase and lowercase letters."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain a special character."
    return True, ""

def hash_password(password):
    """Hashes the password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def check_password(password, hashed_password):
    """Verifies the plain password against the hashed password."""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

# ---------------- JWT ----------------
def generate_tokens(user_id, role): 
    """Generates Access and Refresh tokens with user details and role."""
    access_payload = {
        "user_id": user_id,
        "role": role,        
        "exp": timezone.now() + timezone.timedelta(hours=24),
        "iat": timezone.now()
    }
    refresh_payload = {
        "user_id": user_id,
        "role": role,        
        "exp": timezone.now() + timezone.timedelta(days=7),
        "iat": timezone.now()
    }
    access = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
    refresh = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")
    return access, refresh

def refresh_access_token(refresh_token):
    """Decodes the refresh token and generates a new access token."""
    payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = payload["user_id"]
    role = payload.get("role", "user") # Safely extract role

    access_payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")

# ---------------- AUTH FLOWS (SP BASED) ----------------

def register_user(data):
    """Handles new user registration by calling the stored procedure."""
    is_valid, msg = validate_password(data.get("password", ""))
    if not is_valid: return {"error": msg}, 400

    hashed_pw = hash_password(data["password"])
    # Uses 3 parameters as defined in sp_auth_register
    res = execute_query("SELECT * FROM sp_auth_register(%s, %s, %s)", 
                        [data["username"], data["email"], hashed_pw], fetch=True)
    return {"message": res[0]['res_message']}, res[0]['res_code']


def login_user(username, password):
    """Handles user login, unlocks status, and verifies credentials."""
    # 1. GET_STATUS: Retrieve user info and current lockout status
    res = execute_query(
        "SELECT * FROM sp_user_access_manager(%s, %s, %s, %s, %s)", 
        [username, 'GET_STATUS', None, None, None], 
        fetch=True
    )    
    if not res:
        return {"error": "Invalid username or password"}, 401
        
    user_st = res[0]

    # Handle locked accounts based on SP response
    if user_st.get('res_code') == 403:
        return {
            "error": "Account locked", 
            "is_locked": True, 
            "seconds_left": user_st.get('seconds_left', 0)
        }, 403   

    hashed_password = user_st.get('hashed_password')
    if not hashed_password:
        return {"error": "Invalid credentials"}, 401
        
    # Verify the password
    is_match = check_password(password, hashed_password)
    
    # 2. UPDATE_ATTEMPT: Log the successful or failed login attempt in DB
    upd_res = execute_query(
        "SELECT * FROM sp_user_access_manager(%s, %s, %s, %s, %s)", 
        [username, 'UPDATE_ATTEMPT', is_match, None, None], 
        fetch=True
    )
    
    if is_match:
            # 1. સાચો રોલ મેળવો (upd_res માંથી લેવો વધુ સુરક્ષિત છે)
            db_role = upd_res[0].get('role')
            user_role = db_role.lower() if db_role else 'user'
            
            # 2. સાચું યુઝર આઈડી મેળવો
            user_id = upd_res[0].get('user_id') 
            
            # 3. ટોકન જનરેટ કરો
            access, refresh = generate_tokens(user_id, user_role)
            
            return {
                "access": access, 
                "refresh": refresh, 
                # અહીં 'res_username' વાપરવું કારણ કે SP માં આપણે નામ બદલ્યું છે
                "username": upd_res[0].get('res_username', username), 
                "role": user_role
            }, 200    
    # Return error message for failed login
    res_data = upd_res[0]
    response_payload = {
        "error": res_data.get('res_message', "Invalid password"),
        "is_locked": res_data.get('is_locked', False),
        "seconds_left": res_data.get('seconds_left', 0)
    }
    
    return response_payload, res_data.get('res_code', 401)


def send_otp(email):
    """Generates a random OTP, saves it in DB, and sends it via email."""
    otp = str(random.randint(100000, 999999)) 
    res = execute_query(
        "SELECT * FROM sp_user_access_manager(%s, %s, %s, %s, %s)", 
        [email, 'SET_OTP', None, otp, None], 
        fetch=True
    )

    if res[0]['res_code'] == 200:
        send_mail("Reset OTP", f"Your OTP is {otp}", settings.EMAIL_HOST_USER, [email])
        return {"message": "OTP sent successfully"}, 200
    return {"error": res[0]['res_message']}, res[0]['res_code']


def reset_password_with_otp(email, otp_input, new_password):
    """Verifies the OTP and updates the user's password."""
    hashed_pw = hash_password(new_password)
    # 4. VERIFY_RESET: Verify provided OTP and update password if correct
    res = execute_query(
        "SELECT * FROM sp_user_access_manager(%s, %s, %s, %s, %s)", 
        [email, 'VERIFY_RESET', None, otp_input, hashed_pw], fetch=True
    )
    return {"message": res[0]['res_message']}, res[0]['res_code']