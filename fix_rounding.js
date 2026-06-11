const fs = require('fs');
const file = 'app/dashboard/catalogo/configuracoes/ConfiguracoesClient.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/rounded-\[40px\]/g, 'rounded-2xl');
code = code.replace(/rounded-\[32px\]/g, 'rounded-2xl');
code = code.replace(/rounded-\[24px\]/g, 'rounded-xl');
code = code.replace(/rounded-\[20px\]/g, 'rounded-xl');
code = code.replace(/rounded-\[16px\]/g, 'rounded-lg');

fs.writeFileSync(file, code);
console.log('Fixed rounding patterns');
