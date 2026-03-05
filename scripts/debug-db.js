// scripts/debug-db.js
const fs   = require('fs');
const path = require('path');
const { Client } = require('pg');

// Parse .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  let val = t.slice(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[t.slice(0, eq).trim()] = val;
}

const hide = url => url ? url.replace(/:([^:@\s?]+)@/, ':*****@') : 'MANQUANT';

console.log('\n=== VARIABLES LUES DEPUIS .env.local ===');
console.log('DATABASE_URL :', hide(env.DATABASE_URL));
console.log('DIRECT_URL   :', hide(env.DIRECT_URL));

// Test connexion avec l'URL telle quelle
async function testUrl(label, url) {
  if (!url) { console.log(`\n❌ ${label} : URL manquante`); return; }
  console.log(`\n--- Test: ${label} ---`);
  console.log('URL (masquée):', hide(url));
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const r = await c.query('SELECT current_database() as db, current_user as u, version() as v');
    console.log(`✅ Connecté! DB=${r.rows[0].db}, User=${r.rows[0].u}`);
    // Tester qu'on peut créer une table (nécessaire pour db push)
    await c.query('CREATE TABLE IF NOT EXISTS _debug_test (id int); DROP TABLE _debug_test;');
    console.log('✅ CREATE/DROP TABLE : OK (db push fonctionnera)');
    await c.end();
  } catch (e) {
    console.log(`❌ Erreur: ${e.message}`);
  }
}

(async () => {
  await testUrl('DATABASE_URL (pooler pgbouncer)', env.DATABASE_URL);
  await testUrl('DIRECT_URL (migrations)', env.DIRECT_URL);

  // Test aussi avec le mot de passe NON-encodé (parfois le parser l'encode en double)
  const rawPwd = 'L59pb#PnZvr74Ji';
  const directRaw = `postgresql://postgres.wjjmshjorqvamwunemth:${rawPwd}@aws-1-ca-central-1.pooler.supabase.com:5432/postgres`;
  await testUrl('DIRECT_URL brut (sans encodage URL)', directRaw);
  console.log('');
})();
