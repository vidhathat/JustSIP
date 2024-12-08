import React from 'react';

type ActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'edit' | 'delete';
  title: string;
  message?: string;
  data?: {
    [key: string]: any;
  };
};

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  data
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 relative">
        <div className="flex items-center gap-3 mb-4">
          {type === 'delete' ? (
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {message && (
          <p className="text-gray-600 mb-6">{message}</p>
        )}

        {data && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center mb-2 last:mb-0">
                <span className="text-sm font-medium text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'delete'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {type === 'delete' ? 'Deactivate' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal; 