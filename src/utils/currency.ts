// Currency formatting utilities

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 VND';
  }

  // For VND, format without decimals
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // For other currencies, use standard formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('vi-VN').format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove all non-digit characters except dots and commas
  const cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Handle Vietnamese number format (1.000.000,50)
  const parts = cleanValue.split(',');
  if (parts.length === 2) {
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = parts[1];
    return parseFloat(`${integerPart}.${decimalPart}`);
  }
  
  // Handle standard format with dots as thousand separators
  const numberValue = cleanValue.replace(/\./g, '');
  return parseFloat(numberValue) || 0;
};

export default {
  formatCurrency,
  formatNumber,
  parseCurrency,
};