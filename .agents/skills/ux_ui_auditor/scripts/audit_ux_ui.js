const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  'app/dashboard',
  'components/dashboard'
];

// Regras de substituição seguras
const REPLACEMENTS = [
  // 1. Substituir bg-white por bg-[var(--dash-surface)] quando for classe tailwind avulsa
  // Toma cuidado para não substituir quando já for parte de um gradiente (from-bg-white)
  {
    regex: /(?<![a-zA-Z0-9-])bg-white(?![a-zA-Z0-9-])/g,
    replace: 'bg-[var(--dash-surface)]',
    desc: "Substituindo bg-white por bg-[var(--dash-surface)]"
  },
  // 3. Substituir arredondamentos exagerados ou hardcoded (ex: rounded-[32px], rounded-2xl, rounded-3xl) para o padrão rounded-[27px]
  {
    regex: /(?<![a-zA-Z0-9-])(rounded-\[\d+px\]|rounded-2xl|rounded-3xl)(?![a-zA-Z0-9-])/g,
    replace: 'rounded-[27px]',
    desc: "Padronizando arredondamentos (2xl, 3xl e customizados) para a nova assinatura visual rounded-[27px]"
  },
  // 4. Garantir que as sessões estiquem até a margem do navegador (PanelLayout) e não fiquem centralizadas e pequenas
  {
    regex: /(?<![a-zA-Z0-9-])(w-full\s+)?max-w-[34567]xl\s+mx-auto(?![a-zA-Z0-9-])/g,
    replace: 'w-full',
    desc: "Removendo constrições de largura em páginas para garantir alinhamento com as margens laterais do navegador"
  },
  {
    regex: /(?<![a-zA-Z0-9-])mx-auto\s+(w-full\s+)?max-w-[34567]xl(?![a-zA-Z0-9-])/g,
    replace: 'w-full',
    desc: "Removendo constrições de largura em páginas para garantir alinhamento com as margens laterais do navegador"
  },
  // 2. Substituir text-black por text-[var(--dash-text-primary)]
  {
    regex: /(?<![a-zA-Z0-9-])text-black(?![a-zA-Z0-9-])/g,
    replace: 'text-[var(--dash-text-primary)]',
    desc: "Substituindo text-black por text-[var(--dash-text-primary)]"
  },
  // 5. Padronizar bordas de Stickers/Badges para rounded (4px)
  {
    regex: /(inline-flex[^"']*?)rounded(?:-[a-z0-9\[\]]+)?(?=[^"']*?(?:uppercase|tracking-[a-z]+|text-\[?\d*(?:px|xs|sm)\]?))/g,
    replace: '$1rounded',
    desc: "Padronizando stickers (inline-flex com texto pequeno) para rounded (4px)"
  },
  // 6. Converter todos os botões e inputs (rounded-xl) para o novo padrão (rounded-lg)
  {
    regex: /(?<![a-zA-Z0-9-])rounded-xl(?![a-zA-Z0-9-])/g,
    replace: 'rounded-lg',
    desc: "Padronizando botões e inputs (rounded-xl) para o novo padrão rounded-lg"
  },
  // 3. Remover rounded-none e rounded-sm e sugerir rounded-xl ou 2xl (neste script simples vamos forçar rounded-xl para caixas)
  // Como as bordas de card demandam rounded-2xl, mas não conseguimos distinguir contexto facilmente, 
  // vamos emitir warning para bordas quadradas.
];

// Procurar arquivos
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

console.log("==========================================");
console.log("🛡️  INICIANDO AUDITORIA UX/UI (PlataformaShop)");
console.log("==========================================\n");

let totalFilesChecked = 0;
let totalFixes = 0;
let warnings = [];

TARGET_DIRS.forEach(targetDir => {
  const fullPath = path.join(process.cwd(), targetDir);
  walkDir(fullPath, (filePath) => {
    totalFilesChecked++;
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    let localFixes = 0;

    // Aplica substituições
    REPLACEMENTS.forEach(rule => {
      if (rule.regex.test(content)) {
        let matches = content.match(rule.regex).length;
        content = content.replace(rule.regex, rule.replace);
        localFixes += matches;
      }
    });

    // Emite Warnings para outras quebras de padrão
    if (/(?<![a-zA-Z0-9-])rounded-none(?![a-zA-Z0-9-])/.test(content)) {
      warnings.push(`[AVISO] 'rounded-none' detectado em: ${filePath} - Use rounded-2xl ou rounded-xl`);
    }

    if (localFixes > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
      totalFixes += localFixes;
      console.log(`✅ [CORRIGIDO] ${localFixes} infração(ões) em: ${filePath}`);
    }
  });
});

console.log("\n==========================================");
console.log(`Relatório de Auditoria:`);
console.log(`- Arquivos verificados: ${totalFilesChecked}`);
console.log(`- Correções automáticas aplicadas: ${totalFixes}`);
console.log(`- Avisos pendentes: ${warnings.length}`);
console.log("==========================================\n");

if (warnings.length > 0) {
  console.log("🚨 AVISOS PARA CORREÇÃO MANUAL:");
  warnings.forEach(w => console.log(w));
}
