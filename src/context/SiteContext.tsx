
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Site, sites as initialSites } from '@/lib/sites';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteContextType {
  sites: Site[];
  isLoading: boolean;
  error: string | null;
  addSite: (site: Omit<Site, 'id'>) => Promise<void>;
  updateSite: (id: string, site: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setSites(data as Site[]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError('Failed to load sites');
      // Fallback to initial sites if database fetch fails
      setSites(initialSites);
    } finally {
      setIsLoading(false);
    }
  };

  const addSite = async (site: Omit<Site, 'id'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .insert([site])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setSites((prevSites) => [...prevSites, data[0] as Site]);
        toast.success('Site added successfully!');
      }
    } catch (error) {
      console.error('Error adding site:', error);
      toast.error('Failed to add site');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSite = async (id: string, updatedSite: Partial<Site>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .update(updatedSite)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setSites((prevSites) =>
          prevSites.map((site) =>
            site.id === id ? { ...site, ...data[0] } : site
          )
        );
        toast.success('Site updated successfully!');
      }
    } catch (error) {
      console.error('Error updating site:', error);
      toast.error('Failed to update site');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSite = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSites((prevSites) => prevSites.filter((site) => site.id !== id));
      toast.success('Site deleted successfully!');
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteContext.Provider value={{ sites, isLoading, error, addSite, updateSite, deleteSite }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSites = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSites must be used within a SiteProvider');
  }
  return context;
};
