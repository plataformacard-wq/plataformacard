const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/catalogo/CatalogoClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace ProductListItem (matches both categorized and uncategorized)
// Note: we use non-greedy [\s\S]*? and stop right before </Reorder.Item>
const productListItemRegex = /<Reorder\.Item\s*key=\{product\.id\}\s*value=\{product\}[\s\S]*?<\/Reorder\.Item>/g;
content = content.replace(productListItemRegex, `<ProductListItem 
                            key={product.id}
                            product={product}
                            getProductImage={getProductImage}
                            formatPrice={formatPrice}
                            toggleProductStatus={toggleProductStatus}
                            handleOpenEdit={handleOpenEdit}
                            handleDuplicateProduct={handleDuplicateProduct}
                            handleDelete={handleDelete}
                            userSlug={userSlug}
                            adminCatalogId={adminCatalogId}
                            catalogId={catalogId}
                            allowCaasDetachment={allowCaasDetachment}
                          />`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('ProductListItem refactoring complete.');
