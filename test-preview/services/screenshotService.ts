import { SCREENSHOT_CONFIG } from '../utils/constants';

interface ScreenshotOptions {
  url: string;
  viewport_width?: number;
  viewport_height?: number;
  device_scale_factor?: number;
  format?: 'png' | 'jpeg' | 'webp';
  full_page?: boolean;
  block_ads?: boolean;
  block_cookie_banners?: boolean;
  block_chats?: boolean;
  delay?: number;
}

interface ScreenshotResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class ScreenshotService {
  private accessKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.accessKey = SCREENSHOT_CONFIG.ACCESS_KEY;
    this.secretKey = SCREENSHOT_CONFIG.SECRET_KEY;
    this.baseUrl = SCREENSHOT_CONFIG.API_BASE_URL;
  }

  private generateSignature(params: URLSearchParams): string {
    // ScreenshotOne signature generation
    // For browser environment, we'll skip signature for now
    // In production, signatures should be generated server-side
    const query = params.toString();

    // For testing purposes, we'll use a simple hash
    // In production, use proper HMAC-SHA256 with server-side generation
    try {
      if (typeof window === 'undefined') {
        // Node.js environment
        const crypto = require('crypto');
        return crypto
          .createHmac('sha256', this.secretKey)
          .update(query)
          .digest('hex');
      } else {
        // Browser environment - skip signature for testing
        return '';
      }
    } catch (error) {
      console.warn('Signature generation failed, proceeding without signature');
      return '';
    }
  }

  private buildUrl(options: ScreenshotOptions): string {
    const params = new URLSearchParams();
    
    // Add required parameters
    params.append('url', options.url);
    params.append('access_key', this.accessKey);
    
    // Add optional parameters with defaults
    const config = { ...SCREENSHOT_CONFIG.DEFAULT_OPTIONS, ...options };
    
    if (config.viewport_width) params.append('viewport_width', config.viewport_width.toString());
    if (config.viewport_height) params.append('viewport_height', config.viewport_height.toString());
    if (config.device_scale_factor) params.append('device_scale_factor', config.device_scale_factor.toString());
    if (config.format) params.append('format', config.format);
    if (config.full_page) params.append('full_page', config.full_page.toString());
    if (config.block_ads) params.append('block_ads', config.block_ads.toString());
    if (config.block_cookie_banners) params.append('block_cookie_banners', config.block_cookie_banners.toString());
    if (config.block_chats) params.append('block_chats', config.block_chats.toString());
    if (config.delay) params.append('delay', config.delay.toString());

    // Add signature for authentication (if available)
    const signature = this.generateSignature(params);
    if (signature) {
      params.append('signature', signature);
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  async takeScreenshot(options: ScreenshotOptions): Promise<ScreenshotResponse> {
    try {
      const url = this.buildUrl(options);
      console.log('Taking screenshot of:', options.url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'MuahibShowcase/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
      }

      // For ScreenshotOne, the response is the image itself
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      return {
        success: true,
        imageUrl
      };

    } catch (error) {
      console.error('Screenshot service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Simplified method for quick testing
  async takeSimpleScreenshot(url: string): Promise<ScreenshotResponse> {
    return this.takeScreenshot({
      url,
      ...SCREENSHOT_CONFIG.DEFAULT_OPTIONS
    });
  }

  // Method to get direct URL without fetching (for testing)
  getScreenshotUrl(url: string): string {
    return this.buildUrl({
      url,
      ...SCREENSHOT_CONFIG.DEFAULT_OPTIONS
    });
  }
}

export const screenshotService = new ScreenshotService();
