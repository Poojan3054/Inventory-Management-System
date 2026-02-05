from django.db import connection

def execute_query(query, params=None, fetch=False):
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        if fetch:
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
