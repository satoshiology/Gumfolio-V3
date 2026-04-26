const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// remove startServer wrapper
code = code.replace(/async function startServer\(\) \{/, 'export const app = express();\nexport async function setupApp() {');

// change app initialization
code = code.replace(/  const app = express\(\);/, '');

// remove vite middleware and listen
code = code.replace(/\/\/ Vite middleware for development[\s\S]*$/, '}\n');

fs.writeFileSync('expressApp.ts', code);
