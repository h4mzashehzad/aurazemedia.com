
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Image, Package, Settings, MessageSquare, FolderOpen } from 'lucide-react';
import { PortfolioManager } from './PortfolioManager';
import { TeamManager } from './TeamManager';
import { PricingManager } from './PricingManager';
import { ContactManager } from './ContactManager';
import { SettingsManager } from './SettingsManager';
import { CategoryManager } from './CategoryManager';

interface AdminDashboardProps {
  admin: { id: string; full_name: string; email: string; role: string };
  onLogout: () => void;
}

export const AdminDashboard = ({ admin, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('portfolio');

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    onLogout();
  };

  // Define which tabs are accessible for each role
  const getAccessibleTabs = () => {
    if (admin.role === 'portfolio_admin') {
      return ['portfolio'];
    }
    // super_admin has access to all tabs
    return ['portfolio', 'categories', 'team', 'pricing', 'contact', 'settings'];
  };

  const accessibleTabs = getAccessibleTabs();
  
  // Get appropriate grid class based on tab count
  const getGridClass = () => {
    const tabCount = accessibleTabs.length;
    switch (tabCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-6';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400">Welcome, {admin.full_name}</p>
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
          <TabsList className={`grid w-full ${getGridClass()} bg-gray-900`}>
            {accessibleTabs.includes('portfolio') && (
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
            )}
            {accessibleTabs.includes('categories') && (
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Categories
              </TabsTrigger>
            )}
            {accessibleTabs.includes('team') && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
            )}
            {accessibleTabs.includes('pricing') && (
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pricing
              </TabsTrigger>
            )}
            {accessibleTabs.includes('contact') && (
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact
              </TabsTrigger>
            )}
            {accessibleTabs.includes('settings') && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          {accessibleTabs.includes('portfolio') && (
            <TabsContent value="portfolio">
              <PortfolioManager />
            </TabsContent>
          )}

          {accessibleTabs.includes('categories') && (
            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>
          )}

          {accessibleTabs.includes('team') && (
            <TabsContent value="team">
              <TeamManager />
            </TabsContent>
          )}

          {accessibleTabs.includes('pricing') && (
            <TabsContent value="pricing">
              <PricingManager />
            </TabsContent>
          )}

          {accessibleTabs.includes('contact') && (
            <TabsContent value="contact">
              <ContactManager />
            </TabsContent>
          )}

          {accessibleTabs.includes('settings') && (
            <TabsContent value="settings">
              <SettingsManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
