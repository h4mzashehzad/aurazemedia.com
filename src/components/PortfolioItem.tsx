import { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize, X, Play } from "lucide-react";

interface PortfolioItemProps {
  item: {
    id: string;
    title: string;
    caption: string;
    category: string;
    image_url: string;
    video_url?: string;
    is_featured: boolean;
  };
}

export const PortfolioItem = ({ item }: PortfolioItemProps) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [textSize, setTextSize] = useState('text-xl');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [maximizedVideoLoaded, setMaximizedVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maximizedVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');
  };

  const isVideoURL = (url: string) => {
    return url.includes('youtube') || url.includes('youtu.be') || 
           url.includes('vimeo') || url.includes('drive.google') ||
           url.includes('dropbox') || url.includes('video');
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url;
    }
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      const fileId = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1]?.split('&')[0];
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }
    
    // For other video URLs, return as-is
    return url;
  };

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

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(true);
  };

  const handleCloseMaximized = () => {
    setIsMaximized(false);
    if (maximizedVideoRef.current) {
      maximizedVideoRef.current.pause();
    }
    setMaximizedVideoLoaded(false);
  };

  const handlePlayVideo = (isMaximizedView = false) => {
    if (isMaximizedView) {
      setMaximizedVideoLoaded(true);
    } else {
      setVideoLoaded(true);
    }
  };

  const renderVideoContent = (isMaximizedView = false, showControls = false) => {
    const hasVideoUrl = item.video_url && item.video_url.trim() !== '';
    const videoUrl = hasVideoUrl ? item.video_url : item.image_url;
    const loaded = isMaximizedView ? maximizedVideoLoaded : videoLoaded;

    if (!loaded) {
      return (
        <div className="relative w-full h-full bg-black flex items-center justify-center min-h-[200px]">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover opacity-50"
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayVideo(isMaximizedView);
            }}
            variant="secondary"
            size="sm"
            className="absolute w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black border-none flex items-center justify-center shadow-lg"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </Button>
        </div>
      );
    }

    if (isVideoFile(videoUrl!)) {
      return (
        <video
          ref={isMaximizedView ? maximizedVideoRef : videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover ${!isMaximizedView ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          controls={showControls}
          autoPlay={loaded}
          loop={!showControls}
          muted={!showControls}
          playsInline
          onError={(e) => {
            console.error('Video error:', e);
            // Fallback to image if video fails
            if (isMaximizedView) {
              setMaximizedVideoLoaded(false);
            } else {
              setVideoLoaded(false);
            }
          }}
        />
      );
    } else if (isVideoURL(videoUrl!) || hasVideoUrl) {
      return (
        <div className="w-full h-full">
          <iframe
            src={getVideoEmbedUrl(videoUrl!)}
            className="w-full h-full min-h-[200px]"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            onError={() => {
              console.error('Iframe error');
              // Fallback to image if iframe fails
              if (isMaximizedView) {
                setMaximizedVideoLoaded(false);
              } else {
                setVideoLoaded(false);
              }
            }}
          />
        </div>
      );
    }

    return null;
  };

  const hasVideo = (item.video_url && item.video_url.trim() !== '') || 
                   isVideoFile(item.image_url) || 
                   isVideoURL(item.image_url);

  // Only consider it a video if we have a valid video URL or the image_url is a video file
  const shouldShowVideo = hasVideo && (item.video_url?.trim() || isVideoFile(item.image_url));

  return (
    <>
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 break-inside-avoid"
      >
        {/* Maximize button */}
        <Button
          onClick={handleMaximize}
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-none"
        >
          <Maximize className="w-4 h-4" />
        </Button>

        {shouldShowVideo ? (
          <div className="w-full h-full">
            {renderVideoContent(false, false)}
          </div>
        ) : (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        
        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                {item.category}
              </Badge>
              {item.is_featured && (
                <Badge className="bg-white text-black text-xs">Featured</Badge>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <Button
              onClick={handleCloseMaximized}
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-none"
            >
              <X className="w-4 h-4" />
            </Button>
            
            {shouldShowVideo ? (
              <div className="w-full h-full max-w-full max-h-full">
                {renderVideoContent(true, true)}
              </div>
            ) : (
              <img
                src={item.image_url}
                alt={item.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {item.category}
                </Badge>
                {item.is_featured && (
                  <Badge className="bg-white text-black">Featured</Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-200">{item.caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};