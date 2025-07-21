const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

// ScreenshotOne API configuration
const SCREENSHOT_CONFIG = {
  API_BASE_URL: 'https://api.screenshotone.com/take',
  ACCESS_KEY: 'ANp5E0Up0tde2A',
  SECRET_KEY: 'l7RqU0bm_1jOMA',
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

// Test URLs
const TEST_URLS = [
  'https://example.com',
  'https://techwareinnovation.com/',
  'http://robotkraftafrica.com/',
  'http://gmets.com.ng/'
];

class ScreenshotAPITester {
  constructor() {
    this.results = [];
  }

  generateSignature(params) {
    const query = params.toString();
    return crypto
      .createHmac('sha256', SCREENSHOT_CONFIG.SECRET_KEY)
      .update(query)
      .digest('hex');
  }

  buildUrl(url, options = {}) {
    const params = new URLSearchParams();
    
    // Add required parameters
    params.append('url', url);
    params.append('access_key', SCREENSHOT_CONFIG.ACCESS_KEY);
    
    // Add optional parameters with defaults
    const config = { ...SCREENSHOT_CONFIG.DEFAULT_OPTIONS, ...options };
    
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    // Add signature for authentication
    const signature = this.generateSignature(params);
    params.append('signature', signature);

    return `${SCREENSHOT_CONFIG.API_BASE_URL}?${params.toString()}`;
  }

  async testScreenshot(url) {
    console.log(`\n📸 Testing screenshot for: ${url}`);
    
    try {
      const screenshotUrl = this.buildUrl(url);
      console.log(`  🔗 API URL: ${screenshotUrl.substring(0, 100)}...`);
      
      const startTime = Date.now();
      
      return new Promise((resolve, reject) => {
        const request = https.get(screenshotUrl, (response) => {
          const duration = Date.now() - startTime;
          
          if (response.statusCode === 200) {
            console.log(`  ✅ Success! (${duration}ms)`);
            console.log(`  📊 Content-Type: ${response.headers['content-type']}`);
            console.log(`  📏 Content-Length: ${response.headers['content-length']} bytes`);
            
            // Save screenshot to file for verification
            const filename = `screenshot-${url.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            const filepath = `test-preview/screenshots/${filename}`;
            
            // Create screenshots directory if it doesn't exist
            if (!fs.existsSync('test-preview/screenshots')) {
              fs.mkdirSync('test-preview/screenshots', { recursive: true });
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
              console.log(`  💾 Screenshot saved: ${filepath}`);
              resolve({
                url,
                status: 'success',
                duration,
                filepath,
                contentType: response.headers['content-type'],
                size: response.headers['content-length']
              });
            });
            
            fileStream.on('error', (error) => {
              reject(new Error(`File write error: ${error.message}`));
            });
            
          } else {
            let errorData = '';
            response.on('data', chunk => errorData += chunk);
            response.on('end', () => {
              console.log(`  ❌ API Error: ${response.statusCode} ${response.statusMessage}`);
              console.log(`  📝 Error details: ${errorData}`);
              reject(new Error(`API returned ${response.statusCode}: ${errorData}`));
            });
          }
        });
        
        request.on('error', (error) => {
          console.log(`  ❌ Request Error: ${error.message}`);
          reject(error);
        });
        
        request.setTimeout(30000, () => {
          request.destroy();
          reject(new Error('Request timeout (30s)'));
        });
      });
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      return {
        url,
        status: 'error',
        error: error.message
      };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting ScreenshotOne API tests...');
    console.log(`Testing ${TEST_URLS.length} URLs`);
    console.log(`Using API key: ${SCREENSHOT_CONFIG.ACCESS_KEY}`);
    
    for (const url of TEST_URLS) {
      try {
        const result = await this.testScreenshot(url);
        this.results.push(result);
      } catch (error) {
        this.results.push({
          url,
          status: 'error',
          error: error.message
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCREENSHOT API TEST REPORT');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    
    console.log(`\n📈 Summary:`);
    console.log(`  • Total URLs tested: ${this.results.length}`);
    console.log(`  • Successful: ${successful} (${Math.round(successful/this.results.length*100)}%)`);
    console.log(`  • Failed: ${failed} (${Math.round(failed/this.results.length*100)}%)`);
    
    if (successful > 0) {
      console.log(`\n✅ Successful screenshots:`);
      this.results
        .filter(r => r.status === 'success')
        .forEach(r => {
          console.log(`  • ${r.url}`);
          console.log(`    Duration: ${r.duration}ms, Size: ${r.size} bytes`);
          console.log(`    File: ${r.filepath}`);
        });
    }
    
    if (failed > 0) {
      console.log(`\n❌ Failed screenshots:`);
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  • ${r.url} - ${r.error}`);
        });
    }
    
    console.log(`\n💡 Next steps:`);
    console.log(`  • Check saved screenshots in test-preview/screenshots/`);
    console.log(`  • Verify image quality and content`);
    console.log(`  • Test with different viewport sizes`);
    console.log(`  • Implement caching mechanism`);
    console.log(`  • Integrate with React components`);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new ScreenshotAPITester();
  tester.runAllTests()
    .then(() => {
      console.log('\n✨ Screenshot API tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { ScreenshotAPITester };
