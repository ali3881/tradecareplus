"use client";

import { useState } from "react";
import { Upload, X, FileVideo, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { parseResponse } from "@/lib/http";

interface ServiceRequestFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

  interface FilePreview {
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  key?: string;
  id?: string; // Add id
}

export default function ServiceRequestForm({ onClose, onSuccess }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState({
    type: "LEAKING_TAP",
    description: "",
    urgency: "NORMAL",
    afterHours: false,
    locationText: "",
    preferredContactMethod: "CALL",
  });
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
       // @ts-ignore
       setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const
      }));
      
      // Validate limits (max 5 files total)
      if (files.length + newFiles.length > 5) {
          alert("You can only upload up to 5 files.");
          return;
      }

      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[index].previewUrl);
        newFiles.splice(index, 1);
        return newFiles;
    });
  };

  const uploadFile = (fileItem: FilePreview, index: number): Promise<{key: string, id: string}> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update status to uploading
            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[index].status = 'uploading';
                return newFiles;
            });

            // 1. Get Presigned URL
            const presignRes = await fetch("/api/uploads/presign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    mime: fileItem.file.type, 
                    size: fileItem.file.size, 
                    filename: fileItem.file.name, 
                    context: "service-requests" 
                })
            });

            const parsed = await parseResponse(presignRes);

            if (!parsed.ok) {
                const errorMsg = parsed.json?.message || parsed.text || "Failed to get upload URL";
                throw new Error(errorMsg);
            }

            const { uploadUrl, key, publicUrl } = parsed.json;

            // 2. Upload File
            const xhr = new XMLHttpRequest();
            const finalUploadUrl = uploadUrl.startsWith('/') 
                ? window.location.origin + uploadUrl 
                : uploadUrl;

            xhr.open("PUT", finalUploadUrl);
            xhr.setRequestHeader("Content-Type", fileItem.file.type || "application/octet-stream");
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setFiles(prev => {
                        const newFiles = [...prev];
                        if (newFiles[index]) {
                            newFiles[index].progress = percent;
                        }
                        return newFiles;
                    });
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    // 3. Confirm Upload
                    try {
                        const confirmRes = await fetch("/api/uploads/confirm", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                key,
                                url: publicUrl, // or construct it if needed
                                mime: fileItem.file.type,
                                size: fileItem.file.size,
                                originalName: fileItem.file.name
                            })
                        });
                        
                        const confirmParsed = await parseResponse(confirmRes);
                        
                        if (!confirmParsed.ok && confirmRes.status !== 409) {
                             throw new Error("Failed to confirm upload");
                        }
                        
                        // If 409, it means it already exists (maybe retry), we can proceed or use the existing one?
                        // Assuming success or idempotent
                        const asset = confirmParsed.json;

                        setFiles(prev => {
                            const newFiles = [...prev];
                            if (newFiles[index]) {
                                newFiles[index].status = 'completed';
                                newFiles[index].key = key;
                                newFiles[index].id = asset.id;
                            }
                            return newFiles;
                        });
                        resolve({ key, id: asset.id });
                    } catch (confirmErr) {
                         reject(confirmErr);
                    }
                } else {
                    reject(new Error("Upload failed"));
                }
            };

            xhr.onerror = () => reject(new Error("Upload failed"));
            xhr.send(fileItem.file);

        } catch (err) {
            // ... error handling
            setFiles(prev => {
                const newFiles = [...prev];
                if (newFiles[index]) {
                    newFiles[index].status = 'error';
                }
                return newFiles;
            });
            reject(err);
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Upload all pending files
      const attachmentKeys: string[] = [];
      
      // Filter out files that are already completed (if we were to support re-submission, but here we just upload pending)
      // Actually we need to upload all 'pending' files. 'completed' ones already have keys.
      
      const uploadPromises = files.map((file, index) => {
          if (file.status === 'completed' && file.key && file.id) {
              return Promise.resolve({ key: file.key, id: file.id });
          }
          return uploadFile(file, index);
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const keys = uploadedFiles.map(f => f.key);
      const ids = uploadedFiles.map(f => f.id);
      
      // 2. Submit Service Request
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attachmentKeys: keys, attachmentIds: ids }),
      });

      const parsed = await parseResponse(res);

      if (!parsed.ok) {
          if (parsed.data?.issues && Array.isArray(parsed.data.issues)) {
              throw new Error(parsed.data.issues.map((err: any) => err.message).join(", "));
          }
          throw new Error(parsed.data?.message || parsed.text || "Failed to submit request");
      }

      if (onSuccess) onSuccess();
      onClose();
      alert("Job posted successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
            Log a Job
            </h3>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                >
                <option value="LEAKING_TAP">Leaking Tap</option>
                <option value="TOILET">Toilet Issue</option>
                <option value="MINOR_BLOCKAGE">Minor Blockage</option>
                <option value="HOT_WATER">Hot Water System</option>
                <option value="GENERAL_MAINTENANCE">General Maintenance</option>
                <option value="OTHER">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
                minLength={10}
                placeholder="Please describe the issue in detail (min 10 chars)"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                <input 
                type="text"
                name="locationText" 
                value={formData.locationText}
                onChange={handleChange}
                placeholder="e.g. Upstairs bathroom"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Attachments (Photos / Videos)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-yellow-500 transition-colors cursor-pointer relative">
                    <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                                <span>Upload files</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*,video/*" onChange={handleFileSelect} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB (Img) / 100MB (Vid)</p>
                    </div>
                </div>
                
                {/* File List */}
                {files.length > 0 && (
                    <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {files.map((file, index) => (
                            <li key={index} className="relative rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                                <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {file.file.type.startsWith('image/') ? (
                                        <img className="h-full w-full object-cover" src={file.previewUrl} alt="" />
                                    ) : (
                                        <FileVideo className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="focus:outline-none">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    {file.status === 'uploading' && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: `${file.progress}%` }}></div>
                                        </div>
                                    )}
                                    {file.status === 'error' && <p className="text-xs text-red-500 mt-1">Upload failed</p>}
                                    {file.status === 'completed' && <p className="text-xs text-green-500 mt-1">Ready</p>}
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-300 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent (Within 24h)</option>
                <option value="EMERGENCY">Emergency (Immediate)</option>
                </select>
            </div>

            <div className="flex items-center">
                <input
                id="afterHours"
                name="afterHours"
                type="checkbox"
                checked={formData.afterHours}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="afterHours" className="ml-2 block text-sm text-gray-900">
                After Hours Request?
                </label>
            </div>

            <div className="flex flex-row-reverse mt-6">
                <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Submitting...
                    </>
                ) : 'Submit Request'}
                </button>
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
                Cancel
                </button>
            </div>
            </form>
        </div>
        </div>
    </div>
  );
}
