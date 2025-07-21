
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSites } from '@/context/SiteContext';
import { Site } from '@/lib/sites';
import { Loader2 } from 'lucide-react';

interface EditSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site | null;
}

const EditSiteModal: React.FC<EditSiteModalProps> = ({ open, onOpenChange, site }) => {
  const { updateSite, isLoading } = useSites();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        url: site.url,
        description: site.description,
        image: site.image,
      });
    }
  }, [site]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!site) return;
    
    // Validate the form
    if (!formData.name || !formData.url || !formData.description) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    // Update the site
    await updateSite(site.id, formData);
    
    // Close the modal
    onOpenChange(false);
  };

  if (!site) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
          <DialogDescription>
            Update the details for {site.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="col-span-3"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Site'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSiteModal;
