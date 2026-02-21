"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, FileText, File as FileIcon, Music, Video as VideoIcon, Image as ImageIcon, Loader2 } from "lucide-react";

interface FilePreviewModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setLoading(true);
      setError(null);
      setZoom(1);

      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    }
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file || !objectUrl) return null;

  const fileType = file.type.split("/")[0];
  const isPDF = file.type === "application/pdf";
  const isImage = fileType === "image";
  const isVideo = fileType === "video";
  const isAudio = fileType === "audio";

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-red-500 h-64">
          <FileIcon className="w-16 h-16 mb-4" />
          <p>{error}</p>
        </div>
      );
    }

    if (loading && !isImage) { // Images handle loading via onLoad, others might need explicit handling or just show immediately
       // For iframe/video, we might want a spinner until it's ready, but native tags handle buffering.
       // We'll show a loader overlay that disappears after a timeout or onLoad event where applicable.
    }

    if (isImage) {
      return (
        <div className="overflow-auto flex items-center justify-center w-full h-full p-4 bg-black/50">
           <img
            src={objectUrl}
            alt={file.name}
            className="max-w-none transition-transform duration-200 ease-in-out"
            style={{ transform: `scale(${zoom})` }}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError("Failed to load image"); }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          className="max-w-full max-h-full"
          src={objectUrl}
          onLoadedData={() => setLoading(false)}
          onError={() => { setLoading(false); setError("Failed to load video"); }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-100 rounded-lg">
          <Music className="w-24 h-24 mb-6 text-gray-400" />
          <audio
            controls
            src={objectUrl}
            onLoadedData={() => setLoading(false)}
            onError={() => { setLoading(false); setError("Failed to load audio"); }}
            className="w-full max-w-md"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe
          src={`${objectUrl}#toolbar=0`} // Hide default toolbar if possible to use ours, but standard behavior varies
          className="w-full h-full bg-white"
          onLoad={() => setLoading(false)}
          title="PDF Preview"
        />
      );
    }

    // Fallback for other files
    setLoading(false);
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="w-16 h-16 mb-4" />
        <p>Preview not available for this file type.</p>
        <a
          href={objectUrl}
          download={file.name}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download to View
        </a>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isImage ? <ImageIcon className="w-5 h-5 text-blue-600" /> :
               isVideo ? <VideoIcon className="w-5 h-5 text-blue-600" /> :
               isAudio ? <Music className="w-5 h-5 text-blue-600" /> :
               <FileText className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 id="modal-title" className="text-sm font-medium text-gray-900 truncate max-w-xs sm:max-w-md">
                {file.name}
              </h3>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isImage) && (
              <div className="hidden sm:flex items-center space-x-1 border-r pr-2 mr-2">
                <button 
                  onClick={handleZoomOut} 
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  aria-label="Zoom Out"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={handleZoomIn} 
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  aria-label="Zoom In"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            
            <a 
              href={objectUrl} 
              download={file.name}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </a>
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-gray-100 flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
