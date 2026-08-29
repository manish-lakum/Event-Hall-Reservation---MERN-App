import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' // 'info' | 'warning' | 'danger'
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      default:
        return 'bg-[#0D9488] hover:bg-teal-700 text-white';
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-4 py-2 text-xs font-semibold rounded-lg transition shadow-xs ${getButtonStyles()}`}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-[#0D9488]'}`}>
          {type === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mt-1">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
