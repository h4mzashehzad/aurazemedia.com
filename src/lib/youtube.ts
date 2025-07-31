/**
 * Utility functions for handling YouTube URLs and embeds
 */

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (watch, embed, short, etc.)
 * @returns YouTube video ID or null if not a valid YouTube URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Shortened URLs
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // YouTube shorts
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Checks if a URL is a YouTube URL
 * @param url - URL to check
 * @returns true if it's a YouTube URL
 */
export const isYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null;
};

/**
 * Converts a YouTube URL to an embed URL
 * @param url - YouTube URL
 * @returns YouTube embed URL or null if not a valid YouTube URL
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
};

/**
 * Gets YouTube thumbnail URL
 * @param url - YouTube URL
 * @param quality - Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns YouTube thumbnail URL or null if not a valid YouTube URL
 */
export const getYouTubeThumbnail = (url: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  const qualityMap = {
    'default': 'default',
    'medium': 'mqdefault',
    'high': 'hqdefault',
    'standard': 'sddefault',
    'maxres': 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Checks if a URL is a video file (mp4, webm, ogg)
 * @param url - URL to check
 * @returns true if it's a video file URL
 */
export const isVideoFile = (url: string): boolean => {
  if (!url) return false;
  return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');
};

/**
 * Determines the media type of a URL
 * @param url - URL to check
 * @returns 'youtube', 'video', or 'image'
 */
export const getMediaType = (url: string): 'youtube' | 'video' | 'image' => {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVideoFile(url)) return 'video';
  return 'image';
};