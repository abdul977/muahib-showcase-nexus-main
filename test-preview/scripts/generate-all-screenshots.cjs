const https = require('https');
const fs = require('fs');
const path = require('path');
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

// All websites to screenshot
const ALL_WEBSITES = [
  // Original Backend Sites
  { id: '1', name: 'Robot Kraft Africa', url: 'http://robotkraftafrica.com/', filename: 'robot-kraft-africa.png' },
  { id: '2', name: 'Techware Innovation', url: 'https://techwareinnovation.com/', filename: 'techware-innovation.png' },
  { id: '3', name: 'GMETS', url: 'http://gmets.com.ng/', filename: 'gmets.png' },
  { id: '4', name: 'SRUM Associates', url: 'https://srumassociatesltd.com.ng/', filename: 'srum-associates.png' },
  { id: '5', name: 'Cyber Guards', url: 'https://cyberguards.ng/', filename: 'cyber-guards.png' },
  { id: '6', name: 'Tronicsville', url: 'http://tronicsville.com/', filename: 'tronicsville.png' },
  { id: '7', name: 'Brainz University', url: 'https://brainzuniversity.com/', filename: 'brainz-university.png' },
  { id: '8', name: 'Digital Marketplace', url: 'https://gorgeous-churros-97475e.netlify.app/', filename: 'digital-marketplace.png' },
  { id: '9', name: 'Shop Self', url: 'https://shop-self-five.vercel.app/', filename: 'shop-self.png' },
  
  // Additional Sites
  { id: '10', name: 'Muahib Stores', url: 'https://muahibstores.vercel.app/', filename: 'muahib-stores.png' },
  { id: '11', name: 'Binbaz', url: 'https://binbaz.vercel.app/', filename: 'binbaz.png' },
  { id: '12', name: 'Jazzy Capybara', url: 'https://jazzy-capybara-d1d994.netlify.app/', filename: 'jazzy-capybara.png' },
  { id: '13', name: 'Video Time Slicer', url: 'https://video-time-slicer-magic.lovable.app/', filename: 'video-time-slicer.png' },
  { id: '14', name: 'Diamond Bakes', url: 'https://diamondbakes.vercel.app/', filename: 'diamond-bakes.png' },
  { id: '15', name: 'Muahib Academy', url: 'https://muahibacademy.vercel.app/', filename: 'muahib-academy.png' },
  { id: '16', name: 'Agency Project Space', url: 'https://agency-project-space.vercel.app/', filename: 'agency-project-space.png' },
  { id: '17', name: 'BFT Capital', url: 'https://bftcapital.vercel.app/', filename: 'bft-capital.png' },
  { id: '18', name: 'MCAN Lodge', url: 'https://mcanlogde1.vercel.app/', filename: 'mcan-lodge.png' },
  { id: '19', name: 'Arabic Cleaner', url: 'https://arabic-cleaner-web-a91v.vercel.app/', filename: 'arabic-cleaner.png' },
  { id: '20', name: '1791 Technology', url: 'https://test-1791technology.vercel.app/', filename: '1791-technology.png' },
  { id: '21', name: 'Watch Together', url: 'https://watch-together-six.vercel.app/', filename: 'watch-together.png' },
  { id: '22', name: 'Movie Hangout', url: 'https://movie-hangout.vercel.app/', filename: 'movie-hangout.png' },
  { id: '23', name: 'Smart Stock', url: 'https://smartstock-cyan.vercel.app/', filename: 'smart-stock.png' },
  { id: '24', name: 'Portfolio', url: 'https://potfolio-lilac-one.vercel.app/', filename: 'portfolio.png' },
  { id: '25', name: 'Muahib Solutions', url: 'https://muahibsolutions.vercel.app/', filename: 'muahib-solutions.png' },
  { id: '26', name: 'Spiffy Torrone', url: 'https://spiffy-torrone-e4452e.netlify.app/', filename: 'spiffy-torrone.png' },
  { id: '27', name: 'Stellular Youtiao', url: 'https://stellular-youtiao-520eb6.netlify.app/', filename: 'stellular-youtiao.png' },
  { id: '28', name: 'Muahib Showcase Nexus', url: 'https://muahib-showcase-nexus.lovable.app', filename: 'muahib-showcase-nexus.png' }
];

class ScreenshotGenerator {
  constructor() {
    this.results = [];
    this.publicDir = path.join(process.cwd(), 'public');
    this.screenshotsDir = path.join(this.publicDir, 'screenshots');
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
    
    params.append('url', url);
    params.append('access_key', SCREENSHOT_CONFIG.ACCESS_KEY);
    
    const config = { ...SCREENSHOT_CONFIG.DEFAULT_OPTIONS, ...options };
    
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const signature = this.generateSignature(params);
    params.append('signature', signature);

    return `${SCREENSHOT_CONFIG.API_BASE_URL}?${params.toString()}`;
  }

  ensureDirectories() {
    if (!fs.existsSync(this.publicDir)) {
      fs.mkdirSync(this.publicDir, { recursive: true });
      console.log(`📁 Created public directory: ${this.publicDir}`);
    }
    
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
      console.log(`📁 Created screenshots directory: ${this.screenshotsDir}`);
    }
  }

  async generateScreenshot(website) {
    console.log(`\n📸 [${website.id}/28] Generating screenshot for: ${website.name}`);
    console.log(`   🔗 URL: ${website.url}`);
    
    try {
      const screenshotUrl = this.buildUrl(website.url);
      const startTime = Date.now();
      
      return new Promise((resolve, reject) => {
        const request = https.get(screenshotUrl, (response) => {
          const duration = Date.now() - startTime;
          
          if (response.statusCode === 200) {
            const filepath = path.join(this.screenshotsDir, website.filename);
            const fileStream = fs.createWriteStream(filepath);
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
              const sizeKB = Math.round(parseInt(response.headers['content-length'] || '0') / 1024);
              console.log(`   ✅ Success! (${duration}ms, ${sizeKB}KB)`);
              console.log(`   💾 Saved: public/screenshots/${website.filename}`);
              
              resolve({
                ...website,
                status: 'success',
                duration,
                size: sizeKB,
                filepath: `public/screenshots/${website.filename}`
              });
            });
            
            fileStream.on('error', (error) => {
              console.log(`   ❌ File write error: ${error.message}`);
              reject(error);
            });
            
          } else {
            let errorData = '';
            response.on('data', chunk => errorData += chunk);
            response.on('end', () => {
              console.log(`   ❌ API Error: ${response.statusCode} ${response.statusMessage}`);
              console.log(`   📝 Details: ${errorData.substring(0, 100)}...`);
              reject(new Error(`API returned ${response.statusCode}: ${errorData}`));
            });
          }
        });
        
        request.on('error', (error) => {
          console.log(`   ❌ Request Error: ${error.message}`);
          reject(error);
        });
        
        request.setTimeout(45000, () => {
          request.destroy();
          reject(new Error('Request timeout (45s)'));
        });
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        ...website,
        status: 'error',
        error: error.message
      };
    }
  }

  async generateAllScreenshots() {
    console.log('🚀 Starting screenshot generation for all websites...');
    console.log(`📊 Total websites: ${ALL_WEBSITES.length}`);
    console.log(`🔑 Using API key: ${SCREENSHOT_CONFIG.ACCESS_KEY}`);
    console.log(`📁 Saving to: ${this.screenshotsDir}`);
    
    this.ensureDirectories();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const website of ALL_WEBSITES) {
      try {
        const result = await this.generateScreenshot(website);
        this.results.push(result);
        
        if (result.status === 'success') {
          successCount++;
        } else {
          errorCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        this.results.push({
          ...website,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
      
      // Small delay between requests to be respectful
      if (website.id < ALL_WEBSITES.length) {
        console.log('   ⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.generateReport(successCount, errorCount);
    return this.results;
  }

  generateReport(successCount, errorCount) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 SCREENSHOT GENERATION COMPLETE');
    console.log('='.repeat(70));
    
    console.log(`\n📈 Summary:`);
    console.log(`  • Total websites: ${ALL_WEBSITES.length}`);
    console.log(`  • Successful: ${successCount} (${Math.round(successCount/ALL_WEBSITES.length*100)}%)`);
    console.log(`  • Failed: ${errorCount} (${Math.round(errorCount/ALL_WEBSITES.length*100)}%)`);
    console.log(`  • API calls used: ${ALL_WEBSITES.length}/100 (free tier)`);
    
    if (successCount > 0) {
      console.log(`\n✅ Successfully generated screenshots:`);
      this.results
        .filter(r => r.status === 'success')
        .forEach(r => {
          console.log(`  • ${r.name} → ${r.filename} (${r.size}KB)`);
        });
    }
    
    if (errorCount > 0) {
      console.log(`\n❌ Failed screenshots:`);
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  • ${r.name} - ${r.error}`);
        });
    }
    
    console.log(`\n💡 Next steps:`);
    console.log(`  • Check screenshots in: ${this.screenshotsDir}`);
    console.log(`  • Update sites.ts to use local screenshots`);
    console.log(`  • Update SiteCard component to use new image paths`);
    console.log(`  • Test the application with real screenshots`);
  }
}

// Run the generator
if (require.main === module) {
  const generator = new ScreenshotGenerator();
  generator.generateAllScreenshots()
    .then(() => {
      console.log('\n✨ Screenshot generation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error);
      process.exit(1);
    });
}

module.exports = { ScreenshotGenerator, ALL_WEBSITES };
