"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File as FileIcon, Eye, Trash2 } from "lucide-react";
import FilePreviewModal from "./FilePreviewModal";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number; // in bytes
  accept?: string; // e.g., "image/*,application/pdf"
}

export default function FileUploader({ onFilesSelected, maxSize = 10 * 1024 * 1024, accept = "*/*" }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.size <= maxSize);
    
    if (validFiles.length < newFiles.length) {
      alert(`Some files were skipped because they exceed the ${maxSize / 1024 / 1024}MB limit.`);
    }

    setFiles(prev => {
      const updated = [...prev, ...validFiles];
      onFilesSelected(updated);
      return updated;
    });
  }, [maxSize, onFilesSelected]);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelected(updated);
      return updated;
    });
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          multiple 
          accept={accept}
          onChange={onInputChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-500" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              <button 
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
              >
                Click to upload
              </button>
              {" "}or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, Images, Video, Audio up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-gray-200 border rounded-md overflow-hidden bg-white shadow-sm">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  {file.type.startsWith("image/") ? (
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                  ) : (
                    <FileIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <FilePreviewModal 
          file={previewFile} 
          isOpen={!!previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </div>
  );
}
