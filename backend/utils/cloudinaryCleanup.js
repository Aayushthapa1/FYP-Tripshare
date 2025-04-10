import { v2 as cloudinary } from 'cloudinary';


export const deleteCloudinaryAssets = async (publicIds) => {
  try {
    // Input validation
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return { result: 'no assets to delete' };
    }
    
    // Filter out any null/undefined/empty values
    const validIds = publicIds.filter(id => id && typeof id === 'string');
    
    if (validIds.length === 0) {
      return { result: 'no valid assets to delete' };
    }
    
    const result = await cloudinary.api.delete_resources(validIds);
    return result;
  } catch (error) {
    console.error('Error deleting Cloudinary assets:', error);
    throw error;
  }
};


export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // This regex matches the public ID in a Cloudinary URL
  // It handles URLs with or without version numbers (v1234)
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};

/**
 * Extracts multiple public IDs from an array of Cloudinary URLs
 * @param {string[]} urls - Array of Cloudinary URLs
 * @returns {string[]} Array of public IDs (invalid URLs are filtered out)
 */
export const getPublicIdsFromUrls = (urls) => {
  if (!urls || !Array.isArray(urls)) return [];
  
  return urls
    .map(url => getPublicIdFromUrl(url))
    .filter(id => id !== null);
};

/**
 * Checks if a URL is a valid Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a valid Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if the URL contains the cloudinary domain and upload path
  return /cloudinary\.com\/.*\/upload\//.test(url);
};