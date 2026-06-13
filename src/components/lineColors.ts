export function getLineColor(lineNumber: string): string {
  const num = parseInt(lineNumber, 10);
  if (isNaN(num)) return '#6366f1';
  if (num >= 1 && num <= 99) return '#dc2626';
  if (num >= 100 && num <= 199) return '#2563eb';
  if (num >= 200 && num <= 299) return '#16a34a';
  if (num >= 300 && num <= 399) return '#9333ea';
  if (num >= 400 && num <= 499) return '#ea580c';
  if (num >= 500 && num <= 599) return '#0891b2';
  if (num >= 600 && num <= 699) return '#4338ca';
  if (num >= 700 && num <= 799) return '#b45309';
  if (num >= 800 && num <= 899) return '#be185d';
  if (num >= 900 && num <= 999) return '#6d28d9';
  return '#6366f1';
}
