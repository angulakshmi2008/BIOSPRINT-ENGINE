import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete Record',
  confirmVariant = 'danger'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-navy-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white shadow-sm transition-colors ${
            confirmVariant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {confirmVariant === 'danger' && <Trash2 className="w-4 h-4" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
