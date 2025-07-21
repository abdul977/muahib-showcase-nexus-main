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

// Screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots');
const BUCKET_NAME = 'screenshots';

async function uploadScreenshot(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true // This will overwrite if file already exists
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully uploaded ${fileName}`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function getPublicUrl(fileName) {
  try {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  } catch (error) {
    console.error(`❌ Failed to get public URL for ${fileName}:`, error.message);
    return null;
  }
}

async function uploadAllScreenshots() {
  try {
    console.log('🚀 Starting screenshot upload process...\n');
    
    // Check if screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      throw new Error(`Screenshots directory not found: ${SCREENSHOTS_DIR}`);
    }

    // Get all PNG files from screenshots directory
    const files = fs.readdirSync(SCREENSHOTS_DIR)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No PNG files found in screenshots directory');
      return;
    }

    console.log(`📁 Found ${files.length} screenshot files to upload:\n`);
    files.forEach(file => console.log(`   • ${file}`));
    console.log('');

    const results = [];
    const uploadedUrls = {};

    // Upload each file
    for (const file of files) {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const result = await uploadScreenshot(filePath, file);
      results.push({ file, ...result });

      if (result.success) {
        const publicUrl = await getPublicUrl(file);
        if (publicUrl) {
          uploadedUrls[file] = publicUrl;
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successful uploads: ${successful}`);
    console.log(`❌ Failed uploads: ${failed}`);

    if (successful > 0) {
      console.log('\n🔗 Public URLs generated:');
      Object.entries(uploadedUrls).forEach(([file, url]) => {
        console.log(`   • ${file}: ${url}`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ Failed uploads:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   • ${r.file}: ${r.error}`);
      });
    }

    // Save URLs to a JSON file for later use
    const urlsFilePath = path.join(__dirname, 'uploaded-screenshot-urls.json');
    fs.writeFileSync(urlsFilePath, JSON.stringify(uploadedUrls, null, 2));
    console.log(`\n💾 Screenshot URLs saved to: ${urlsFilePath}`);

    console.log('\n🎉 Screenshot upload process completed!');
    
    return uploadedUrls;

  } catch (error) {
    console.error('💥 Upload process failed:', error.message);
    process.exit(1);
  }
}

// Run the upload process
uploadAllScreenshots()
  .then(() => {
    console.log('\n✨ All done! You can now update the database with these URLs.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });

export { uploadAllScreenshots, getPublicUrl };
