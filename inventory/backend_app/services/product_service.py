from .db import execute_query
from django.core.files.storage import FileSystemStorage
# Importing custom exceptions
from backend_app.exception import DatabaseFetchError, DatabaseUpdateError

# ---------------- CREATE ----------------
def create_product(data, file_obj=None):
    try:
        file_path = None
        if file_obj:
            fs = FileSystemStorage()
            filename = fs.save(f'products/{file_obj.name}', file_obj)
            file_path = filename

        execute_query(
            "SELECT sp_insert_add_product(%s,%s,%s,%s,%s,%s,%s)",
            [
                data["name"],
                data["price"],
                data["quantity"],
                data["supplier_id"],
                data["category_id"],
                data["created_by"],
                file_path  
            ]
        )
    except Exception as e:
        # Raising custom error if the INSERT operation fails
        raise DatabaseUpdateError(f"Failed to create product in database: {str(e)}")

# ---------------- READ ----------------
def list_products(limit=5, offset=0):
    try:
        data = execute_query(
            "SELECT * FROM sp_read_get_product() LIMIT %s OFFSET %s",
            [limit, offset],
            fetch=True
        )
        
        count_res = execute_query("SELECT COUNT(*) as count FROM tbl_products WHERE status = TRUE", fetch=True)
        total_count = count_res[0]['count'] if count_res else 0
        
        # Scenario: If no data is found, you can choose to raise an error or return empty
        if not data and offset == 0:
            raise DatabaseFetchError("No products found in the database.")

        return {"results": data, "total_count": total_count}
    except DatabaseFetchError as de:
        raise de
    except Exception as e:
        # Catching any other database connection or query issues
        raise DatabaseFetchError(f"Error fetching product list: {str(e)}")

# ---------------- SEARCH ----------------
def search_products(query):
    try:
        return execute_query(
            "SELECT * FROM sp_search_get_product(%s)",
            [query],
            fetch=True
        )
    except Exception as e:
        raise DatabaseFetchError(f"Search operation failed: {str(e)}")

# ---------------- UPDATE ----------------
def update_product(product_id, data, file_obj=None):
    try:
        file_path = data.get("product_image") 
        
        if file_obj:
            fs = FileSystemStorage()
            filename = fs.save(f'products/{file_obj.name}', file_obj)
            file_path = filename

        query = "SELECT sp_update_update_product(%s, %s, %s, %s, %s, %s, %s)"
        params = [
            product_id, 
            data["name"], 
            data["price"], 
            data["quantity"], 
            data.get("update_reason", ""), 
            data.get("updated_by", "Admin"),
            file_path 
        ]
        return execute_query(query, params)
    except Exception as e:
        # Raising update error for failures during the update procedure
        raise DatabaseUpdateError(f"Failed to update product ID {product_id}: {str(e)}")

# ---------------- DELETE ----------------
def delete_product(id):
    try:
        execute_query(
            "SELECT sp_delete_delete_product(%s)",
            [id]
        )
    except Exception as e:
        # Raising error if delete procedure fails
        raise DatabaseUpdateError(f"Could not delete product ID {id}: {str(e)}")