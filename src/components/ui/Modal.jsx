import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  useEffect(() => {
    // Prevent scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in border border-gray-100`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body (scrollable) */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;
