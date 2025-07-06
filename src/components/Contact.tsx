
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type ProjectCategory = Database["public"]["Enums"]["project_category"];

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project_type: '' as ProjectCategory | '',
    message: ''
  });

  const { toast } = useToast();

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

  const submitInquiry = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Submitting inquiry with data:', data);
      
      // Create the insert data object - only include project_type if it's not empty
      const insertData: any = {
        name: data.name,
        email: data.email,
        message: data.message
      };

      // Only add project_type if it's not empty string
      if (data.project_type) {
        insertData.project_type = data.project_type;
      }

      console.log('Insert data prepared:', insertData);
      
      // Try the insert without setting status initially
      const { data: result, error } = await supabase
        .from('contact_inquiries')
        .insert([insertData])
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to submit inquiry: ${error.message}`);
      }
      
      console.log('Inquiry submitted successfully:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', project_type: '', message: '' });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    submitInquiry.mutate(formData);
  };

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-blue-400">Get In Touch</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ready to capture your special moments? Let's discuss your project
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <Select 
                    value={formData.project_type} 
                    onValueChange={(value) => setFormData({ ...formData, project_type: value as ProjectCategory | '' })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Real Estate" className="text-white hover:bg-gray-700">Real Estate</SelectItem>
                      <SelectItem value="Medical" className="text-white hover:bg-gray-700">Medical</SelectItem>
                      <SelectItem value="Clothing" className="text-white hover:bg-gray-700">Clothing</SelectItem>
                      <SelectItem value="Food" className="text-white hover:bg-gray-700">Food</SelectItem>
                      <SelectItem value="Construction" className="text-white hover:bg-gray-700">Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project..."
                    rows={6}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={submitInquiry.isPending}
                >
                  {submitInquiry.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo?.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-white">Phone</h3>
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-white">Email</h3>
                    <a 
                      href="mailto:info@aurazemedia.com"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      info@aurazemedia.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-white">Address</h3>
                    <p className="text-gray-400">Islamabad, Pakistan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-blue-500/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Why Choose Us?</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Professional quality guaranteed
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Quick turnaround times
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Competitive pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Experienced team
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
