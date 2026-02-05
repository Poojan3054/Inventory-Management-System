from .db import execute_query
# =========================
# Create Supplier
# =========================
def create_supplier(data):
    execute_query(
        "SELECT sp_insert_add_supplier(%s, %s, %s)",
        [
            data.get('name'),
            data.get('contact'),
            data.get('created_by')
        ]
    )
# =========================
# Get All Suppliers
# =========================
def list_suppliers(limit=3, offset=0):
    data = execute_query(
        "SELECT * FROM sp_read_get_supplier() LIMIT %s OFFSET %s",
        [limit, offset],
        fetch=True
    )
    #for the total count of records (for Pagination UI)
    count_res = execute_query("SELECT COUNT(*) FROM tbl_suppliers", fetch=True)
    total_count = count_res[0]['count'] if count_res else 0
    
    return {"results": data, "total_count": total_count}
# =========================
# Update Supplier
# =========================
def update_supplier(id, data):
    execute_query(
        "SELECT sp_update_update_supplier(%s, %s, %s, %s, %s)",
        [
            id,
            data.get('name'),
            data.get('contact'),
            data.get('updated_by'),
            data.get('update_reason')
        ]
    )
def delete_supplier(id):
    execute_query(
        "SELECT sp_delete_delete_supplier(%s)",
        [id]
    )
