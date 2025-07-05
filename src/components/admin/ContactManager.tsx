
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  message: string;
  status: string | null;
  admin_notes: string | null;
  created_at: string;
}

export const ContactManager = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['admin-contact-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactInquiry[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes: string }) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status, admin_notes })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-inquiries'] });
      toast({ title: "Inquiry updated successfully" });
      setSelectedInquiry(null);
      setAdminNotes('');
      setStatus('');
    },
    onError: (error) => {
      toast({ title: "Error updating inquiry", description: error.message, variant: "destructive" });
    }
  });

  const handleUpdateInquiry = () => {
    if (selectedInquiry) {
      updateMutation.mutate({
        id: selectedInquiry.id,
        status: status || selectedInquiry.status || 'new',
        admin_notes: adminNotes
      });
    }
  };

  const handleViewInquiry = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setStatus(inquiry.status || 'new');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Contact Inquiries</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries List */}
        <div className="space-y-4">
          {inquiries?.map((inquiry) => (
            <Card key={inquiry.id} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{inquiry.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{inquiry.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status || 'new'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewInquiry(inquiry)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {inquiry.project_type && (
                  <Badge variant="secondary" className="mb-2">
                    {inquiry.project_type}
                  </Badge>
                )}
                <p className="text-gray-300 text-sm mb-2 line-clamp-3">{inquiry.message}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(inquiry.created_at).toLocaleDateString()} at {new Date(inquiry.created_at).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inquiry Detail */}
        <div className="sticky top-4">
          {selectedInquiry ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Inquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold">{selectedInquiry.name}</h3>
                  <p className="text-gray-400">{selectedInquiry.email}</p>
                  {selectedInquiry.project_type && (
                    <Badge variant="secondary" className="mt-1">
                      {selectedInquiry.project_type}
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <div className="bg-gray-800 p-3 rounded border border-gray-600">
                    <p className="text-gray-300">{selectedInquiry.message}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateInquiry} className="bg-blue-500 hover:bg-blue-600">
                    Update Inquiry
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                    Cancel
                  </Button>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  Received: {new Date(selectedInquiry.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-gray-400">Select an inquiry to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
