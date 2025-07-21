
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSites } from '@/context/SiteContext';
import { Site } from '@/lib/sites';
import { Edit, ExternalLink, Trash, Plus, Loader2 } from 'lucide-react';
import AddSiteModal from '@/components/AddSiteModal';
import EditSiteModal from '@/components/EditSiteModal';
import DeleteDialog from '@/components/DeleteDialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Admin = () => {
  const navigate = useNavigate();
  const { sites, isLoading } = useSites();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  useEffect(() => {
    // Check if user is logged in (for demo, we're using localStorage)
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      // For demo, we'll just add this flag now
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    
    window.scrollTo(0, 0);
  }, [navigate]);

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setEditModalOpen(true);
  };

  const handleDelete = (site: Site) => {
    setSelectedSite(site);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto py-24 px-6 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your portfolio websites</p>
            </div>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Site
            </Button>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-12 gap-6 font-medium text-gray-500 pb-2">
                <div className="col-span-5">Name</div>
                <div className="col-span-4">URL</div>
                <div className="col-span-3">Actions</div>
              </div>
              <Separator className="mb-4" />
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-gray-500">Loading sites...</p>
                  </div>
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sites found. Add your first site!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sites.map((site) => (
                    <div key={site.id} className="grid grid-cols-12 gap-6 items-center py-3">
                      <div className="col-span-5">
                        <div className="font-medium">{site.name}</div>
                        <div className="text-gray-500 text-sm line-clamp-1">{site.description}</div>
                      </div>
                      <div className="col-span-4">
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {site.url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="col-span-3 flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(site)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(site)} 
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
      
      {/* Modals */}
      <AddSiteModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen} 
      />
      
      <EditSiteModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
        site={selectedSite} 
      />
      
      <DeleteDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        siteId={selectedSite?.id || null} 
        siteName={selectedSite?.name || ''} 
      />
    </div>
  );
};

export default Admin;
