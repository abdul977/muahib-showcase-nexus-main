import React, { useState } from 'react';
import { LivePreviewModal } from '../components/LivePreviewModal';
import { PreviewButton } from '../components/PreviewButton';
import { TEST_URLS } from '../utils/constants';
import { previewCache } from '../utils/cache';

interface TestSite {
  name: string;
  url: string;
  description: string;
}

const TEST_SITES: TestSite[] = [
  {
    name: 'Robot Kraft Africa',
    url: 'http://robotkraftafrica.com/',
    description: 'Innovative robotics solutions for Africa'
  },
  {
    name: 'Techware Innovation',
    url: 'https://techwareinnovation.com/',
    description: 'Cutting-edge technology solutions'
  },
  {
    name: 'GMETS',
    url: 'http://gmets.com.ng/',
    description: 'Professional engineering services'
  },
  {
    name: 'Example.com',
    url: 'https://example.com',
    description: 'Test site for iframe compatibility'
  },
  {
    name: 'Google',
    url: 'https://google.com',
    description: 'Search engine (likely blocks iframes)'
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    description: 'Code repository platform'
  }
];

export const TestApp: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<TestSite | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState(previewCache.getStats());

  const handlePreview = (site: TestSite) => {
    setSelectedSite(site);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
    // Update cache stats after modal closes
    setTimeout(() => {
      setCacheStats(previewCache.getStats());
    }, 100);
  };

  const handleClearCache = () => {
    previewCache.clear();
    setCacheStats(previewCache.getStats());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Preview Test Environment
          </h1>
          <p className="text-gray-600">
            Testing iframe embedding and screenshot fallback for portfolio websites
          </p>
          
          {/* Cache Stats */}
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Cache Statistics</h3>
                <p className="text-sm text-gray-600">
                  {cacheStats.count} items cached, {cacheStats.size}
                </p>
              </div>
              <button
                onClick={handleClearCache}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Test Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEST_SITES.map((site, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {site.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {site.description}
              </p>
              <p className="text-xs text-gray-500 mb-4 break-all">
                {site.url}
              </p>
              
              <div className="flex items-center justify-between">
                <PreviewButton
                  onClick={() => handlePreview(site)}
                  className="flex-1 mr-2"
                />
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-md hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Testing Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Click "Live Preview" to test each website</li>
            <li>• The system will try iframe embedding first</li>
            <li>• If iframe fails, it will automatically fallback to screenshot</li>
            <li>• Use the toggle buttons in the modal to switch between methods</li>
            <li>• Screenshots are cached to avoid repeated API calls</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedSite && (
        <LivePreviewModal
          url={selectedSite.url}
          siteName={selectedSite.name}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
