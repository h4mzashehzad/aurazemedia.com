import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star, Upload, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database } from '@/integrations/supabase/types';
import { Switch } from '@/components/ui/switch';

type AspectRatioType = Database['public']['Enums']['aspect_ratio'];

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  video_url?: string;
  caption: string;
  aspect_ratio: AspectRatioType;
  tags: string[];
  is_featured: boolean;
  display_order: number;
}

export const PortfolioManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image_url: '',
    video_url: '',
    caption: '',
    aspect_ratio: 'square' as AspectRatioType,
    tags: '',
    is_featured: false,
    display_order: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dynamic categories from database
  const { data: categories } = useQuery({
    queryKey: ['portfolio-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data.map(cat => cat.name);
    }
  });

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PortfolioItem[];
    }
  });

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-files')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('portfolio-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: Omit<PortfolioItem, 'id'>) => {
      let imageUrl = data.image_url;
      
      if (useFileUpload && selectedFile) {
        setUploading(true);
        imageUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          ...data,
          image_url: imageUrl,
          tags: data.tags.length > 0 ? data.tags : []
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: "Portfolio item created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error creating portfolio item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: PortfolioItem) => {
      let imageUrl = data.image_url;
      
      if (useFileUpload && selectedFile) {
        setUploading(true);
        imageUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from('portfolio_items')
        .update({
          ...data,
          image_url: imageUrl,
          tags: data.tags.length > 0 ? data.tags : []
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: "Portfolio item updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error updating portfolio item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: "Portfolio item deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting portfolio item", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: categories?.[0] || '',
      image_url: '',
      video_url: '',
      caption: '',
      aspect_ratio: 'square',
      tags: '',
      is_featured: false,
      display_order: 0
    });
    setEditingItem(null);
    setDialogOpen(false);
    setUseFileUpload(false);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useFileUpload && !selectedFile && !editingItem) {
      toast({
        title: "File Required",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!useFileUpload && !formData.image_url) {
      toast({
        title: "URL Required",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (editingItem) {
      updateMutation.mutate({
        ...editingItem,
        ...formData,
        tags: tagsArray
      });
    } else {
      createMutation.mutate({
        ...formData,
        tags: tagsArray
      });
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setFormData({
      title: item.title,
      category: item.category,
      image_url: item.image_url,
      video_url: item.video_url || '',
      caption: item.caption,
      aspect_ratio: item.aspect_ratio,
      tags: item.tags?.join(', ') || '',
      is_featured: item.is_featured,
      display_order: item.display_order
    });
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select an image (JPEG, PNG, GIF) or video (MP4, WebM, OGG) file",
          variant: "destructive"
        });
        return;
      }

      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 500MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Portfolio Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
                <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image/Video Input Toggle */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4" />
                  <span className="text-sm">URL</span>
                  <Switch
                    checked={useFileUpload}
                    onCheckedChange={setUseFileUpload}
                  />
                  <span className="text-sm">Upload File</span>
                  <Upload className="w-4 h-4" />
                </div>

                {useFileUpload ? (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="bg-gray-800 border-gray-600"
                    />
                    {selectedFile && (
                      <div className="text-sm text-gray-400">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Supported: Images (JPEG, PNG, GIF) and Videos (MP4, WebM, OGG). Max size: 500MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Image URL (e.g., https://example.com/image.jpg)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                    />
                    <Input
                      placeholder="Video URL (YouTube, Google Drive, Vimeo, etc.) - Optional"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                )}
              </div>

              <Textarea
                placeholder="Caption"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                required
                className="bg-gray-800 border-gray-600"
              />
              <div className="grid grid-cols-3 gap-4">
                <Select value={formData.aspect_ratio} onValueChange={(value: AspectRatioType) => setFormData({ ...formData, aspect_ratio: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="tall">Tall</SelectItem>
                  </SelectContent>
                </Select>
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
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm">Featured</label>
                </div>
              </div>
              <Input
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-gray-800 border-gray-600"
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={uploading || createMutation.isPending || updateMutation.isPending}
                >
                  {uploading ? 'Uploading...' : (editingItem ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems?.map((item) => (
          <Card key={item.id} className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{item.category}</Badge>
                    {item.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.image_url.includes('video') || item.image_url.endsWith('.mp4') || item.image_url.endsWith('.webm') || item.image_url.endsWith('.ogg') ? (
                <video src={item.image_url} className="w-full h-32 object-cover rounded mb-2" controls />
              ) : (
                <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
              )}
              <p className="text-gray-400 text-sm mb-2">{item.caption}</p>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
