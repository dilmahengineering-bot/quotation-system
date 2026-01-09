// Format currency
export const formatCurrency = (value, currency = 'USD') => {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Format number with commas
export const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date time
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format hours and minutes
export const formatTime = (hours, minutes) => {
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  
  if (h === 0 && m === 0) return '0 min';
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
};

// Calculate total hours from hours and minutes
export const calculateTotalHours = (hours, minutes) => {
  return parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60);
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  if (!status) return 'badge-draft';
  
  const statusClasses = {
    'Draft': 'badge-draft',
    'Submitted': 'badge-submitted',
    'Approved': 'badge-approved',
    'Rejected': 'badge-rejected',
  };
  return statusClasses[status] || 'badge-draft';
};

// Machine type options
export const MACHINE_TYPES = [
  'Milling',
  'Turning',
  'EDM',
  'WEDM',
  'Grinding',
  'Drilling',
  'Laser',
  'Other',
];

// Quotation status options
export const QUOTATION_STATUSES = [
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
];

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
