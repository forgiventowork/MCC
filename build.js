// build.js - Mengompilasi js/app.jsx ke js/app.js menggunakan Babel
import https from 'https';
import fs from 'fs';
import vm from 'vm';

function fetchText(urlStr) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, { agent: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).href;
        return fetchText(nextUrl).then(resolve, reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function build() {
  console.log('Mengompilasi js/app.jsx ke js/app.js...');
  const babelCode = await fetchText('https://unpkg.com/@babel/standalone/babel.min.js');
  const sandbox = { window: {}, console: console };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(babelCode, sandbox);
  const Babel = sandbox.Babel;

  const appSource = fs.readFileSync('js/app.jsx', 'utf8');
  const compiled = Babel.transform(appSource, {
    presets: [['react', { runtime: 'classic' }]]
  }).code;

  fs.writeFileSync('js/app.js', compiled);
  console.log('✅ Berhasil dikompilasi! js/app.js siap dijalankan langsung di browser.');
  process.exit(0);
}

build().catch(err => {
  console.error('❌ Gagal kompilasi:', err);
  process.exit(1);
});
