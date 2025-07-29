
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, Image, Package, Settings, MessageSquare, FolderOpen } from 'lucide-react';
import { PortfolioManager } from './PortfolioManager';
import { TeamManager } from './TeamManager';
import { PricingManager } from './PricingManager';
import { ContactManager } from './ContactManager';
import { SettingsManager } from './SettingsManager';
import { CategoryManager } from './CategoryManager';

interface AdminDashboardProps {
  admin: { id: string; full_name: string; email: string };
  onLogout: () => void;
}

export const AdminDashboard = ({ admin, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('portfolio');

  // Fetch admin role
  const { data: adminRole, isLoading } = useQuery({
    queryKey: ['admin-role', admin.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_role', {
        _admin_id: admin.id
      });
      
      if (error) throw error;
      return data as string;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    onLogout();
  };

  // Define what tabs each role can access
  const getAvailableTabs = (role: string) => {
    if (role === 'super_admin') {
      return ['portfolio', 'categories', 'team', 'pricing', 'contact', 'settings'];
    } else if (role === 'portfolio_admin') {
      return ['portfolio', 'categories'];
    }
    return ['portfolio']; // Default fallback
  };

  const availableTabs = adminRole ? getAvailableTabs(adminRole) : ['portfolio'];

  // Ensure active tab is available to current role
  useEffect(() => {
    if (adminRole && !availableTabs.includes(activeTab)) {
      setActiveTab('portfolio');
    }
  }, [adminRole, availableTabs, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading admin permissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-400">Welcome, {admin.full_name}</p>
              {adminRole && (
                <Badge variant="outline" className="text-xs">
                  {adminRole === 'super_admin' ? 'Super Admin' : 'Portfolio Admin'}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full bg-gray-900 ${availableTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-6'}`}>
            {availableTabs.includes('portfolio') && (
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
            )}
            {availableTabs.includes('categories') && (
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Categories
              </TabsTrigger>
            )}
            {availableTabs.includes('team') && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
            )}
            {availableTabs.includes('pricing') && (
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pricing
              </TabsTrigger>
            )}
            {availableTabs.includes('contact') && (
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact
              </TabsTrigger>
            )}
            {availableTabs.includes('settings') && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="portfolio">
            <PortfolioManager />
          </TabsContent>

          {availableTabs.includes('categories') && (
            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>
          )}

          {availableTabs.includes('team') && (
            <TabsContent value="team">
              <TeamManager />
            </TabsContent>
          )}

          {availableTabs.includes('pricing') && (
            <TabsContent value="pricing">
              <PricingManager />
            </TabsContent>
          )}

          {availableTabs.includes('contact') && (
            <TabsContent value="contact">
              <ContactManager />
            </TabsContent>
          )}

          {availableTabs.includes('settings') && (
            <TabsContent value="settings">
              <SettingsManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
