import React, { useState } from 'react';
import { IframePreview } from './IframePreview';
import { ScreenshotPreview } from './ScreenshotPreview';
import { PREVIEW_STATES, PreviewState } from '../utils/constants';

interface LivePreviewModalProps {
  url: string;
  siteName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  url,
  siteName,
  isOpen,
  onClose
}) => {
  const [previewState, setPreviewState] = useState<PreviewState>(PREVIEW_STATES.LOADING);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStateChange = (state: PreviewState, errorMessage?: string) => {
    setPreviewState(state);
    setError(errorMessage || null);

    // If iframe fails, switch to screenshot
    if (state === PREVIEW_STATES.ERROR && !showScreenshot) {
      setShowScreenshot(true);
    }
  };

  const handleClose = () => {
    setPreviewState(PREVIEW_STATES.LOADING);
    setShowScreenshot(false);
    setError(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">{siteName}</h2>
            <span className="text-sm text-gray-500">{url}</span>
            {previewState === PREVIEW_STATES.IFRAME_SUCCESS && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Live Preview
              </span>
            )}
            {previewState === PREVIEW_STATES.SCREENSHOT_SUCCESS && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Screenshot
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Open in new tab →
            </a>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 min-h-0 relative">
          {!showScreenshot ? (
            <IframePreview
              url={url}
              onStateChange={handleStateChange}
              className="w-full h-full"
            />
          ) : (
            <ScreenshotPreview
              url={url}
              onStateChange={handleStateChange}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Footer with controls */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowScreenshot(false)}
              className={`px-3 py-1 text-sm rounded ${
                !showScreenshot 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setShowScreenshot(true)}
              className={`px-3 py-1 text-sm rounded ${
                showScreenshot 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Screenshot
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {previewState === PREVIEW_STATES.LOADING && 'Loading...'}
            {previewState === PREVIEW_STATES.ERROR && error && (
              <span className="text-red-600">{error}</span>
            )}
            {previewState === PREVIEW_STATES.IFRAME_SUCCESS && 'Live preview active'}
            {previewState === PREVIEW_STATES.SCREENSHOT_SUCCESS && 'Screenshot loaded'}
          </div>
        </div>
      </div>
    </div>
  );
};
