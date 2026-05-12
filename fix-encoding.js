import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'usta_db.sqlite');
const db = new sqlite3.Database(dbPath);

// Check what's in database now
db.get('SELECT name, nameRu FROM categories WHERE id = 1', [], (err, row) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  if (row) {
    console.log('Current in database:');
    console.log('name:', row.name);
    console.log('nameRu:', row.nameRu);

    const buf = Buffer.from(row.name, 'utf8');
    console.log('Hex:', buf.toString('hex'));
    console.log('Bytes:', Array.from(buf));
  }

  db.close();
});
