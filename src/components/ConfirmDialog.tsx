import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'success' | 'info';
}

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-red-600 hover:bg-red-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex gap-4">
            <button
              onClick={onConfirm}
              className={`flex-1 ${getButtonColor()} text-white font-semibold py-3 px-6 rounded-lg transition duration-200`}
            >
              {type === 'success' || type === 'info' ? 'موافق' : 'تأكيد'}
            </button>
            {type === 'warning' && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}