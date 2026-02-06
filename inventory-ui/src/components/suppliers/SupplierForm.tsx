import { Formik, Form, Field, ErrorMessage } from "formik";
import api from "../../api/axios";

// Added supplier prop for editing
export default function SupplierForm({ supplier, onSuccess }: { supplier?: any; onSuccess?: () => void }) {
  return (
    <Formik
      // Dynamically set initial values based on whether we are editing or adding
      initialValues={{ 
        name: supplier?.name || "", 
        contact: supplier?.contact || "", 
        created_by: supplier?.created_by || "Admin" 
      }}
      enableReinitialize={true}
      validate={(values) => {
        const errors: any = {};       
        if (values.contact && !/^\d{10}$/.test(values.contact)) {
          errors.contact = "mobile number must be 10 digits";
        }
        return errors;
      }}
      onSubmit={(values, { resetForm }) => {
        const request = supplier 
          ? api.put(`/suppliers/${supplier.id}/`, values) // Update
          : api.post("/suppliers/", values); // Create

        request.then(() => {
          alert(supplier ? "Supplier updated successfully" : "Supplier added successfully");
          resetForm();
          if (onSuccess) onSuccess();
        }).catch(err => {
          alert("Operation failed: " + (err.response?.data?.detail || "Something went wrong"));
        });
      }}
    >
      {({ setFieldValue }) => (
        <Form className="p-3">
          <div className="mb-3">
            <label className="form-label small fw-bold">Supplier Name</label>
            <Field name="name" className="form-control" placeholder="Supplier Name" required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Contact Number</label>
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
          <button type="submit" className="btn btn-warning w-100 fw-bold">
            {supplier ? "Update Supplier" : "Save Supplier"}
          </button>
        </Form>
      )}
    </Formik>
  );
}