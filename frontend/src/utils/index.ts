// Helper function to map date strings to month names
export const getMonthName = (dateString) => {
  const date = new Date(`${dateString}-01`); // Convert string like "2024-01" to a Date object
  return date.toLocaleString("default", { month: "short" }); // Use 'long' for full month names, 'short' for abbreviations
};