import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../../frontend/public');
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:dk%40sql@localhost:5432/butterfly_ecommerce?schema=public';

const pool = new pg.Pool({ connectionString: databaseUrl });

function getBase64DataUrl(filename) {
  const cleanName = filename.startsWith('/') ? filename.slice(1) : filename;
  const filePath = path.join(publicDir, cleanName);

  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(cleanName).toLowerCase().replace('.', '');
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fileBuffer.toString('base64')}`;
}

async function run() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    console.log('Fetching products from database...');
    const res = await client.query('SELECT id, model, name, image, images FROM products');
    console.log(`Found ${res.rows.length} products in database.`);

    let updatedCount = 0;

    for (const prod of res.rows) {
      let mainImageBase64 = prod.image;
      if (prod.image && prod.image.startsWith('/')) {
        const base64 = getBase64DataUrl(prod.image);
        if (base64) {
          mainImageBase64 = base64;
        }
      }

      let updatedImages = [];
      if (Array.isArray(prod.images)) {
        for (const img of prod.images) {
          if (img && img.startsWith('/')) {
            const b64 = getBase64DataUrl(img);
            updatedImages.push(b64 || img);
          } else {
            updatedImages.push(img);
          }
        }
      } else if (mainImageBase64) {
        updatedImages = [mainImageBase64];
      }

      await client.query(
        'UPDATE products SET image = $1, images = $2, "updatedAt" = NOW() WHERE id = $3',
        [mainImageBase64, updatedImages, prod.id]
      );
      updatedCount++;
      console.log(`Updated product [${prod.model}] with stored database image (${Math.round((mainImageBase64?.length || 0)/1024)} KB)`);
    }

    console.log(`\nSuccessfully stored images in DB for all ${updatedCount} products!`);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
