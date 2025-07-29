
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PricingPackage {
  id: string;
  name: string;
  price: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  is_visible: boolean;
  display_order: number;
}

export const PricingManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    features: '',
    is_popular: false,
    is_active: true,
    is_visible: true,
    display_order: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricingPackages, isLoading } = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_packages')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PricingPackage[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<PricingPackage, 'id'>) => {
      const { error } = await supabase
        .from('pricing_packages')
        .insert([{
          ...data,
          features: data.features.length > 0 ? data.features : []
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
      toast({ title: "Pricing package created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error creating pricing package", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: PricingPackage) => {
      const { error } = await supabase
        .from('pricing_packages')
        .update({
          ...data,
          features: data.features.length > 0 ? data.features : []
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
      toast({ title: "Pricing package updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error updating pricing package", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
      toast({ title: "Pricing package deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting pricing package", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      features: '',
      is_popular: false,
      is_active: true,
      is_visible: true,
      display_order: 0
    });
    setEditingPackage(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = formData.features.split('\n').map(feature => feature.trim()).filter(feature => feature);
    
    if (editingPackage) {
      updateMutation.mutate({
        ...editingPackage,
        ...formData,
        features: featuresArray
      });
    } else {
      createMutation.mutate({
        ...formData,
        features: featuresArray
      });
    }
  };

  const handleEdit = (pkg: PricingPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      features: pkg.features.join('\n'),
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      is_visible: pkg.is_visible,
      display_order: pkg.display_order
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Pricing Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPackage(null)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Pricing Package
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPackage ? 'Edit' : 'Add'} Pricing Package</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Package Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
                <Input
                  placeholder="Price (e.g., Rs. 25,000)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <Textarea
                placeholder="Features (one per line)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                required
                rows={6}
                className="bg-gray-800 border-gray-600"
              />
              <div className="grid grid-cols-4 gap-4">
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-600"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="popular" className="text-sm">Popular</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm">Active</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="visible" className="text-sm">Visible</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingPackage ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingPackages?.map((pkg) => (
          <Card key={pkg.id} className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{pkg.name}</CardTitle>
                  <p className="text-blue-400 text-xl font-bold">{pkg.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {pkg.is_popular && <Star className="w-4 h-4 text-yellow-500" />}
                    <span className={`text-xs px-2 py-1 rounded ${pkg.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${pkg.is_visible ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {pkg.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(pkg.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {pkg.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-gray-400 text-sm">• {feature}</li>
                ))}
                {pkg.features.length > 3 && (
                  <li className="text-gray-500 text-sm">+ {pkg.features.length - 3} more...</li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
