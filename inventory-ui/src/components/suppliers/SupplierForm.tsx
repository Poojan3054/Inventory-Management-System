import { Formik, Form, Field, ErrorMessage } from "formik";
import api from "../../api/axios";

export default function SupplierForm({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <Formik
      initialValues={{ name: "", contact: "", created_by: "Admin" }}
      validate={(values) => {
        const errors: any = {};       
        if (values.contact && !/^\d{10}$/.test(values.contact)) {
          errors.contact = "mobile number must be 10 digits";
        }
        return errors;
      }}
      onSubmit={(values, { resetForm }) => {
        api.post("/suppliers/", values).then(() => {
          alert("Supplier added successfully");
          resetForm();
          if (onSuccess) onSuccess();
        }).catch(err => {
          alert("Error adding supplier: " + (err.response?.data?.detail || "Something went wrong"));
        });
      }}
    >
      {({ setFieldValue, values }) => (
        <Form>
          <div className="mb-2">
            <Field name="name" className="form-control" placeholder="Supplier Name" required />
          </div>
          <div className="mb-2">
            <Field
              name="contact"
              type="text"
              className="form-control"
              placeholder="Contact Number (10 digits)"
              maxLength={10} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;          
                if (/^\d*$/.test(val)) {
                  setFieldValue("contact", val);
                }
              }}
            />
            <ErrorMessage name="contact" component="div" className="text-danger small" />
          </div>
          <button type="submit" className="btn btn-primary w-100">Save Supplier</button>
        </Form>
      )}
    </Formik>
  );
}