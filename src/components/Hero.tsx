
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, ArrowDown } from "lucide-react";

export const Hero = () => {
  const { data: settings } = useQuery({
    queryKey: ['website-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('key', 'site_config')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const siteConfig = settings?.value as any;

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <Camera className="w-10 h-10" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
          {siteConfig?.name || "Tasveeri Yaadein"}
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light">
          {siteConfig?.tagline || "Capturing Moments, Creating Memories"}
        </p>
        
        <p className="text-lg mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Professional photography services specializing in real estate, medical, fashion, food, and construction photography. 
          We transform your vision into stunning visual stories.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            onClick={scrollToPortfolio}
          >
            View Our Work
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg font-semibold"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get In Touch
          </Button>
        </div>
        
        <div className="animate-bounce">
          <ArrowDown className="w-6 h-6 mx-auto text-white/60" />
        </div>
      </div>
    </div>
  );
};
