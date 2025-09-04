
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioItem } from "./PortfolioItem";
import { PasswordPromptDialog } from "./PasswordPromptDialog";
import { Lock } from "lucide-react";

export const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 12;

  // Fetch categories for filtering
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-portfolio-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('name, is_password_protected')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
        return data;
     }
   });

  // Get category names for filter options
  const categoryNames = categories?.map(cat => cat.name) || [];
  
  // Get non-password-protected category names for 'All' filtering
  const publicCategoryNames = categories?.filter(cat => !cat.is_password_protected).map(cat => cat.name) || [];

  // Fetch portfolio items with infinite loading
  const {
    data: portfolioData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['portfolio-items', selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('portfolio_items')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        //.order('display_order', { ascending: true })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);
      
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      } else {
        // For 'All', only show items from non-password-protected categories
        if (publicCategoryNames.length > 0) {
          query = query.in('category', publicCategoryNames);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return {
        items: data || [],
        nextPage: data && data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
  });

  // Flatten all pages into a single array
  const portfolioItems = portfolioData?.pages.flatMap(page => page.items) || [];

  // Setup intersection observer for infinite scroll
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Setup observer when component mounts or dependencies change
  useEffect(() => {
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  // Listen for custom filter events from navigation
  useEffect(() => {
    const handleFilterPortfolio = (event: CustomEvent) => {
      setSelectedCategory(event.detail.category);
    };

    window.addEventListener('filterPortfolio', handleFilterPortfolio as EventListener);
    
    return () => {
      window.removeEventListener('filterPortfolio', handleFilterPortfolio as EventListener);
    };
  }, []);

  // Reset and refetch when category changes
  useEffect(() => {
    refetch();
  }, [selectedCategory, refetch]);

  // Handle category selection with password protection check
  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === 'All') {
      setSelectedCategory('All');
      return;
    }

    const category = categories?.find(cat => cat.name === categoryName);
    if (category?.is_password_protected) {
      setPendingCategory(categoryName);
      setShowPasswordDialog(true);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  // Verify password for protected category
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const category = categories?.find(cat => cat.name === pendingCategory);
      if (!category) return false;

      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('password_hash')
        .eq('name', pendingCategory)
        .single();

      if (error) throw error;

      // Simple verification using base64 encoding (same as in CategoryManager)
      const hashedPassword = btoa(password);
      return data.password_hash === hashedPassword;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  // Handle successful password verification
  const handlePasswordSuccess = () => {
    setSelectedCategory(pendingCategory);
    setShowPasswordDialog(false);
    setPendingCategory('');
  };

  // Handle password dialog close
  const handlePasswordClose = () => {
    setShowPasswordDialog(false);
    setPendingCategory('');
  };

  // Create filter options with All + dynamic categories
  const filterOptions = ['All', ...(categoryNames || [])];

  if (isLoading || categoriesLoading) {
    return (
      <section id="portfolio" className="py-20 bg-black pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-black pt-24">
      <div className="container mx-auto px-4">
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filterOptions.map((category) => {
            const isProtected = category !== 'All' && categories && categories.find(cat => cat.name === category)?.is_password_protected;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-2 flex items-center gap-2 ${
                  selectedCategory === category 
                    ? "bg-white hover:bg-gray-200 text-black" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                }`}
              >
                {category}
                {isProtected && (
                  <Lock className="w-4 h-4" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Portfolio grid - 4 columns on desktop, 2 on mobile - Instagram style 1:1 aspect ratio */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {portfolioItems?.map((item, index) => (
            <div key={item.id} className="aspect-square">
              <PortfolioItem 
                item={item} 
                currentIndex={index}
                totalItems={portfolioItems.length}
                portfolioItems={portfolioItems}
              />
            </div>
          ))}
        </div>

        {/* Loading indicator for infinite scroll */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          )}
        </div>

        {portfolioItems?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>

      {/* Password prompt dialog */}
      <PasswordPromptDialog
        isOpen={showPasswordDialog}
        onClose={handlePasswordClose}
        onSuccess={handlePasswordSuccess}
        categoryName={pendingCategory}
        onVerifyPassword={verifyPassword}
      />
    </section>
  );
};
