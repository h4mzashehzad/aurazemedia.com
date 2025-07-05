
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ['portfolio-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const categories = ['All', 'Real Estate', 'Medical', 'Clothing', 'Food', 'Construction'];

  const filteredItems = portfolioItems?.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const getGridClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case 'wide':
        return 'md:col-span-2';
      case 'tall':
        return 'md:row-span-2';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <section id="portfolio" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Our Portfolio</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Our Portfolio</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our diverse collection of professional photography work across different industries
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 ${
                selectedCategory === category 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
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
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 break-inside-avoid"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {item.category}
                    </Badge>
                    {item.is_featured && (
                      <Badge className="bg-yellow-500 text-black">Featured</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-200 text-sm">{item.caption}</p>
                </div>
              </div>
            </div>
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
