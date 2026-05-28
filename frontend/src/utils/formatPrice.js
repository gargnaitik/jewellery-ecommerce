// ₹1,01,424 — Indian number format
export const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style:    'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// 6,870 — just number, no currency
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};