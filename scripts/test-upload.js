import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting test script...');

// Supabase configuration
const SUPABASE_URL = "https://ttcapwgcfadajcoljuuk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Y2Fwd2djZmFkYWpjb2xqdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMDA3NzIsImV4cCI6MjA1Mzg3Njc3Mn0.htrkudTGkcjeUKcPHTjnmT_fkFWpE-YfChMRhtDlUpA";

console.log('📡 Initializing Supabase client...');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots');
console.log('📁 Screenshots directory:', SCREENSHOTS_DIR);

// Check if directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  console.error('❌ Screenshots directory not found:', SCREENSHOTS_DIR);
  process.exit(1);
}

// List files
const files = fs.readdirSync(SCREENSHOTS_DIR);
console.log('📋 Files found:', files.length);
files.forEach(file => console.log(`   • ${file}`));

console.log('✅ Test completed successfully!');
