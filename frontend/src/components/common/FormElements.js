import React from 'react';
import { Loader2 } from 'lucide-react';

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`btn ${variants[variant]} ${sizes[size]} ${className} ${
        (loading || disabled) ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// Input Component
export const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

// Select Component
export const Select = React.forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Select...',
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

// Textarea Component
export const Textarea = React.forwardRef(({ 
  label, 
  error, 
  className = '',
  rows = 3,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input resize-none ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-industrial-100 text-industrial-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Status Badge for quotations
export const StatusBadge = ({ status }) => {
  const statusMap = {
    'Draft': { variant: 'default', label: 'Draft' },
    'Submitted': { variant: 'info', label: 'Submitted' },
    'Engineer Approved': { variant: 'warning', label: 'Engineer Approved' },
    'Management Approved': { variant: 'success', label: 'Mgmt Approved' },
    'Rejected': { variant: 'danger', label: 'Rejected' },
    'Issued': { variant: 'purple', label: 'Issued' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Loading Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
  );
};

// Loading State Component
export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" className="text-primary-600" />
      <p className="mt-4 text-industrial-500">{message}</p>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-industrial-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-industrial-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-industrial-900">{title}</h3>
      {description && (
        <p className="mt-1 text-industrial-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

// Modal Component
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} animate-fade-in`}>
          {(title || showClose) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-200">
              {title && (
                <h3 className="text-lg font-semibold text-industrial-900">{title}</h3>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-industrial-400 hover:text-industrial-600 hover:bg-industrial-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Dialog
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-industrial-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

// Table Components
export const Table = ({ children, className = '' }) => {
  return (
    <div className="table-container">
      <table className={`table ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const Th = ({ children, className = '', ...props }) => (
  <th className={className} {...props}>{children}</th>
);

export const Td = ({ children, className = '', ...props }) => (
  <td className={className} {...props}>{children}</td>
);
