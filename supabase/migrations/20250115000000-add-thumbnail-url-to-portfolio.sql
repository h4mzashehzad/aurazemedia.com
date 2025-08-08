-- Add thumbnail_url column to portfolio_items table for custom video thumbnails
ALTER TABLE public.portfolio_items 
ADD COLUMN thumbnail_url TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.portfolio_items.thumbnail_url IS 'Custom thumbnail image URL for videos. If null, auto-generated thumbnail will be used for MP4 videos.';