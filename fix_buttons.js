const fs = require('fs');
const file = 'app/dashboard/catalogo/configuracoes/ConfiguracoesClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// The "Visualizar Preview" and "Copiar Código" buttons:
code = code.replace(/className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-white rounded-2xl/g, 'className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-white rounded-xl');
code = code.replace(/px-6 py-3 rounded-2xl text-\[10px\] font-black uppercase/g, 'px-6 py-3 rounded-xl text-[10px] font-black uppercase');
code = code.replace(/px-6 py-3 rounded-2xl bg-white text-black font-black text-sm/g, 'px-6 py-3 rounded-xl bg-white text-black font-black text-sm');

// Also the edit banner buttons:
code = code.replace(/rounded-2xl px-5 py-3 text-sm font-bold/g, 'rounded-xl px-5 py-3 text-sm font-bold');

fs.writeFileSync(file, code);
