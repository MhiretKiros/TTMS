/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "May 15, 2023")
 */
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Capitalizes the first letter of each word
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.replace(/\b\w/g, (char: string) => char.toUpperCase());
}

/**
 * Generates a random vehicle ID
 * @returns Vehicle ID (e.g., "VH-8A3B2C")
 */
export function generateVehicleId(): string {
  const chars = "0123456789ABCDEF";
  let result = "VH-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculates the next service date based on last service and mileage
 * @param lastServiceDate - ISO date string
 * @param mileage - Current mileage
 * @param avgMileagePerMonth - Average monthly mileage
 * @returns Estimated next service date
 */
export function calculateNextService(
  lastServiceDate: string,
  mileage: number,
  avgMileagePerMonth: number
): Date {
  const lastService = new Date(lastServiceDate);
  const monthsSinceLastService = Math.floor(mileage / avgMileagePerMonth);
  const nextService = new Date(lastService);
  nextService.setMonth(nextService.getMonth() + monthsSinceLastService);
  return nextService;
}
