import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function SupplierSelect({ value, onChange }: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    // Fetching suppliers for the dropdown
    api.get("/suppliers/")
      .then((res) => {
        // Handling backend response format (results array)
        const data = res.data.results ? res.data.results : res.data;
        setSuppliers(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error fetching suppliers:", err));
  }, []);

  return (
    <select className="form-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value={0}>Select Supplier</option>
      {suppliers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}