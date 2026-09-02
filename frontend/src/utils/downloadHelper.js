/**
 * Helper function to download files from cross-origin URLs (like Cloudinary)
 * by fetching the file as a Blob and triggering a local download.
 */
export const downloadFile = async (url, filename) => {
  if (!url) return;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed, falling back to new tab:", error);
    // Fallback: open in new tab if fetch fails due to CORS or other issues
    window.open(url, '_blank');
  }
};
