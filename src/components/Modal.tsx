import React from 'react';
import { Check, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancelar"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-surface rounded-lg shadow-xl max-w-sm w-full overflow-hidden border border-overlay animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-main mb-2">{title}</h3>
          <p className="text-subtle">{message}</p>
        </div>
        <div className="bg-overlay/50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
          <button
            onClick={onConfirm}
            className="flex items-center bg-primary text-white px-4 py-2 rounded font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <Check className="w-4 h-4 mr-1" />
            {confirmText}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center bg-surface border border-overlay text-main px-4 py-2 rounded font-semibold hover:bg-overlay transition-all active:scale-95"
            >
              <X className="w-4 h-4 mr-1" />
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
