
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Mail, Phone, MapPin } from "lucide-react";

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
  const contactInfo = siteConfig?.contact;

  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold">{siteConfig?.name || "Tasveeri Yaadein"}</h3>
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
            <h4 className="text-lg font-semibold text-purple-400">Our Services</h4>
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
            <h4 className="text-lg font-semibold text-purple-400">Quick Links</h4>
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
            <h4 className="text-lg font-semibold text-purple-400">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              {contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{contactInfo.email}</span>
                </div>
              )}
              {contactInfo?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span className="text-sm leading-relaxed">{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {siteConfig?.name || "Tasveeri Yaadein"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
