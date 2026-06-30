const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/catalogo/CatalogoClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports and remove types
const typesRegex = /type Spec = \{ id\?: string; chave: string; valor: string \};\s*const PRICE_INPUT_REGEX = \/^[0-9.,]*$\/;\s*const MAX_IMAGE_BYTES = 2 \* 1024 \* 1024;\s*type ProductRow = \{[\s\S]*?categories: any;\n\};/g;
content = content.replace(typesRegex, `const PRICE_INPUT_REGEX = /^[0-9.,]*$/;\n\nconst MAX_IMAGE_BYTES = 2 * 1024 * 1024;`);

const importsRegex = /import CategoryModal from "@\/components\/dashboard\/CategoryModal";/;
content = content.replace(importsRegex, `import CategoryModal from "@/components/dashboard/CategoryModal";\nimport CatalogHeader from "@/components/dashboard/CatalogHeader";\nimport CategoryCard from "@/components/dashboard/CategoryCard";\nimport ProductListItem, { ProductRow, Spec } from "@/components/dashboard/ProductListItem";`);

// 2. Replace Header
const headerStart = `{/* Header com Título e Limite */}`;
const headerEnd = `{!adminCatalogId ? (`;
const headerRegex = new RegExp(`\\{\\/\\* Header com Título e Limite \\*\\/\\}[\\s\\S]*?<\\/div>\\s*\\)\\}\\s*<\\/div>`, 'g');
content = content.replace(headerRegex, `      {/* Header com Título e Limite */}
      <CatalogHeader 
        adminCatalogId={adminCatalogId}
        catalog={catalog}
        catalogType={catalogType}
        setCatalogType={setCatalogType}
        catalogId={catalogId}
        productLimit={productLimit}
        productUsageCount={productUsageCount}
      />`);

// 3. Replace Category Card
const categoryCardRegex = /<div\s*key=\{cat\.id\}\s*className="group flex flex-col justify-between p-5 rounded-\[32px\] border transition-all hover:shadow-lg hover:border-primary\/30"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
content = content.replace(categoryCardRegex, `<CategoryCard 
                    key={cat.id}
                    cat={cat}
                    productCount={products.filter(p => getProductCategoryId(p) === cat.id).length}
                    onEdit={(cat) => {
                      setEditingCategory(cat);
                      setShowCategoryModal(true);
                    }}
                    onDelete={handleDeleteCategory}
                  />`);

// 4. Replace ProductListItem (first occurrence - Categorized)
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
console.log('Refactoring complete.');
