import { sequelize, Product, Category } from '../models/index.js';
import fs from 'fs';
import path from 'path';

const importProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Read SQL file
    const sqlFile = fs.readFileSync(path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'products_v2.sql'), 'utf-8');
    
    // Parse SQL INSERT statements
    const insertRegex = /INSERT INTO products \(([^)]+)\) VALUES \(([^)]+)\);/g;
    const matches = [...sqlFile.matchAll(insertRegex)];
    
    const fields = matches[0][1].split(', ').map(f => f.trim());
    console.log(`Found ${matches.length} products to import`);
    
    // Get category for "Сухие смеси" (should be id: 2)
    const category = await Category.findOne({ where: { name: 'Сухие смеси' } });
    if (!category) {
      throw new Error('Category "Сухие смеси" not found');
    }
    console.log(`Using category: ${category.name} (id: ${category.id})`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const match of matches) {
      const values = match[2].split(', ').map(v => v.trim().replace(/^'|'$/g, ''));
      const productData = {};
      
      fields.forEach((field, index) => {
        productData[field] = values[index];
      });
      
      // Map to Product model
      const product = {
        name: productData.title,
        nameRu: productData.title,
        nameKg: productData.title,
        desc: `${productData.brand}, ${productData.weight}`,
        descRu: `${productData.brand}, ${productData.weight}`,
        descKg: `${productData.brand}, ${productData.weight}`,
        categoryId: category.id,
        price: parseFloat(productData.price),
        sku: productData.sku,
        stock: 100, // Default stock
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
      
      // Check if product already exists
      const existing = await Product.findOne({ where: { sku: product.sku } });
      if (existing) {
        console.log(`Skipping existing product: ${product.name}`);
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

importProducts();
