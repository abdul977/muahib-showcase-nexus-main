const https = require('https');
const http = require('http');
const { URL } = require('url');

// Portfolio websites to test
const PORTFOLIO_SITES = [
  'http://robotkraftafrica.com/',
  'https://techwareinnovation.com/',
  'http://gmets.com.ng/',
  // Additional test sites
  'https://example.com',
  'https://google.com',
  'https://github.com',
  'https://stackoverflow.com',
  'https://youtube.com'
];

class IframeCompatibilityTester {
  constructor() {
    this.results = [];
  }

  async testSite(url) {
    console.log(`\n🔍 Testing: ${url}`);
    
    try {
      const headers = await this.fetchHeaders(url);
      const analysis = this.analyzeHeaders(headers);
      
      const result = {
        url,
        status: 'success',
        iframeAllowed: analysis.iframeAllowed,
        reason: analysis.reason,
        headers: {
          'x-frame-options': headers['x-frame-options'] || 'not set',
          'content-security-policy': headers['content-security-policy'] || 'not set'
        },
        recommendations: analysis.recommendations
      };

      this.results.push(result);
      this.logResult(result);
      
      return result;
    } catch (error) {
      const result = {
        url,
        status: 'error',
        error: error.message,
        iframeAllowed: false,
        reason: `Network error: ${error.message}`
      };
      
      this.results.push(result);
      this.logResult(result);
      
      return result;
    }
  }

  fetchHeaders(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      const req = client.request(options, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`  ↳ Redirected to: ${res.headers.location}`);
          this.fetchHeaders(res.headers.location).then(resolve).catch(reject);
          return;
        }
        
        resolve(res.headers);
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  analyzeHeaders(headers) {
    const xFrameOptions = headers['x-frame-options'];
    const csp = headers['content-security-policy'];
    
    let iframeAllowed = true;
    let reason = 'No restrictions found';
    let recommendations = [];

    // Check X-Frame-Options
    if (xFrameOptions) {
      const xFrameValue = xFrameOptions.toLowerCase();
      if (xFrameValue === 'deny') {
        iframeAllowed = false;
        reason = 'X-Frame-Options: DENY - completely blocks iframe embedding';
      } else if (xFrameValue === 'sameorigin') {
        iframeAllowed = false;
        reason = 'X-Frame-Options: SAMEORIGIN - only allows same-origin embedding';
      } else if (xFrameValue.startsWith('allow-from')) {
        iframeAllowed = false;
        reason = 'X-Frame-Options: ALLOW-FROM - only allows specific origins';
      }
    }

    // Check Content-Security-Policy
    if (csp && iframeAllowed) {
      const frameAncestorsMatch = csp.match(/frame-ancestors\s+([^;]+)/i);
      if (frameAncestorsMatch) {
        const frameAncestors = frameAncestorsMatch[1].trim();
        if (frameAncestors === "'none'") {
          iframeAllowed = false;
          reason = 'CSP frame-ancestors: none - blocks all iframe embedding';
        } else if (frameAncestors === "'self'") {
          iframeAllowed = false;
          reason = 'CSP frame-ancestors: self - only allows same-origin embedding';
        } else if (!frameAncestors.includes('*')) {
          iframeAllowed = false;
          reason = 'CSP frame-ancestors: restricted - only allows specific origins';
        }
      }
    }

    // Generate recommendations
    if (!iframeAllowed) {
      recommendations.push('Use screenshot API as fallback');
      recommendations.push('Consider proxy/CORS solution if needed');
    } else {
      recommendations.push('Iframe embedding should work');
      recommendations.push('Test with actual iframe to confirm');
    }

    return { iframeAllowed, reason, recommendations };
  }

  logResult(result) {
    const status = result.iframeAllowed ? '✅ ALLOWED' : '❌ BLOCKED';
    const color = result.iframeAllowed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`  ${color}${status}${reset} - ${result.reason}`);
    
    if (result.headers) {
      console.log(`  📋 X-Frame-Options: ${result.headers['x-frame-options']}`);
      if (result.headers['content-security-policy'] !== 'not set') {
        const csp = result.headers['content-security-policy'];
        const truncated = csp.length > 100 ? csp.substring(0, 100) + '...' : csp;
        console.log(`  🔒 CSP: ${truncated}`);
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IFRAME COMPATIBILITY TEST REPORT');
    console.log('='.repeat(60));
    
    const allowed = this.results.filter(r => r.iframeAllowed).length;
    const blocked = this.results.filter(r => !r.iframeAllowed).length;
    const errors = this.results.filter(r => r.status === 'error').length;
    
    console.log(`\n📈 Summary:`);
    console.log(`  • Total sites tested: ${this.results.length}`);
    console.log(`  • Iframe allowed: ${allowed} (${Math.round(allowed/this.results.length*100)}%)`);
    console.log(`  • Iframe blocked: ${blocked} (${Math.round(blocked/this.results.length*100)}%)`);
    console.log(`  • Network errors: ${errors}`);
    
    console.log(`\n✅ Sites allowing iframe embedding:`);
    this.results
      .filter(r => r.iframeAllowed)
      .forEach(r => console.log(`  • ${r.url}`));
    
    console.log(`\n❌ Sites blocking iframe embedding:`);
    this.results
      .filter(r => !r.iframeAllowed && r.status !== 'error')
      .forEach(r => console.log(`  • ${r.url} - ${r.reason}`));
    
    if (errors > 0) {
      console.log(`\n⚠️  Sites with network errors:`);
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`  • ${r.url} - ${r.error}`));
    }

    console.log(`\n💡 Recommendations:`);
    console.log(`  • Use hybrid approach: try iframe first, fallback to screenshot`);
    console.log(`  • Implement proper error handling for blocked sites`);
    console.log(`  • Cache results to avoid repeated checks`);
    console.log(`  • Consider user feedback for preview quality`);
    
    return this.results;
  }

  async runAllTests() {
    console.log('🚀 Starting iframe compatibility tests...');
    console.log(`Testing ${PORTFOLIO_SITES.length} websites`);
    
    for (const site of PORTFOLIO_SITES) {
      await this.testSite(site);
      // Small delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return this.generateReport();
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const tester = new IframeCompatibilityTester();
  tester.runAllTests()
    .then(results => {
      console.log('\n✨ Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { IframeCompatibilityTester, PORTFOLIO_SITES };
