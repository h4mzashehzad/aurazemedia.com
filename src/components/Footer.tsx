
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const Footer = () => {
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

  return (
    <footer className="bg-black text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-2xl font-bold">Auraze Media</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {siteConfig?.tagline || "Capturing Moments, Creating Memories"}
            </p>
            <p className="text-gray-500 text-sm">
              Professional photography services across Pakistan, specializing in diverse industries and creative projects.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Our Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Real Estate Photography</li>
              <li>Medical Facility Shoots</li>
              <li>Fashion & Clothing</li>
              <li>Food Photography</li>
              <li>Construction Projects</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors cursor-pointer">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-white transition-colors cursor-pointer">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors cursor-pointer">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white" />
                <a 
                  href="tel:+92-326-1234888"
                  className="text-sm hover:text-white transition-colors"
                >
                  +92 326 1234888
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <img 
                    src="/lovable-uploads/39766052-03bd-4b48-9c62-18e9328acf5b.png" 
                    alt="WhatsApp" 
                    className="w-4 h-4"
                  />
                </div>
                <a 
                  href="https://wa.me/923261234888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white" />
                <a 
                  href="mailto:info@aurazemedia.com"
                  className="text-sm hover:text-white transition-colors"
                >
                  info@aurazemedia.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white mt-0.5" />
                <span className="text-sm leading-relaxed">Office 1, Floor 2, B-38, Sector F, DHA-I, Islamabad</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Auraze Media. Powered by{" "}
            <a 
              href="https://hamzaworks.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              Hamza Works
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};
