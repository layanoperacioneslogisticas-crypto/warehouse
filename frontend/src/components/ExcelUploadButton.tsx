import { ChangeEvent } from "react";

export function ExcelUploadButton({
  onFile
}: {
  onFile: (file: File) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <label className="btn btn-outline-primary">
      Carga masiva
      <input type="file" hidden accept=".xlsx,.xls" onChange={handleChange} />
    </label>
  );
}

