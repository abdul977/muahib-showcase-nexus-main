import React, { useState, useEffect, useRef } from 'react';
import { IFRAME_CONFIG, PREVIEW_STATES, PreviewState } from '../utils/constants';

interface IframePreviewProps {
  url: string;
  onStateChange: (state: PreviewState, error?: string) => void;
  className?: string;
}

export const IframePreview: React.FC<IframePreviewProps> = ({
  url,
  onStateChange,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    onStateChange(PREVIEW_STATES.LOADING);

    // Set timeout for iframe loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        onStateChange(PREVIEW_STATES.ERROR, 'Iframe loading timeout');
      }
    }, IFRAME_CONFIG.TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, onStateChange, isLoading]);

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
    onStateChange(PREVIEW_STATES.IFRAME_SUCCESS);
  };

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
    onStateChange(PREVIEW_STATES.ERROR, 'Iframe failed to load - site may block embedding');
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Site blocks iframe embedding
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Falling back to screenshot...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading preview...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sandbox={IFRAME_CONFIG.SANDBOX_ATTRIBUTES}
        onLoad={handleLoad}
        onError={handleError}
        title={`Preview of ${url}`}
      />
    </div>
  );
};
