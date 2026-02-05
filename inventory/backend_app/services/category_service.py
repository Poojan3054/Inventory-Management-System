from .db import execute_query

def create_category(data):
    execute_query(
        "SELECT sp_insert_add_category(%s, %s)",
        [data['name'], data['created_by']]
    )

def list_categories(limit=3, offset=0):
    data = execute_query(
        "SELECT * FROM sp_read_get_category() LIMIT %s OFFSET %s",
        [limit, offset],
        fetch=True
    )
    count_res = execute_query("SELECT COUNT(*) FROM tbl_categories", fetch=True)
    total_count = count_res[0]['count'] if count_res else 0
    return {"results": data, "total_count": total_count}

# --- NEW FUNCTION FOR VIEW CONNECTION FEATURE ---
def get_category_connections():
    """
    Fetch joined data from categories, products, and suppliers using Raw SQL.
    We use Aliases (c_name, p_name, s_name) to prevent key overwriting in React.
    """
    query = """
        SELECT 
            c.name AS c_name, 
            p.name AS p_name, 
            s.name AS s_name
        FROM tbl_products p
        INNER JOIN tbl_categories c ON p.category_id = c.id
        INNER JOIN tbl_suppliers s ON p.supplier_id = s.id
    """
    return execute_query(query, fetch=True)

def update_category(id, data):
    execute_query(
        "SELECT sp_update_update_category(%s, %s, %s, %s)",
        [id, data['name'], data['updated_by'], data['update_reason']]
    )

def delete_category(id):
    execute_query(
        "SELECT sp_delete_delete_category(%s)",
        [id]
    )