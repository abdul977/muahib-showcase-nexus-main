// Test environment constants
export const TEST_URLS = [
  'http://robotkraftafrica.com/',
  'https://techwareinnovation.com/',
  'http://gmets.com.ng/',
  'https://example.com',
  'https://google.com',
  'https://github.com'
];

// ScreenshotOne API configuration
export const SCREENSHOT_CONFIG = {
  API_BASE_URL: 'https://api.screenshotone.com/take',
  ACCESS_KEY: 'ANp5E0Up0tde2A', // From keys file
  SECRET_KEY: 'l7RqU0bm_1jOMA', // From keys file
  DEFAULT_OPTIONS: {
    viewport_width: 1200,
    viewport_height: 800,
    device_scale_factor: 1,
    format: 'png',
    full_page: false,
    block_ads: true,
    block_cookie_banners: true,
    block_chats: true
  }
};

export const CACHE_CONFIG = {
  EXPIRY_HOURS: 24,
  MAX_CACHE_SIZE: 50, // Maximum number of cached screenshots
  STORAGE_KEY: 'preview_cache'
};

export const IFRAME_CONFIG = {
  TIMEOUT_MS: 10000, // 10 seconds timeout for iframe loading
  SANDBOX_ATTRIBUTES: 'allow-scripts allow-same-origin allow-popups allow-forms'
};

export const PREVIEW_STATES = {
  LOADING: 'loading',
  IFRAME_SUCCESS: 'iframe_success',
  SCREENSHOT_SUCCESS: 'screenshot_success',
  ERROR: 'error'
} as const;

export type PreviewState = typeof PREVIEW_STATES[keyof typeof PREVIEW_STATES];
