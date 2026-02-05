import { Formik, Form, Field } from "formik";
import api from "../../api/axios";

// add onSuccess prop jethi parent component ne notify kari sako
export default function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <Formik
    initialValues={{ name: "", created_by: "Admin" }} // add created_by field
    onSubmit={(values, { resetForm }) => {
    api.post("/categories/", values)
      .then(() => {
        alert("Category added successfully!");
        resetForm();
        if (onSuccess) onSuccess();
      })
      .catch(err => {
        console.error("Error:", err.response?.data);
        alert("sorry! Category addition failed.");
      });
  }}
>
      <Form className="mb-3 border p-3 rounded shadow-sm">
        <label className="form-label fw-bold">Add New Category</label>
        <Field name="name" className="form-control mb-2" placeholder="Category Name"  required />
        <button type="submit" className="btn btn-primary w-100">Save Category</button>
      </Form>
    </Formik>
  );
}