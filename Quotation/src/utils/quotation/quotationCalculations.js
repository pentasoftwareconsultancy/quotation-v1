// Pure calculation helpers extracted from CreateQuotation.jsx /
// QuotationPreview.jsx. Behavior/rounding is unchanged — these are the
// exact same formulas, just shared instead of duplicated.

export const calculateTotal = (costBreakdown = []) => {
  const total = costBreakdown.reduce((sum, item) => {
    const amount = Number(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return Math.round(total);
};

export const calculateGST = (totalCost, gstPercent) => {
  const percent = gstPercent || 0;
  return percent ? Math.round((totalCost * percent) / 100) : 0;
};

export const calculateFinalAmount = (totalCost, gstAmount) => totalCost + gstAmount;

export const calculatePayment = (totalCost, percent) => Math.round((totalCost * percent) / 100);

export const calculateTimelineWeeks = (timeline = []) => {
  return timeline.reduce((total, phase) => {
    const match = phase.duration?.match(/\d+/);
    const weeks = match ? Number(match[0]) : 0;
    return total + weeks;
  }, 0);
};

export const calculateMaintenanceRange = (maintenancePlans = []) => {
  if (!maintenancePlans.length) return "₹0";

  const yearlyPrices = maintenancePlans.map((plan) => (Number(plan.monthly) || 0) * 12);

  const min = Math.min(...yearlyPrices);
  const max = Math.max(...yearlyPrices);

  return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
};

export const formatIndianCurrency = (amount) => {
  if (!amount || amount === 0) return "₹ 0";

  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Crores`;
  } else if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
  } else {
    return `₹ ${amount.toLocaleString("en-IN")}`;
  }
};
