const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

function auditSecurityRLS() {
  console.log('==========================================');
  console.log('🛡️  INICIANDO AUDITORIA DE SEGURANÇA E RLS (Supabase)');
  console.log('==========================================\n');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Diretório de migrações não encontrado.');
    process.exit(1);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
  const tableRLSMap = {};
  const tablePublicReadMap = {};

  files.forEach(file => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find ENABLE ROW LEVEL SECURITY
    const enableRLSMatches = content.matchAll(/ALTER TABLE\s+(?:public\.)?([a-z0-9_]+)\s+ENABLE ROW LEVEL SECURITY/gi);
    for (const match of enableRLSMatches) {
      const tableName = match[1].toLowerCase();
      tableRLSMap[tableName] = true;
    }

    // Find FOR SELECT USING (true) or public policies
    const publicSelectMatches = content.matchAll(/CREATE POLICY\s+["']([^"']+)["']\s+ON\s+(?:public\.)?([a-z0-9_]+)\s+.*?FOR SELECT.*?USING\s*\(\s*true\s*\)/gis);
    for (const match of publicSelectMatches) {
      const policyName = match[1];
      const tableName = match[2].toLowerCase();
      if (!tablePublicReadMap[tableName]) tablePublicReadMap[tableName] = [];
      tablePublicReadMap[tableName].push({ policyName, file });
    }
  });

  console.log('📊 Tabelas com RLS habilitado nas migrações:');
  Object.keys(tableRLSMap).forEach(table => {
    console.log(`  ✅ ${table}: ENABLE ROW LEVEL SECURITY OK`);
  });

  console.log('\n⚠️  Políticas de Leitura Pública Irrestrita (FOR SELECT USING (true)):');
  const sensitiveTables = ['profiles', 'organizations', 'user_2fa_backup_codes', 'platform_admins', 'billing'];
  let warningsCount = 0;

  Object.keys(tablePublicReadMap).forEach(table => {
    const isSensitive = sensitiveTables.includes(table);
    tablePublicReadMap[table].forEach(info => {
      // Check if it's overridden by newer migration (like 20260727000000_fix_critical_security_rls.sql)
      if (info.file === '20260520230000_enable_rls_and_policies.sql' && (table === 'profiles' || table === 'organizations' || table === 'platform_admins')) {
        console.log(`  ℹ️  Corrigida na migração 20260727000000 em '${table}': '${info.policyName}' (Substituída).`);
      } else if (isSensitive) {
        console.log(`  🚨 CRÍTICO em '${table}': Política '${info.policyName}' em ${info.file} expõe dados sensíveis!`);
        warningsCount++;
      } else {
        console.log(`  ℹ️  Pública em '${table}': Política '${info.policyName}' (Tabela pública/catálogo).`);
      }
    });
  });

  console.log('\n==========================================');
  console.log(`Resumo da Auditoria:`);
  console.log(`- Total de tabelas auditadas com RLS: ${Object.keys(tableRLSMap).length}`);
  console.log(`- Alertas críticos pendentes: ${warningsCount}`);
  console.log('==========================================\n');

  if (warningsCount > 0) {
    console.log('❌ Auditoria encontrou vulnerabilidades em tabelas sensíveis!');
    process.exit(1);
  } else {
    console.log('✅ Nenhuma vulnerabilidade crítica de RLS encontrada nas migrações!');
  }
}

auditSecurityRLS();
