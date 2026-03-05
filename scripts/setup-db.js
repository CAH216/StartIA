/**
 * StratIA — Création automatique des tables Supabase
 * ─────────────────────────────────────────────────
 * Prérequis (une seule fois) :
 *   1. Va sur https://supabase.com/dashboard/account/tokens
 *   2. Génère un Personal Access Token
 *   3. Ajoute dans .env.local :  SUPABASE_ACCESS_TOKEN=sbp_xxxxx
 * Puis lance : node scripts/setup-db.js
 */

const path  = require('path');
const fs    = require('fs');
const https = require('https');

// ── Chargement .env.local ──────────────────────────────────────
const envPath    = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env        = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const [key, ...rest] = t.split('=');
  if (key) env[key.trim()] = rest.join('=').trim();
}

const ACCESS_TOKEN  = env['SUPABASE_ACCESS_TOKEN'];
const PROJECT_URL   = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const PROJECT_REF   = PROJECT_URL.replace('https://', '').split('.')[0];

if (!ACCESS_TOKEN) {
  console.error('\n❌  SUPABASE_ACCESS_TOKEN manquant dans .env.local');
  console.error('   → Va sur https://supabase.com/dashboard/account/tokens');
  console.error('   → Crée un token et ajoute : SUPABASE_ACCESS_TOKEN=sbp_xxxxx\n');
  process.exit(1);
}

const SCHEMA_PATH = path.join(__dirname, '..', 'supabase', 'schema.sql');
const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');

// ── HTTP helper ────────────────────────────────────────────────
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Main ───────────────────────────────────────────────────────
async function run() {
  console.log(`\n🔌  Connexion à Supabase (projet: ${PROJECT_REF})...`);

  const body    = JSON.stringify({ query: sql });
  const options = {
    hostname: 'api.supabase.com',
    path:     `/v1/projects/${PROJECT_REF}/database/query`,
    method:   'POST',
    headers:  {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  try {
    const res = await request(options, body);

    if (res.status === 200 || res.status === 201) {
      console.log('✅  Toutes les tables créées avec succès !\n');
      console.log('🎉  Setup terminé. Tu peux lancer npm run dev !\n');
    } else if (res.status === 401) {
      console.error('\n❌  Token invalide ou expiré.');
      console.error('   → Régénère un token sur https://supabase.com/dashboard/account/tokens\n');
    } else {
      const detail = typeof res.body === 'object'
        ? (res.body.message || res.body.error || JSON.stringify(res.body))
        : res.body;

      if (String(detail).includes('already exists')) {
        console.log('ℹ️   Tables déjà existantes — rien n\'a été écrasé.\n');
        console.log('🎉  Setup terminé !\n');
      } else {
        console.error(`\n❌  Erreur (HTTP ${res.status}) :`, detail, '\n');
      }
    }
  } catch (err) {
    console.error('\n❌  Erreur réseau :', err.message, '\n');
  }
}

run();

