"use client";

import { Fragment, useState } from 'react';
import { X, Download, FileVideo, Image as ImageIcon } from 'lucide-react';

interface FileAsset {
  id: string;
  url: string;
  mime: string;
  key: string;
  size: number;
}

interface ServiceRequest {
  id: string;
  type: string;
  description: string;
  locationText?: string;
  urgency: string;
  afterHours: boolean;
  status: string;
  createdAt: string;
  attachments: FileAsset[];
}

interface JobDetailsModalProps {
  job: ServiceRequest;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Job Details
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Header Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500">Type</span>
                            <span className="font-medium text-gray-900">{job.type.replace(/_/g, " ")}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Status</span>
                            <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                                job.status === 'NEW' ? 'bg-green-100 text-green-800' : 
                                job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {job.status}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Urgency</span>
                            <span className={`font-medium ${job.urgency === 'EMERGENCY' ? 'text-red-600' : 'text-gray-900'}`}>
                                {job.urgency}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Date Logged</span>
                            <span className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                         {job.locationText && (
                            <div className="col-span-2">
                                <span className="block text-gray-500">Location</span>
                                <span className="font-medium text-gray-900">{job.locationText}</span>
                            </div>
                        )}
                        <div className="col-span-2">
                             <span className="block text-gray-500">After Hours</span>
                             <span className="font-medium text-gray-900">{job.afterHours ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900">Description</h4>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-white border border-gray-200 p-3 rounded-md">
                        {job.description}
                    </p>
                </div>

                {/* Attachments */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments ({job.attachments?.length || 0})</h4>
                    
                    {(!job.attachments || job.attachments.length === 0) ? (
                        <p className="text-sm text-gray-500 italic">No attachments.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {job.attachments.map((file) => (
                                <div key={file.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center overflow-hidden h-32">
                                        {file.mime.startsWith('image/') ? (
                                            <img 
                                                src={file.url} 
                                                alt="Attachment" 
                                                className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setSelectedImage(file.url)}
                                            />
                                        ) : file.mime.startsWith('video/') ? (
                                            <video src={file.url} className="w-full h-full object-cover" controls />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FileVideo className="h-8 w-8 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500 truncate w-full text-center">{file.key.split('/').pop()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 bg-white border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
                                        <a 
                                            href={file.url} 
                                            download 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-yellow-600 hover:text-yellow-700 p-1"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for full image */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-black bg-opacity-90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                <X className="h-8 w-8" />
            </button>
            <img 
                src={selectedImage} 
                alt="Full preview" 
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()} 
            />
        </div>
      )}
    </>
  );
}
