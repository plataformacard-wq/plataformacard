const fs = require('fs');
const path = require('path');
const file = fs.readFileSync(path.join(__dirname, '../app/dashboard/catalogo/CatalogoClient.tsx'), 'utf8');

const lines = file.split('\n');

const headerStart = lines.findIndex(l => l.includes('{/* Header com Título e Limite */}'));
const headerEnd = lines.findIndex(l => l.includes('{/* Categorias Section */}')) - 3;

const categoryStart = lines.findIndex(l => l.includes('categories.filter(c => c.catalog_id === catalogId).map((cat, idx) => ('));
const categoryEnd = lines.findIndex((l, i) => i > categoryStart && l.includes('))'));

const productStart = lines.findIndex(l => l.includes('{category.products.map((product) => ('));
const productEnd = lines.findIndex((l, i) => i > productStart && l.includes('</Reorder.Group>')) - 1;

console.log(`Header: ${headerStart} to ${headerEnd}`);
console.log(`Category: ${categoryStart} to ${categoryEnd}`);
console.log(`Product: ${productStart} to ${productEnd}`);
