const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '../app/[slug]/page.tsx');
let content1 = fs.readFileSync(file1, 'utf8');

const replacements1 = [
  [/color: "#fff"/g, 'color: "var(--foreground)"'],
  [/color: "rgba\(255,255,255,0\.6\)"/g, 'color: "var(--dash-text-secondary)"'],
  [/color: "rgba\(255,255,255,0\.65\)"/g, 'color: "var(--dash-text-secondary)"'],
  [/background: "rgba\(255,255,255,0\.035\)"/g, 'background: "var(--dash-surface-secondary)"'],
  [/border: "1px solid rgba\(255,255,255,0\.08\)"/g, 'border: "1px solid var(--dash-border)"'],
  [/background: "rgba\(255,255,255,0\.05\)"/g, 'background: "var(--dash-hover-bg)"'],
  [/border: "1px solid rgba\(255,255,255,0\.09\)"/g, 'border: "1px solid var(--dash-border)"'],
  [/background: "rgba\(255,255,255,0\.03\)"/g, 'background: "var(--dash-surface-secondary)"'],
  [/border: "1px solid rgba\(255,255,255,0\.06\)"/g, 'border: "1px solid var(--dash-border)"'],
  [/borderRight:\s*"1px solid rgba\(255,255,255,0\.06\)"/g, 'borderRight: "1px solid var(--dash-border)"'],
  [/color: "rgba\(255,255,255,0\.28\)"/g, 'color: "var(--dash-text-muted)"'],
  [/color: "rgba\(255,255,255,0\.22\)"/g, 'color: "var(--dash-text-muted)"'],
  [/color: "rgba\(255,255,255,0\.9\)"/g, 'color: "var(--foreground)"'],
  [/color: "rgba\(255,255,255,0\.5\)"/g, 'color: "var(--dash-text-secondary)"'],
  [/boxShadow:\s*"0 40px 100px rgba\(0,0,0,0\.7\), inset 0 1px 0 rgba\(255,255,255,0\.06\)"/g, 'boxShadow: "var(--glass-shadow)"'],
  [/\.btn-catalog:hover \{\s*background: rgba\(255,255,255,0\.08\) !important;\s*transform: translateY\(-2px\);\s*box-shadow: 0 10px 25px rgba\(0,0,0,0\.5\), 0 0 15px rgba\(255,255,255,0\.03\);\s*border-color: rgba\(255,255,255,0\.15\) !important;\s*\}/g, '.btn-catalog:hover { background: var(--dash-hover-bg) !important; transform: translateY(-2px); box-shadow: var(--shadow-premium); border-color: var(--dash-border) !important; }'],
  [/\.stat-block:hover \{\s*background: rgba\(255,255,255,0\.06\) !important;\s*transform: scale\(1\.06\);\s*box-shadow: 0 0 30px rgba\(0,0,0,0\.5\);\s*z-index: 10;\s*border-radius: 12px;\s*\}/g, '.stat-block:hover { background: var(--dash-hover-bg) !important; transform: scale(1.06); box-shadow: var(--shadow-deep); z-index: 10; border-radius: 12px; }'],
  [/background: "#1c1c1c"/g, 'background: "var(--dash-surface)"'],
  [/border: "3px solid #0a0a0a"/g, 'border: "3px solid var(--background)"'],
  [/background: "rgba\(0,0,0,0\.75\)"/g, 'background: "var(--dash-surface)"'],
];

replacements1.forEach(([regex, replacement]) => {
  content1 = content1.replace(regex, replacement);
});

fs.writeFileSync(file1, content1);
console.log("Updated app/[slug]/page.tsx");

const file2 = path.join(__dirname, '../components/catalog/ProductCatalogClient.tsx');
let content2 = fs.readFileSync(file2, 'utf8');

const replacements2 = [
  [/bg-\[\#020617\]/g, 'bg-background'],
  [/text-slate-100/g, 'text-foreground'],
  [/glass-dark/g, 'glass'],
  [/text-white/g, 'text-foreground'],
  [/text-slate-400/g, 'text-[color:var(--dash-text-secondary)]'],
  [/text-slate-500/g, 'text-[color:var(--dash-text-muted)]'],
  [/text-slate-600/g, 'text-[color:var(--dash-text-muted)]'],
  [/bg-white\/5/g, 'bg-[var(--dash-surface-secondary)]'],
  [/bg-white\/10/g, 'bg-[var(--dash-hover-bg)]'],
  [/border-white\/5/g, 'border-[var(--dash-border)]'],
  [/border-white\/10/g, 'border-[var(--dash-border)]'],
  [/border-white\/20/g, 'border-[var(--dash-border)]'],
  [/bg-slate-800/g, 'bg-[var(--dash-surface)]'],
  [/bg-slate-900/g, 'bg-[var(--dash-surface)]'],
  [/bg-slate-950/g, 'bg-background'],
  [/bg-\[\#0f172a\]/g, 'bg-[var(--dash-surface)]'],
  [/bg-black\/50/g, 'bg-[var(--dash-surface-secondary)]'],
  [/bg-\[\#020617\]\/80/g, 'bg-background/80'],
  [/backdrop-blur-md/g, 'backdrop-blur-md'], // fine as is
  [/text-emerald-400/g, 'text-primary'],
  [/text-emerald-500/g, 'text-primary'],
  [/bg-emerald-500/g, 'bg-primary'],
  [/bg-emerald-400/g, 'bg-primary'],
  [/text-rose-500/g, 'text-red-500'],
  [/bg-rose-500\/10/g, 'bg-red-500/10'],
  [/border-rose-500\/20/g, 'border-red-500/20'],
  [/bg-emerald-500\/10/g, 'bg-primary/10'],
  [/border-emerald-500\/20/g, 'border-primary/20'],
  [/group-hover:bg-emerald-500/g, 'group-hover:bg-primary'],
];

replacements2.forEach(([regex, replacement]) => {
  content2 = content2.replace(regex, replacement);
});

fs.writeFileSync(file2, content2);
console.log("Updated ProductCatalogClient.tsx");

// Wait, ProductCatalogClient also needs PublicThemeToggle
const file3 = path.join(__dirname, '../app/[slug]/catalogo/page.tsx');
let content3 = fs.readFileSync(file3, 'utf8');

if (!content3.includes('PublicThemeToggle')) {
  content3 = content3.replace('import ProductCatalogClient', 'import PublicThemeToggle from "@/components/PublicThemeToggle";\nimport ProductCatalogClient');
  content3 = content3.replace('<ProductCatalogClient', '<>\n      <PublicThemeToggle />\n      <ProductCatalogClient');
  content3 = content3.replace('whatsapp={profile?.whatsapp || null}\n    />', 'whatsapp={profile?.whatsapp || null}\n    />\n    </>');
  fs.writeFileSync(file3, content3);
  console.log("Updated app/[slug]/catalogo/page.tsx");
}
