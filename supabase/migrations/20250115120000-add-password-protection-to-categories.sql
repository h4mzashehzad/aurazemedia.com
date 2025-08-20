-- Add password protection fields to portfolio_categories table
ALTER TABLE public.portfolio_categories 
ADD COLUMN is_password_protected BOOLEAN DEFAULT false,
ADD COLUMN password_hash TEXT;

-- Create index for better performance on password-protected queries
CREATE INDEX idx_portfolio_categories_password_protected 
ON public.portfolio_categories(is_password_protected);

-- Add comment to explain the password_hash field
COMMENT ON COLUMN public.portfolio_categories.password_hash IS 'Hashed password for protected categories. Only set when is_password_protected is true.';
COMMENT ON COLUMN public.portfolio_categories.is_password_protected IS 'Whether this category requires a password to view its contents.';