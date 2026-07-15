const chokidar = require('chokidar');
const notifier = require('node-notifier');
const fs = require('fs');
const path = require('path');

const LINE_LIMIT = 500;
const WATCH_PATHS = [
  path.join(__dirname, '../components/**/*.tsx'),
  path.join(__dirname, '../app/**/*.tsx'),
  path.join(__dirname, '../components/**/*.jsx'),
  path.join(__dirname, '../app/**/*.jsx'),
];

console.log(`\x1b[36m[Anti-Monolith Watcher]\x1b[0m Iniciado! Observando arquivos grandes (> ${LINE_LIMIT} linhas)...`);

const watcher = chokidar.watch(WATCH_PATHS, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lineCount = content.split('\n').length;

    if (lineCount > LINE_LIMIT) {
      const fileName = path.basename(filePath);
      
      // Alerta no terminal
      console.log(`\n\x1b[41m\x1b[37m ALERTA DE MONOLITO \x1b[0m`);
      console.log(`\x1b[31mO arquivo \x1b[1m${fileName}\x1b[0m\x1b[31m ultrapassou o limite estabelecido!\x1b[0m`);
      console.log(`Linhas atuais: \x1b[1m${lineCount}\x1b[0m / Limite: ${LINE_LIMIT}`);
      console.log(`Caminho: ${filePath}\n`);

      // Notificação nativa no OS (Mac/Windows)
      notifier.notify({
        title: '⚠️ Alerta de Monolito!',
        message: `O arquivo ${fileName} atingiu ${lineCount} linhas. Considere refatorar usando UI-as-a-Service.`,
        sound: true, // Avisa com som
        wait: false
      });
    }
  } catch (error) {
    console.error(`\x1b[31m[Anti-Monolith Watcher] Erro ao ler arquivo ${filePath}:\x1b[0m`, error);
  }
}

// Escuta os eventos de salvamento de arquivos e de criação
watcher
  .on('add', filePath => checkFile(filePath))
  .on('change', filePath => checkFile(filePath));
