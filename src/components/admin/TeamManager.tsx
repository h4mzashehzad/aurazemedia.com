
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  experience: string;
  bio: string | null;
  display_order: number;
  is_active: boolean;
}

export const TeamManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image_url: '',
    experience: '',
    bio: '',
    display_order: 0,
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TeamMember[];
    }
  });

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('team-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('team-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: Omit<TeamMember, 'id'>) => {
      let imageUrl = data.image_url;
      
      if (useFileUpload && selectedFile) {
        setUploading(true);
        imageUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from('team_members')
        .insert([{ ...data, image_url: imageUrl }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: "Team member added successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error adding team member", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: TeamMember) => {
      let imageUrl = data.image_url;
      
      if (useFileUpload && selectedFile) {
        setUploading(true);
        imageUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from('team_members')
        .update({ ...data, image_url: imageUrl })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: "Team member updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error updating team member", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: "Team member deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting team member", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      image_url: '',
      experience: '',
      bio: '',
      display_order: 0,
      is_active: true
    });
    setEditingMember(null);
    setDialogOpen(false);
    setUseFileUpload(false);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useFileUpload && !selectedFile && !editingMember) {
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
    
    if (editingMember) {
      updateMutation.mutate({
        ...editingMember,
        ...formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      image_url: member.image_url,
      experience: member.experience,
      bio: member.bio || '',
      display_order: member.display_order,
      is_active: member.is_active
    });
    setUseFileUpload(false);
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF)",
          variant: "destructive"
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
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
        <h2 className="text-2xl font-bold text-white">Team Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
                <Input
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
              </div>

              {/* Image Input Toggle */}
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
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-gray-800 border-gray-600"
                    />
                    {selectedFile && (
                      <div className="text-sm text-gray-400">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Supported: JPEG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                ) : (
                  <Input
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Experience (e.g., 5+ years)"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Display Order"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <Textarea
                placeholder="Bio (optional)"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-gray-800 border-gray-600"
              />
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={uploading || createMutation.isPending || updateMutation.isPending}
                >
                  {uploading ? 'Uploading...' : (editingMember ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers?.map((member) => (
          <Card key={member.id} className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                  <p className="text-blue-400">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.experience}</p>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(member.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img src={member.image_url} alt={member.name} className="w-full h-32 object-cover rounded mb-2" />
              {member.bio && <p className="text-gray-400 text-sm">{member.bio}</p>}
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded ${member.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
