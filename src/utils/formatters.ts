/**
 * Utility functions for Indian Rupee currency formatting, dates,
 * and business calculations for AIRWIN Sales Report.
 */

export function formatRupees(amount: number | string | null | undefined, showDecimals: boolean = false): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return '₹0';

  // Indian Number Format: e.g. 1,25,000.00
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(num);
}

export function formatCompactRupees(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDisplayDate(dateStr: string, includeYear: boolean = true): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: includeYear ? 'numeric' : undefined,
      });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: includeYear ? 'numeric' : undefined,
        });
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Safe division to prevent divide-by-zero errors
 */
export function safeDivide(numerator: number, denominator: number, decimals: number = 2): number {
  if (!denominator || denominator === 0 || isNaN(denominator) || isNaN(numerator)) {
    return 0;
  }
  const result = numerator / denominator;
  return Number(result.toFixed(decimals));
}

/**
 * Calculate expense as percentage of order value: (Total Expense / Total Order) * 100
 */
export function calculateExpensePercentage(totalExpense: number, totalOrder: number): number {
  if (!totalOrder || totalOrder <= 0) return 0;
  return Number(((totalExpense / totalOrder) * 100).toFixed(2));
}

export function getMonthNames(): { id: string; name: string }[] {
  return [
    { id: '01', name: 'January' },
    { id: '02', name: 'February' },
    { id: '03', name: 'March' },
    { id: '04', name: 'April' },
    { id: '05', name: 'May' },
    { id: '06', name: 'June' },
    { id: '07', name: 'July' },
    { id: '08', name: 'August' },
    { id: '09', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' },
    { id: '12', name: 'December' },
  ];
}
