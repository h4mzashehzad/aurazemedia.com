
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const Pricing = () => {
  const { data: pricingPackages, isLoading } = useQuery({
    queryKey: ['pricing-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pricing Packages</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">Pricing Packages</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect package for your photography needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPackages?.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${pkg.is_popular ? 'border-purple-500 border-2 shadow-lg scale-105' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  {pkg.name}
                </CardTitle>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {pkg.price}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${pkg.is_popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                  onClick={scrollToContact}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
