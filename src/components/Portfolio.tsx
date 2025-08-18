
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioItem } from "./PortfolioItem";

export const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 12;

  // Fetch dynamic categories
  const { data: categories } = useQuery({
    queryKey: ['portfolio-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data.map(cat => cat.name);
    }
  });

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

  // Create filter options with All + dynamic categories
  const filterOptions = ['All', ...(categories || [])];

  if (isLoading) {
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
          {filterOptions.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 ${
                selectedCategory === category 
                  ? "bg-white hover:bg-gray-200 text-black" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Portfolio grid - 4 columns on desktop, 2 on mobile */}
        <div className="columns-2 md:columns-4 gap-6 space-y-6">
          {portfolioItems?.map((item) => (
            <PortfolioItem key={item.id} item={item} />
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
    </section>
  );
};
