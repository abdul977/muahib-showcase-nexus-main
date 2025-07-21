import React, { useState, useEffect } from 'react';
import { screenshotService } from '../services/screenshotService';
import { PREVIEW_STATES, PreviewState } from '../utils/constants';
import { previewCache } from '../utils/cache';

interface ScreenshotPreviewProps {
  url: string;
  onStateChange: (state: PreviewState, error?: string) => void;
  className?: string;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  url,
  onStateChange,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScreenshot = async () => {
      setIsLoading(true);
      setError(null);
      onStateChange(PREVIEW_STATES.LOADING);

      try {
        // Check cache first
        const cached = previewCache.get(url);
        if (cached && cached.method === 'screenshot') {
          setImageUrl(cached.screenshot);
          setIsLoading(false);
          onStateChange(PREVIEW_STATES.SCREENSHOT_SUCCESS);
          return;
        }

        // Take new screenshot
        const result = await screenshotService.takeSimpleScreenshot(url);
        
        if (result.success && result.imageUrl) {
          setImageUrl(result.imageUrl);
          // Cache the result
          previewCache.set(url, result.imageUrl, 'screenshot');
          onStateChange(PREVIEW_STATES.SCREENSHOT_SUCCESS);
        } else {
          throw new Error(result.error || 'Failed to take screenshot');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onStateChange(PREVIEW_STATES.ERROR, errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadScreenshot();
  }, [url, onStateChange]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Taking screenshot...</p>
          <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">Screenshot failed</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={imageUrl}
          alt={`Screenshot of ${url}`}
          className="w-full h-full object-cover rounded"
          onError={() => {
            setError('Failed to load screenshot image');
            onStateChange(PREVIEW_STATES.ERROR, 'Failed to load screenshot image');
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Screenshot
        </div>
      </div>
    );
  }

  return null;
};
