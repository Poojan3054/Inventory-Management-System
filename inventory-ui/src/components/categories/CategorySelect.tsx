import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Props {
  value: number ;
  onChange: (value: number) => void;
}
export default function CategorySelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => { 
    api.get("/categories/").then((res) => {
      // --- UPDATED: Check if data comes in 'results' (for backend pagination) ---
      // If res.data.results exists, use it; otherwise, use res.data directly
      const data = res.data.results ? res.data.results : res.data;
      
      // Ensure the data is an array before setting state to avoid .map errors
      setCategories(Array.isArray(data) ? data : []);
    }).catch(err => {
      console.error("Error fetching categories:", err);
      setCategories([]);
    });
  }, []);

  return ( 
    <select className="form-select" value={value} onChange={(e) => onChange(Number(e.target.value))} >
      <option value={0}>Select Category</option>
      {/* categories will now be an array, so .map will work correctly */}
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}