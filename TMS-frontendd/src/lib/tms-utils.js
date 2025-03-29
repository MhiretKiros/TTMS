/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "May 15, 2023")
 */
export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  /**
   * Capitalizes the first letter of each word
   * @param {string} str - Input string
   * @returns {string} Capitalized string
   */
  export function capitalize(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }
  
  /**
   * Generates a random vehicle ID
   * @returns {string} Vehicle ID (e.g., "VH-8A3B2C")
   */
  export function generateVehicleId() {
    const chars = '0123456789ABCDEF';
    let result = 'VH-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Calculates the next service date based on last service and mileage
   * @param {string} lastServiceDate - ISO date string
   * @param {number} mileage - Current mileage
   * @param {number} avgMileagePerMonth - Average monthly mileage
   * @returns {Date} Estimated next service date
   */
  export function calculateNextService(lastServiceDate, mileage, avgMileagePerMonth) {
    const lastService = new Date(lastServiceDate);
    const monthsSinceLastService = Math.floor(mileage / avgMileagePerMonth);
    const nextService = new Date(lastService);
    nextService.setMonth(nextService.getMonth() + monthsSinceLastService);
    return nextService;
  }