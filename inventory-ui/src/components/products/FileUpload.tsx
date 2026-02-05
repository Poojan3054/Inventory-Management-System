import React, { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, label = "Product File" }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>(""); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileType(file.type); 
      onFileSelect(file); 

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null); 
      }
    }
  };

  return (
    <div className="mb-3">
      <label className="fw-bold small text-muted text-uppercase mb-1">{label}</label>
      <div className="border p-2 rounded bg-light">
        <input 
          type="file" 
          className="form-control" 
          onChange={handleFileChange} 
          accept=".jpg, .jpeg, .png, .pdf, .docx, .xlsx"
        />
        {preview && fileType.startsWith('image/') && (
          <div className="mt-2 text-center">
            <img src={preview} alt="Preview" className="rounded shadow-sm" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
          </div>
        )}
        {!fileType.startsWith('image/') && fileType !== "" && (
          <div className="mt-2 text-center p-2 bg-white rounded border">
             <span className="text-primary font-weight-bold">📄 File Selected:</span> 
             <small className="d-block text-muted">Ready to upload</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;