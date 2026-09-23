import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { getCardImageUrl, getCardHouses } from '../src/cards/card-image-utils.js';
import type { Card } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CARD_IMAGE_BASEURL = process.env.VITE_CARD_IMAGE_BASEURL || 'https://keyforge-card-images.s3-us-west-2.amazonaws.com/';
const CARD_DB_PATH = path.join(__dirname, '../public/card-db.sqlite');

type TestResult = {
  success: boolean;
  statusCode?: number;
  error?: string;
  corsIssue?: boolean;
};

type BrokenImage = {
  title: string;
  slug: string;
  house: string;
  url: string;
  error: string;
};

// Test if an image URL is accessible
function testImageUrl(url: string): Promise<TestResult> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      method: 'HEAD',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Origin': 'https://brainforge.camza.ch',
        'Referer': 'https://brainforge.camza.ch/',
        'User-Agent': 'Mozilla/5.0 (compatible; BrainForge-ImageTest/1.0)',
      },
    };
    
    const request = protocol.request(options, (response) => {
      // Consider 200-299 as success
      const success = response.statusCode !== undefined && response.statusCode >= 200 && response.statusCode < 300;
      
      // Check for CORS headers
      const corsHeader = response.headers['access-control-allow-origin'];
      const hasCors = corsHeader === '*' || corsHeader === 'https://brainforge.camza.ch' || corsHeader === 'https://camza.ch';
      
      // Consume response data to free up memory
      response.resume();
      
      resolve({
        success,
        statusCode: response.statusCode,
        corsIssue: success && !hasCors,
      });
    });
    
    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });
    
    // Set timeout
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({
        success: false,
        error: 'Timeout',
      });
    });
    
    request.end();
  });
}

import { ID_TO_EXPANSION, ID_TO_HOUSE, type Expansion, type House } from '../src/constants.js';

type CardRow = {
  title: string;
  slug: string;
  type: Card['type'];
  amber: number;
  power: number | null;
  armor: number | null;
}

type PrintingRow = {
  expansion_id: number;
  house_id: number;
  card_slug: string;
}

// Load all cards from the built card database
function loadAllCards(): Card[] {
  const db = new Database(CARD_DB_PATH);
  const cardRows = db.prepare('SELECT title, slug, type, amber, power, armor FROM cards').all() as CardRow[];
  const printingRows = db.prepare('SELECT expansion_id, house_id, card_slug FROM card_printings').all() as PrintingRow[];
  db.close();

  const printingsByCard = new Map<string, { expansion: Expansion; house: House }[]>();
  for (const p of printingRows) {
    const exp = ID_TO_EXPANSION[p.expansion_id];
    const h = ID_TO_HOUSE[p.house_id];
    if (!exp || !h) continue;

    if (!printingsByCard.has(p.card_slug)) {
      printingsByCard.set(p.card_slug, []);
    }
    printingsByCard.get(p.card_slug)!.push({ expansion: exp, house: h });
  }

  return cardRows.map((card) => {
    const printings = printingsByCard.get(card.slug) || [];
    const expMap = new Map<Expansion, Set<House>>();
    for (const p of printings) {
      if (!expMap.has(p.expansion)) expMap.set(p.expansion, new Set());
      expMap.get(p.expansion)!.add(p.house);
    }
    const expansions = Array.from(expMap.keys());
    let houseValue: Card['house'];
    if (expansions.length === 1) {
      const houses = Array.from(expMap.get(expansions[0])!);
      houseValue = houses.length === 1 ? houses[0] : houses;
    } else {
      const houseMap: Partial<Record<Expansion, House | House[]>> = {};
      for (const [e, hs] of expMap.entries()) {
        const arr = Array.from(hs);
        houseMap[e] = arr.length === 1 ? arr[0] : arr;
      }
      houseValue = houseMap;
    }

    return {
      title: card.title,
      slug: card.slug,
      type: card.type,
      amber: card.amber,
      power: card.power ?? undefined,
      armor: card.armor ?? undefined,
      house: houseValue,
      expansions,
    };
  });
}

// Main test function
async function testAllCardImages() {
  console.log('Loading cards from pack files...');
  const cards = loadAllCards();
  console.log(`Found ${cards.length} cards\n`);
  
  console.log('Testing card images...');
  console.log(`Base URL: ${CARD_IMAGE_BASEURL}\n`);
  
  const brokenImages: BrokenImage[] = [];
  let tested = 0;
  
  // Build list of all URLs to test
  type TestItem = {
    card: Card;
    house: string;
    url: string;
  };
  
  const testItems: TestItem[] = [];
  for (const card of cards) {
    const houses = getCardHouses(card);
    for (const house of houses) {
      const url = getCardImageUrl(card.slug, house, CARD_IMAGE_BASEURL);
      testItems.push({ card, house, url });
    }
  }
  
  const totalTests = testItems.length;
  console.log(`Total images to test: ${totalTests}\n`);
  
  // Process in batches of 25
  const BATCH_SIZE = 25;
  
  for (let i = 0; i < testItems.length; i += BATCH_SIZE) {
    const batch = testItems.slice(i, i + BATCH_SIZE);
    
    // Test all URLs in this batch concurrently
    const results = await Promise.all(
      batch.map(async (item) => {
        const result = await testImageUrl(item.url);
        return { item, result };
      })
    );
    
    // Process results
    for (const { item, result } of results) {
      tested++;
      
      if (!result.success) {
        brokenImages.push({
          title: item.card.title,
          slug: item.card.slug,
          house: item.house,
          url: item.url,
          error: result.error || `HTTP ${result.statusCode}`,
        });
      } else if (result.corsIssue) {
        brokenImages.push({
          title: item.card.title,
          slug: item.card.slug,
          house: item.house,
          url: item.url,
          error: 'CORS issue - missing or invalid Access-Control-Allow-Origin header',
        });
      }
    }
    
    // Progress indicator
    process.stdout.write(`\rProgress: ${tested}/${totalTests} images tested...`);
  }
  
  console.log(`\rProgress: ${tested} images tested... Done!\n`);
  
  // Print results
  console.log('='.repeat(80));
  console.log('TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Total images tested: ${tested}`);
  console.log(`✅ Successful: ${tested - brokenImages.length}`);
  console.log(`❌ Broken: ${brokenImages.length}`);
  console.log('='.repeat(80));
  
  if (brokenImages.length > 0) {
    console.log('\n❌ BROKEN IMAGES:\n');
    
    for (const broken of brokenImages) {
      console.log(`Card: ${broken.title}`);
      console.log(`  Slug: ${broken.slug}`);
      console.log(`  House: ${broken.house}`);
      console.log(`  URL: ${broken.url}`);
      console.log(`  Error: ${broken.error}`);
      console.log('');
    }
    
    // Write broken images to a file
    const outputPath = path.join(__dirname, '../broken-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(brokenImages, null, 2));
    console.log(`\nBroken images list saved to: ${outputPath}`);
  } else {
    console.log('\n✅ All card images loaded successfully!');
  }
}

// Run the test
testAllCardImages().catch((error) => {
  console.error('Error running test:', error);
  process.exit(1);
});
