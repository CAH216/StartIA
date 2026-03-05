const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');
const bcrypt           = require('bcryptjs');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  const email       = 'admin@gmail.com';
  const password    = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email,
      passwordHash,
      fullName:    'Administrateur',
      companyName: 'StratIA',
      role:        'ADMIN',
      plan:        'PRO',
    },
  });

  console.log(`✅ Admin créé / mis à jour :
  ID    : ${admin.id}
  Email : ${admin.email}
  Rôle  : ${admin.role}
  Mdp   : ${password}
`);
}

main()
  .catch((e) => { console.error('❌ Erreur :', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
