import React, { useRef } from "react";
import { FileUp } from "lucide-react";

interface Props {
  label: string;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  resetAfterSelect?: boolean;
}

export const UploadButton: React.FC<Props> = ({
  label,
  onFileSelect,
  accept = ".csv,text/csv",
  resetAfterSelect = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    if (resetAfterSelect && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        ref={fileInputRef}
      />
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
      >
        <FileUp className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
};
