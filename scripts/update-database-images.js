import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = "https://ttcapwgcfadajcoljuuk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Y2Fwd2djZmFkYWpjb2xqdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMDA3NzIsImV4cCI6MjA1Mzg3Njc3Mn0.htrkudTGkcjeUKcPHTjnmT_fkFWpE-YfChMRhtDlUpA";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load uploaded screenshot URLs
const urlsFilePath = path.join(__dirname, 'uploaded-screenshot-urls.json');
const screenshotUrls = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

// Mapping between screenshot filenames and site identifiers
const screenshotToSiteMapping = {
  'robot-kraft-africa.png': { name: 'Robot Kraft Africa', url: 'http://robotkraftafrica.com/' },
  'techware-innovation.png': { name: 'Techware Innovation', url: 'https://techwareinnovation.com/' },
  'gmets.png': { name: 'GMETS', url: 'http://gmets.com.ng/' },
  'cyber-guards.png': { name: 'Cyber Guards', url: 'https://cyberguards.ng/' },
  'digital-marketplace.png': { name: 'Note idea keeper', url: 'https://gorgeous-churros-97475e.netlify.app/' },
  'shop-self.png': { name: 'Online Shop', url: 'https://shop-self-five.vercel.app/' },
  'muahib-stores.png': { name: 'Muahib Stores', url: 'https://muahibstores.vercel.app/' },
  'binbaz.png': { name: 'Binbaz International Academy', url: 'https://binbaz.vercel.app/' },
  'jazzy-capybara.png': { name: 'Muahib Foods', url: 'https://jazzy-capybara-d1d994.netlify.app/' },
  'video-time-slicer.png': { name: 'WebinarMagic', url: 'https://video-time-slicer-magic.lovable.app/' },
  'diamond-bakes.png': { name: 'Diamond Elite Bites', url: 'https://diamondbakes.vercel.app/' },
  'muahib-academy.png': { name: 'Muahib Academy', url: 'https://muahibacademy.vercel.app/' },
  'agency-project-space.png': { name: 'Muahib Solution', url: 'https://agency-project-space.vercel.app/' },
  'bft-capital.png': { name: 'BFT Capitals', url: 'https://bftcapital.vercel.app/' },
  'mcan-lodge.png': { name: 'MCAN FCT', url: 'https://mcanlogde1.vercel.app/' },
  'arabic-cleaner.png': { name: 'Arabic Text Cleaner', url: 'https://arabic-cleaner-web-a91v.vercel.app/' },
  '1791-technology.png': { name: '1791 Technology Demo', url: 'https://test-1791technology.vercel.app/' },
  'watch-together.png': { name: 'Watch Together', url: 'https://watch-together-six.vercel.app/' },
  'movie-hangout.png': { name: 'Movie Hangout', url: 'https://movie-hangout.vercel.app/' },
  'smart-stock.png': { name: 'Smart Stock', url: 'https://smartstock-cyan.vercel.app/' },
  'portfolio.png': { name: 'Abdul Mumin Ibrahim Portfolio', url: 'https://potfolio-lilac-one.vercel.app/' },
  'muahib-solutions.png': { name: 'Muahib Solutions', url: 'https://muahibsolutions.vercel.app/' },
  'spiffy-torrone.png': { name: 'Sizzling Strokes', url: 'https://spiffy-torrone-e4452e.netlify.app/' },
  'stellular-youtiao.png': { name: 'Nonsolux Cleaning Services', url: 'https://stellular-youtiao-520eb6.netlify.app/' },
  'muahib-showcase-nexus.png': { name: 'Muahib Showcase Nexus', url: 'https://muahib-showcase-nexus.lovable.app' }
};

async function updateSiteImages() {
  try {
    console.log('🚀 Starting database update process...\n');

    // First, get all sites from the database
    const { data: sites, error: fetchError } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Found ${sites.length} sites in database\n`);

    const updates = [];
    const notFound = [];

    // Process each screenshot
    for (const [filename, screenshotUrl] of Object.entries(screenshotUrls)) {
      const mapping = screenshotToSiteMapping[filename];
      
      if (!mapping) {
        console.log(`⚠️  No mapping found for ${filename}`);
        notFound.push(filename);
        continue;
      }

      // Find the site in the database
      const site = sites.find(s => 
        s.name.toLowerCase().includes(mapping.name.toLowerCase()) ||
        s.url === mapping.url ||
        mapping.name.toLowerCase().includes(s.name.toLowerCase())
      );

      if (site) {
        updates.push({
          id: site.id,
          name: site.name,
          filename,
          screenshotUrl,
          currentImage: site.image
        });
        console.log(`✅ Mapped ${filename} → ${site.name}`);
      } else {
        console.log(`❌ No site found for ${filename} (${mapping.name})`);
        notFound.push(filename);
      }
    }

    console.log(`\n📊 Mapping Summary:`);
    console.log(`✅ Successfully mapped: ${updates.length}`);
    console.log(`❌ Not mapped: ${notFound.length}`);

    if (notFound.length > 0) {
      console.log(`\n⚠️  Unmapped screenshots:`);
      notFound.forEach(filename => console.log(`   • ${filename}`));
    }

    // Perform the updates
    if (updates.length > 0) {
      console.log(`\n🔄 Updating ${updates.length} site records...`);
      
      const updateResults = [];
      
      for (const update of updates) {
        try {
          const { data, error } = await supabase
            .from('sites')
            .update({ image: update.screenshotUrl })
            .eq('id', update.id)
            .select();

          if (error) {
            throw error;
          }

          updateResults.push({ ...update, success: true });
          console.log(`✅ Updated ${update.name}`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          updateResults.push({ ...update, success: false, error: error.message });
          console.log(`❌ Failed to update ${update.name}: ${error.message}`);
        }
      }

      // Final summary
      const successful = updateResults.filter(r => r.success).length;
      const failed = updateResults.filter(r => !r.success).length;

      console.log(`\n🎉 Update Summary:`);
      console.log(`✅ Successfully updated: ${successful}`);
      console.log(`❌ Failed updates: ${failed}`);

      if (failed > 0) {
        console.log(`\n❌ Failed updates:`);
        updateResults.filter(r => !r.success).forEach(r => {
          console.log(`   • ${r.name}: ${r.error}`);
        });
      }

      // Save update log
      const logPath = path.join(__dirname, 'database-update-log.json');
      fs.writeFileSync(logPath, JSON.stringify(updateResults, null, 2));
      console.log(`\n💾 Update log saved to: ${logPath}`);
    }

    console.log('\n✨ Database update process completed!');
    
  } catch (error) {
    console.error('💥 Database update failed:', error.message);
    process.exit(1);
  }
}

// Run the update process
updateSiteImages()
  .then(() => {
    console.log('\n🎊 All done! Your sites now have beautiful screenshots!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });
