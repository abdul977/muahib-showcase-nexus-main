
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Site } from '@/lib/sites';
import { ExternalLink } from 'lucide-react';

interface SiteCardProps {
  site: Site;
  index: number;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className="site-card"
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden h-full border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-lg">
        <div className="aspect-video relative overflow-hidden">
          <div 
            className={`absolute inset-0 bg-gray-200 ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          />
          <img
            src={site.image}
            alt={site.name}
            className={`object-cover w-full h-full transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-black/0 transition-colors duration-300 ${isHovered ? 'bg-black/20' : ''}`} />
        </div>
        <CardContent className="p-6">
          <div>
            <h3 className="font-medium text-lg mb-2 text-balance">{site.name}</h3>
            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{site.description}</p>
            <a 
              href={site.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button 
                variant="default" 
                size="sm" 
                className="w-full transition-all duration-300 group"
              >
                <span>Visit Site</span>
                <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteCard;
