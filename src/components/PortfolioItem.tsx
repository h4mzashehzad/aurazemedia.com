import { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { getMediaType, getYouTubeEmbedUrl, getYouTubeThumbnail, isVideoFile } from "@/lib/youtube";

interface PortfolioItemProps {
  item: {
    id: string;
    title: string;
    caption: string;
    category: string;
    image_url: string;
    video_url?: string;
    thumbnail_url?: string;
    website_url?: string;
    is_featured: boolean;
  };
}

export const PortfolioItem = ({ item }: PortfolioItemProps) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [textSize, setTextSize] = useState('text-xl');
  const [isHovering, setIsHovering] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maximizedVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const mediaType = getMediaType(item.image_url);
  const isYouTube = mediaType === 'youtube';
  const isVideo = mediaType === 'video';
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(item.image_url) : null;
  const youtubeThumbnail = isYouTube ? getYouTubeThumbnail(item.image_url) : null;

  // Setup intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Set thumbnail - only use custom thumbnail_url for MP4 videos
  useEffect(() => {
    if (isVideo && item.thumbnail_url) {
      // Use custom thumbnail if provided for MP4 videos
      setVideoThumbnail(item.thumbnail_url);
    } else if (isVideo) {
      // No custom thumbnail for MP4 - will show black screen with play button
      setVideoThumbnail(null);
    }
  }, [isVideo, item.thumbnail_url]);


  // Calculate text size based on container dimensions
  useEffect(() => {
    const updateTextSize = () => {
      if (containerRef.current) {
        const { height } = containerRef.current.getBoundingClientRect();
        
        if (height < 200) {
          setTextSize('text-xs');
        } else if (height < 300) {
          setTextSize('text-sm');
        } else if (height < 400) {
          setTextSize('text-base');
        } else {
          setTextSize('text-xl');
        }
      }
    };

    updateTextSize();
    
    const resizeObserver = new ResizeObserver(updateTextSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleMaximize = () => {
    setIsMaximized(true);
  };

  const handleCloseMaximized = (e: React.MouseEvent) => {
    // Close when clicking outside the media content
    setIsMaximized(false);
    if (maximizedVideoRef.current) {
      maximizedVideoRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoHover = (isHovering: boolean) => {
    setIsHovering(isHovering);
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const renderMediaContent = (isMaximizedView = false, showControls = false) => {
    if (isYouTube && youtubeEmbedUrl) {
      return (
        <div className="relative w-full h-full">
          {/* YouTube thumbnail placeholder */}
          {!isMaximizedView && !isVisible && (
            <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center rounded-lg">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* YouTube iframe - only load when visible or maximized */}
          {(isVisible || isMaximizedView) && (
            <iframe
              src={`${youtubeEmbedUrl.replace('autoplay=1', 'autoplay=0')}`}
              className={`w-full h-full rounded-lg ${!isMaximizedView ? 'transition-transform duration-500 group-hover:scale-105' : ''}`}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={item.title}
            />
          )}
        </div>
      );
    }
    
    if (isVideo) {
      if (!isMaximizedView) {
        return (
          <div 
            className="relative w-full h-full"
            onMouseEnter={() => handleVideoHover(true)}
            onMouseLeave={() => handleVideoHover(false)}
          >
            {/* Video element (hidden when not hovering) */}
            <video
              ref={videoRef}
              src={item.image_url}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              muted
              playsInline
              loop
              onError={(e) => {
                console.error('Video error:', e);
              }}
            />
            
            {/* Thumbnail overlay */}
             <div className={`absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
               {videoThumbnail ? (
                 <div className="w-full h-full relative">
                   {/* Thumbnail loading placeholder */}
                   {!imageLoaded && (
                     <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
                       <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                     </div>
                   )}
                   
                   {/* Actual thumbnail - only load when visible */}
                   {isVisible && (
                     <img 
                       src={videoThumbnail} 
                       alt={item.title}
                       className={`w-full h-full object-cover transition-opacity duration-300 ${
                         imageLoaded ? 'opacity-100' : 'opacity-0'
                       }`}
                       onLoad={() => setImageLoaded(true)}
                       onError={() => setImageLoaded(true)}
                     />
                   )}
                 </div>
               ) : (
                 <div className="w-full h-full bg-black flex items-center justify-center">
                   {/* Black screen - no loading text */}
                 </div>
               )}
               {/* Play button overlay */}
               <div className="absolute bottom-4 left-4">
                 <div className="bg-white/40 rounded-full p-2.5 shadow-lg">
                   <Play className="w-6 h-6 text-black fill-black" />
                 </div>
               </div>
             </div>
          </div>
        );
      } else {
        return (
          <video
            ref={maximizedVideoRef}
            src={item.image_url}
            className="max-w-full max-h-full object-contain"
            controls={showControls}
            autoPlay
            playsInline
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onError={(e) => {
              console.error('Video error:', e);
            }}
          />
        );
      }
    }

    return null;
  };

  const shouldShowMedia = isYouTube || isVideo;
  const displayImageUrl = isYouTube && youtubeThumbnail ? youtubeThumbnail : item.image_url;

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's a video and we're hovering, maximize instead of navigating
    if (isVideo && isHovering) {
      handleMaximize();
      return;
    }
    
    // For other cases, either maximize or navigate
    if (shouldShowMedia || !item.website_url) {
      handleMaximize();
    } else if (item.website_url) {
      window.open(item.website_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 break-inside-avoid cursor-pointer ${isYouTube ? 'bg-gradient-to-br from-red-900/20 to-black/40 border border-red-500/20' : ''}`}
        onClick={handleItemClick}
      >

        {shouldShowMedia ? (
          <div className="w-full h-full">
            {renderMediaContent(false, false)}
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Placeholder while loading */}
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Actual image - only load when visible */}
            {isVisible && (
              <img
                ref={imageRef}
                src={displayImageUrl}
                alt={item.title}
                className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)} // Show even if error to remove loading state
              />
            )}
          </div>
        )}
        
        {/* Content overlay - positioned to not interfere with video playback */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                {item.category}
              </Badge>
              {item.is_featured && (
                <Badge className="bg-white text-black text-xs">Featured</Badge>
              )}
              {item.website_url && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400 text-xs">
                  Link
                </Badge>
              )}
            </div>
            <h3 className={`${textSize} font-bold text-white mb-1`}>{item.title}</h3>
            <p className={`text-gray-200 ${textSize === 'text-xs' ? 'text-xs' : textSize === 'text-sm' ? 'text-xs' : 'text-sm'}`}>
              {item.caption}
            </p>
          </div>
        </div>
      </div>

      {/* Maximized view modal */}
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseMaximized}
        >
          <div 
            ref={modalRef}
            className="relative max-w-[95vw] max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setIsMaximized(false)}
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-none"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center justify-center">
              {shouldShowMedia ? (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  {renderMediaContent(true, true)}
                </div>
              ) : (
                <img
                  src={displayImageUrl}
                  alt={item.title}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 max-h-[30vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="bg-white/20 text-white text-xs sm:text-sm">
                  {item.category}
                </Badge>
                {item.is_featured && (
                  <Badge className="bg-white text-black text-xs sm:text-sm">Featured</Badge>
                )}
                {item.website_url && (
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400 text-xs sm:text-sm">
                    Link
                  </Badge>
                )}
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-200 text-sm sm:text-base line-clamp-3">{item.caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};