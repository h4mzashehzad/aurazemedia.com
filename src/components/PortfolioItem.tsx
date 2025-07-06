
import { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Maximize, X, Pause } from "lucide-react";

interface PortfolioItemProps {
  item: {
    id: string;
    title: string;
    caption: string;
    category: string;
    image_url: string;
    is_featured: boolean;
  };
}

export const PortfolioItem = ({ item }: PortfolioItemProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [textSize, setTextSize] = useState('text-xl');
  const videoRef = useRef<HTMLVideoElement>(null);
  const maximizedVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('video');
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

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(true);
  };

  const handleCloseMaximized = () => {
    setIsMaximized(false);
    if (maximizedVideoRef.current) {
      maximizedVideoRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle video events
  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);

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

        {isVideoFile(item.image_url) ? (
          <div className="relative">
            <video
              ref={videoRef}
              src={item.image_url}
              className="w-full object-cover transition-transform duration-500"
              muted
              loop
              playsInline
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Video overlay and play button */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                onClick={handlePlayVideo}
                variant="secondary"
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                <Badge className="bg-blue-500 text-white text-xs">Featured</Badge>
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
            
            {isVideoFile(item.image_url) ? (
              <video
                ref={maximizedVideoRef}
                src={item.image_url}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay={isPlaying}
                playsInline
              />
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
                  <Badge className="bg-blue-500 text-white">Featured</Badge>
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
