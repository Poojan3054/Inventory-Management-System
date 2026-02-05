import { Formik, Form, Field } from "formik";
import productSchema from "../../validations/productSchema";
import api from "../../api/axios";
import CategorySelect from "../categories/CategorySelect";
import SupplierSelect from "../suppliers/SupplierSelect";
import FileUpload from "./FileUpload";

type Props = {
  onSuccess: () => void; 
  editData?: any;
};

export default function ProductForm({ onSuccess, editData }: Props) {
  const isEdit = Boolean(editData);
  // Get actual username from storage
  const currentUsername = localStorage.getItem("username") || "Unknown";

  return (
    <Formik
      initialValues={{
        name: editData?.name || "",
        price: editData?.price || 0,
        quantity: editData?.quantity || 0,
        supplier_id: editData?.supplier_id || 0,
        category_id: editData?.category_id || 0,
        created_by: currentUsername, // Use dynamic username
        updated_by: currentUsername, // Use dynamic username
        update_reason: editData?.update_reason || "",
        product_image: null, 
      }}
      validationSchema={productSchema}
      onSubmit={async (values, { resetForm }) => {
        if (values.price < 0 || values.quantity < 0) {
          alert("Please enter a valid positive value");
          return;
        }

        const formData = new FormData();
        
        formData.append("name", values.name);
        formData.append("price", (values.price || 0).toString());
        formData.append("quantity", (values.quantity || 0).toString());
        formData.append("supplier_id", (values.supplier_id || "").toString());
        formData.append("category_id", (values.category_id || "").toString());
        
        if (isEdit) {
            formData.append("updated_by", currentUsername);
            formData.append("update_reason", values.update_reason || "");
        } else {
            formData.append("created_by", currentUsername);
        }

        if (values.product_image) {
            formData.append("product_image", values.product_image);
        }

        try {
          if (isEdit) {
            if (!values.update_reason) {
              alert("Update Reason is required");
              return;
            }
            await api.put(`/products/${editData.id}/`, formData);
            alert("Product updated successfully");
          } else {
            await api.post("/products/", formData);
            alert("Product created successfully");
          }
          resetForm();
          if (onSuccess) onSuccess();
        } catch (err: any) {
          alert("Operation failed: " + (err.response?.data?.error || "Error"));
        }
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="p-1 mb-1 border-0">
          <h5 className="mb-3 text-primary fw-bold">
            {isEdit ? "Edit Product Details" : "Enter Product Details"}
          </h5>
          
          <div className="mb-2">
            <label className="small fw-bold">Product Name</label>
            <Field name="name" className="form-control" placeholder="Enter Name" />
          </div>

          <div className="mb-2">
            <FileUpload 
              label={isEdit ? "Update File (Image/PDF/Doc)" : "Upload File (Image/PDF/Doc)"} 
              onFileSelect={(file) => setFieldValue("product_image", file)} 
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="small fw-bold">Price</label>
              <Field name="price" type="number" className="form-control" />
            </div>
            <div className="col-md-6 mb-2">
              <label className="small fw-bold">Quantity</label>
              <Field name="quantity" type="number" className="form-control" />
            </div>
          </div>

          <div className="mb-2">
            <label className="small fw-bold">Supplier</label>
            <SupplierSelect value={values.supplier_id} onChange={(v) => setFieldValue("supplier_id", v)} />
          </div>

          <div className="mb-2">
            <label className="small fw-bold">Category</label>
            <CategorySelect value={values.category_id} onChange={(v) => setFieldValue("category_id", v)} />
          </div>

          {isEdit && (
            <div className="bg-light p-2 rounded border mt-3">
              <label className="small fw-bold text-danger">Update Info *</label>
              <Field name="update_reason" className="form-control form-control-sm" placeholder="Reason for update" />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 mt-4 shadow-sm">
            {isEdit ? "Update Product" : "Save Product"}
          </button>
        </Form>
      )}
    </Formik>
  );
}