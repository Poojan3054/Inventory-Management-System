import * as Yup from "yup";

export default Yup.object({
  name: Yup.string().required("Required"),
  price: Yup.number().required("Required"),
  quantity: Yup.number().required("Required"),
  supplier_id: Yup.number().required("Supplier required"),
  category_id: Yup.number().required("Category required"),
});
