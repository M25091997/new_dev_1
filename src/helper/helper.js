/**
 * Generate a slug from a product name
 * - Converts to lowercase
 * - Removes all special characters
 * - Replaces spaces with hyphens
 * - Removes leading/trailing hyphens
 * 
 * @param {string} productName - The product name to convert
 * @returns {string} - The generated slug
 */
export const generateSlug = (productName) => {
  if (!productName) return '';
  
  return productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading and trailing hyphens
};
