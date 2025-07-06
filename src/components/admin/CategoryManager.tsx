
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface PortfolioCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export const CategoryManager = () => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-portfolio-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PortfolioCategory[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = Math.max(...(categories?.map(c => c.display_order) || [0]));
      const { error } = await supabase
        .from('portfolio_categories')
        .insert([{
          name,
          display_order: maxOrder + 1
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-categories'] });
      toast({ title: "Category created successfully" });
      setNewCategoryName('');
      setIsAdding(false);
    },
    onError: (error) => {
      toast({ title: "Error creating category", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('portfolio_categories')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-categories'] });
      toast({ title: "Category updated successfully" });
      setEditingCategory(null);
      setEditName('');
    },
    onError: (error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('portfolio_categories')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-categories'] });
      toast({ title: "Category status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating category status", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-categories'] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (category: PortfolioCategory) => {
    setEditingCategory(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      updateMutation.mutate({ id: editingCategory, name: editName.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(newCategoryName.trim());
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Portfolio Categories</h3>
        <Button 
          onClick={() => setIsAdding(true)} 
          className="bg-blue-500 hover:bg-blue-600"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} size="sm" className="bg-green-500 hover:bg-green-600">
                <Save className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsAdding(false)} size="sm" variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <Card key={category.id} className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              {editingCategory === category.id ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <div className="flex gap-1">
                    <Button onClick={handleSaveEdit} size="sm" className="bg-green-500 hover:bg-green-600">
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="outline">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">{category.name}</h4>
                    <Badge className={category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => handleEdit(category)} size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      onClick={() => toggleActiveMutation.mutate({ id: category.id, is_active: !category.is_active })}
                      size="sm" 
                      variant="outline"
                      className={category.is_active ? 'text-red-400' : 'text-green-400'}
                    >
                      {category.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      onClick={() => deleteMutation.mutate(category.id)} 
                      size="sm" 
                      variant="outline"
                      className="text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
