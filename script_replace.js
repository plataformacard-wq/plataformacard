const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Start', 'plataformacard', 'app', 'dashboard', 'catalogo', 'CatalogoClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Import CatalogProductItem
lines.splice(42, 0, 'import CatalogProductItem from "@/components/dashboard/catalogo/CatalogProductItem";');

// Reconstruct file
content = lines.join('\n');

// Chunk 1 replacement:
const replacementChunk = `                          <CatalogProductItem
                            key={product.id}
                            product={product}
                            handleOpenEdit={handleOpenEdit}
                            getProductImage={getProductImage}
                            formatPrice={formatPrice}
                            toggleProductStatus={toggleProductStatus}
                            userSlug={userSlug}
                            adminCatalogId={adminCatalogId}
                            catalogId={catalogId}
                            allowCaasDetachment={allowCaasDetachment}
                            handleDuplicateProduct={handleDuplicateProduct}
                            handleDelete={handleDelete}
                          />`;

// Replace first block (from <Reorder.Item to </Reorder.Item>)
let count = 0;
content = content.replace(/<Reorder\.Item[\s\S]*?<\/Reorder\.Item>/g, () => {
    count++;
    return replacementChunk;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Replaced ${count} Reorder.Item blocks.`);
