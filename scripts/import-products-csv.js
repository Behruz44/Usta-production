import { sequelize, Product, Category } from '../models/index.js';
import fs from 'fs';
import path from 'path';

const importProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Read CSV file
    const csvFile = fs.readFileSync(path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'products_v2.csv'), 'utf-8');

    // Parse CSV
    const lines = csvFile.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    console.log(`Found ${lines.length - 1} products to import`);

    // Get or create categories
    const categories = {};
    const categoryMappings = {
      'AlinEX': 'Сухие смеси',
      'Наши': 'Сухие смеси',
      'Alina Paint': 'Краски',
      'Norma': 'Сухие смеси'
    };

    const allCategories = [
      { name: 'Гипсокартон', nameRu: 'Гипсокартон', nameKg: 'Гипсокартон', desc: 'Листовые материалы для стен и перегородок' },
      { name: 'Сухие смеси', nameRu: 'Сухие смеси', nameKg: 'Сухие смеси', desc: 'Штукатурки, шпатлевки и кладочные смеси' },
      { name: 'Краски', nameRu: 'Краски', nameKg: 'Краски', desc: 'Краски и лакокрасочные материалы' },
      { name: 'Саморезы', nameRu: 'Саморезы', nameKg: 'Саморезы', desc: 'Крепежные изделия различных размеров' },
      { name: 'Профиль', nameRu: 'Профиль', nameKg: 'Профиль', desc: 'Металлические профили для каркасов' },
      { name: 'Инструменты', nameRu: 'Инструменты', nameKg: 'Аспаптарлар', desc: 'Электроинструменты и ручной инструмент' }
    ];

    for (const cat of allCategories) {
      let existing = await Category.findOne({ where: { name: cat.name } });
      if (!existing) {
        existing = await Category.create(cat);
      }
      categories[cat.name] = existing;
    }
    console.log('Categories loaded:', Object.keys(categories));

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const productData = {};

      headers.forEach((header, index) => {
        productData[header.trim()] = values[index] ? values[index].trim() : '';
      });

      // Map to Product model
      const categoryName = categoryMappings[productData.brand] || 'Сухие смеси';
      const categoryObj = categories[categoryName] || categories['Сухие смеси'];

      const product = {
        name: productData.title,
        nameRu: productData.title,
        nameKg: productData.title,
        desc: productData.description || `${productData.brand}, ${productData.weight}`,
        descRu: productData.description || `${productData.brand}, ${productData.weight}`,
        descKg: productData.description || `${productData.brand}, ${productData.weight}`,
        categoryId: categoryObj.id,
        price: parseFloat(productData.price),
        sku: productData.sku,
        stock: 100,
        unit: 'шт',
        specs: {
          brand: productData.brand,
          weight: productData.weight,
          currency: productData.currency
        },
        images: JSON.stringify([`/uploads/${productData.image}`]),
        badge: null,
        isActive: true,
        views: 0
      };

      // Check if product already exists and update it
      const existing = await Product.findOne({ where: { sku: product.sku } });
      if (existing) {
        await existing.update(product);
        console.log(`Updated existing product: ${product.name}`);
        skipped++;
      } else {
        await Product.create(product);
        console.log(`Imported: ${product.name}`);
        imported++;
      }
    }

    console.log(`\nImport complete: ${imported} imported, ${skipped} skipped`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing products:', error);
    process.exit(1);
  }
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

importProducts();
