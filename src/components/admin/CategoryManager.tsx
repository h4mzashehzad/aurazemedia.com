
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, GripVertical, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PortfolioCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  is_password_protected: boolean | null;
  password_hash: string | null;
}

interface SortableItemProps {
  category: PortfolioCategory;
  editingCategory: string | null;
  editName: string;
  editPassword: string;
  editPasswordProtected: boolean;
  showPassword: boolean;
  onEdit: (category: PortfolioCategory) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  setEditName: (name: string) => void;
  setEditPassword: (password: string) => void;
  setEditPasswordProtected: (isProtected: boolean) => void;
  setShowPassword: (show: boolean) => void;
}

const SortableItem = ({ 
  category, 
  editingCategory, 
  editName, 
  editPassword,
  editPasswordProtected,
  showPassword,
  onEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onToggleActive, 
  onDelete, 
  setEditName,
  setEditPassword,
  setEditPasswordProtected,
  setShowPassword
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-gray-900 border-gray-700">
      <CardContent className="pt-4">
        {editingCategory === category.id ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Category name"
              onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Password Protection</label>
                <Switch
                  checked={editPasswordProtected}
                  onCheckedChange={setEditPasswordProtected}
                />
              </div>
              
              {editPasswordProtected && (
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button onClick={onSaveEdit} size="sm" className="bg-green-500 hover:bg-green-600">
                <Save className="w-3 h-3" />
              </Button>
              <Button onClick={onCancelEdit} size="sm" variant="outline">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <div 
                   {...attributes} 
                   {...listeners} 
                   className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700 rounded"
                 >
                   <GripVertical className="w-4 h-4 text-gray-400" />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                     #{category.display_order}
                   </span>
                   <h4 className="font-semibold text-white">{category.name}</h4>
                   {category.is_password_protected && (
                     <Lock className="w-4 h-4 text-yellow-400" />
                   )}
                 </div>
               </div>
               <div className="flex gap-2">
                 <Badge className={category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                   {category.is_active ? 'Active' : 'Inactive'}
                 </Badge>
                 {category.is_password_protected && (
                   <Badge className="bg-yellow-500/20 text-yellow-400">
                     Protected
                   </Badge>
                 )}
               </div>
             </div>
            <div className="flex gap-1">
              <Button onClick={() => onEdit(category)} size="sm" variant="outline">
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                onClick={() => onToggleActive(category.id, !category.is_active)}
                size="sm" 
                variant="outline"
                className={category.is_active ? 'text-red-400' : 'text-green-400'}
              >
                {category.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button 
                onClick={() => onDelete(category.id)} 
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
  );
};

export const CategoryManager = () => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordProtected, setEditPasswordProtected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    mutationFn: async ({ id, name, is_password_protected, password }: { id: string; name: string; is_password_protected: boolean; password?: string }) => {
      const updateData: any = { name, is_password_protected };
      
      // Only update password if protection is enabled and password is provided
      if (is_password_protected && password) {
        // Simple hash for demo - in production, use proper server-side hashing
        updateData.password_hash = btoa(password); // Base64 encoding for demo
      } else if (!is_password_protected) {
        updateData.password_hash = null;
      }
      
      const { error } = await supabase
        .from('portfolio_categories')
        .update(updateData)
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

  const reorderMutation = useMutation({
    mutationFn: async (reorderedCategories: PortfolioCategory[]) => {
      const updates = reorderedCategories.map((category, index) => ({
        id: category.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('portfolio_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-categories'] });
      toast({ title: "Categories reordered successfully" });
    },
    onError: (error) => {
      toast({ title: "Error reordering categories", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (category: PortfolioCategory) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditPasswordProtected(category.is_password_protected || false);
    setEditPassword('');
    setShowPassword(false);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      updateMutation.mutate({ 
        id: editingCategory, 
        name: editName.trim(),
        is_password_protected: editPasswordProtected,
        password: editPasswordProtected ? editPassword : undefined
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditPassword('');
    setEditPasswordProtected(false);
    setShowPassword(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(newCategoryName.trim());
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && categories) {
      const oldIndex = categories.findIndex((category) => category.id === active.id);
      const newIndex = categories.findIndex((category) => category.id === over?.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      reorderMutation.mutate(reorderedCategories);
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Portfolio Categories</h3>
          <p className="text-sm text-gray-400 mt-1">Drag and drop categories to reorder them</p>
        </div>
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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={categories?.map(cat => cat.id) || []} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {categories?.map((category) => (
              <SortableItem
                key={category.id}
                category={category}
                editingCategory={editingCategory}
                editName={editName}
                editPassword={editPassword}
                editPasswordProtected={editPasswordProtected}
                showPassword={showPassword}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, is_active: isActive })}
                onDelete={(id) => deleteMutation.mutate(id)}
                setEditName={setEditName}
                setEditPassword={setEditPassword}
                setEditPasswordProtected={setEditPasswordProtected}
                setShowPassword={setShowPassword}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
