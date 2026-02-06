import { Formik, Form, Field } from "formik";
import api from "../../api/axios";

type Props = {
  onSuccess?: () => void;
  category?: any; // એડિટ માટે ડેટા લેશે
};

export default function CategoryForm({ onSuccess, category }: Props) {
  const isEdit = Boolean(category);
  
  // લોકલ સ્ટોરેજમાંથી યુઝરનું નામ મેળવો
  const currentUsername = localStorage.getItem("username") || "Admin";

  return (
    <Formik
      enableReinitialize={true} 
      initialValues={{ 
        name: category?.name || "", 
        created_by: category?.created_by || currentUsername,
        updated_by: currentUsername,
        update_reason: "" // એડિટ માટેનું નવું ફિલ્ડ
      }}
      onSubmit={async (values, { resetForm }) => {
        try {
          // આ પેલોડમાં બધી જ 'Required' કીઝ (updated_by, update_reason) ઉમેરી છે
          const payload: any = {
            name: values.name,
            updated_by: currentUsername,
            update_reason: values.update_reason || "Updated via dashboard"
          };

          if (isEdit) {
            // PUT રિક્વેસ્ટ - KeyError: 'update_reason' હવે નહીં આવે
            await api.put(`/categories/${category.id}/`, payload);
            alert("Category updated successfully!");
          } else {
            // POST રિક્વેસ્ટ - નવી કેટેગરી માટે
            const postPayload = {
              ...payload,
              created_by: currentUsername
            };
            await api.post("/categories/", postPayload);
            alert("Category added successfully!");
          }

          resetForm();
          if (onSuccess) onSuccess();
        } catch (err: any) {
          console.error("Server Error:", err.response?.data);
          const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Server Error";
          alert("Operation failed: " + errorMsg);
        }
      }}
    >
      <Form className="border-0 p-4">
        <div className="mb-3">
          <label className="form-label fw-bold">
            {isEdit ? "Edit Category Name" : "Category Name"}
          </label>
          <Field 
            name="name" 
            className="form-control shadow-sm" 
            placeholder="Enter category name" 
            required 
          />
        </div>

        {/* એડિટ મોડમાં કારણ લખવા માટેનું ફિલ્ડ */}
        {isEdit && (
          <div className="mb-3">
            <label className="form-label fw-bold">Reason for Update</label>
            <Field 
              name="update_reason" 
              className="form-control shadow-sm" 
              placeholder="Why are you changing this?" 
              required 
            />
          </div>
        )}

        <button type="submit" className="btn btn-success w-100 shadow-sm py-2 fw-bold mt-2">
          {isEdit ? "Update Category" : "Save Category"}
        </button>
      </Form>
    </Formik>
  );
}