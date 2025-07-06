
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioItem } from "./PortfolioItem";

export const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  // Fetch portfolio items with featured items prioritized and proper sorting
  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ['portfolio-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

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

  // Create filter options with All + dynamic categories
  const filterOptions = ['All', ...(categories || [])];

  const filteredItems = portfolioItems?.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  if (isLoading) {
    return (
      <section id="portfolio" className="py-20 bg-black pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
                  ? "bg-blue-500 hover:bg-blue-600 text-white" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Portfolio grid - 4 columns on desktop, 2 on mobile */}
        <div className="columns-2 md:columns-4 gap-6 space-y-6">
          {filteredItems?.map((item) => (
            <PortfolioItem key={item.id} item={item} />
          ))}
        </div>

        {filteredItems?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};
