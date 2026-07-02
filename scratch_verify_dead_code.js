const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const deadDirs = [
  'admin', 'p', 'auth', 'cadastro', 'entrar', 
  'onboarding', 'recuperar-senha', 'reset-senha', 'plataformacard'
];

const activeDirs = ['app', 'components', 'lib', 'scripts'];

console.log("Checking if dead directories are imported anywhere...");

let hasReferences = false;

for (const deadDir of deadDirs) {
  try {
    // Check if there are any occurrences of the directory name being imported 
    // Example: from "@/admin/" or from "../admin/"
    // Using a fast grep. We search inside active directories for any string like `deadDir/`
    const result = execSync(`grep -rn -E "['\\"\/]${deadDir}/|['\\"]${deadDir}['\\"]" ${activeDirs.join(' ')} || true`).toString().trim();
    
    if (result) {
      console.log(`⚠️ Possible reference to /${deadDir} found:`);
      const lines = result.split('\n').slice(0, 3); // show first 3
      console.log(lines.join('\n'));
      hasReferences = true;
    } else {
      console.log(`✅ No references found for /${deadDir}`);
    }
  } catch (err) {
    // grep returns exit code 1 if nothing found, which we handle with `|| true`
    console.log(`✅ No references found for /${deadDir}`);
  }
}

console.log("\nVerdict: " + (hasReferences ? "Manual review required" : "Safe to delete"));
