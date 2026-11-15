import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, AccountRole } from '../src/generated/prisma/client.js';

async function main(): Promise<void> {
  // 1. Read and normalize the email argument (same normalization as register()).
  const rawEmail = process.argv[2];
  const email = rawEmail?.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    console.error('Usage: npm run admin:promote -- <email>');
    process.exitCode = 1;
    return;
  }

  // 2. Read the connection string.
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exitCode = 1;
    return;
  }

  // 3. Show which database we are about to touch (never the password).
  const url = new URL(connectionString);
  console.log(`Target database: ${url.hostname}:${url.port}${url.pathname}`);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    // 4. Look up the user.
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true, role: true },
    });

    if (!user) {
      console.error(`No account found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    if (!user.isActive) {
      console.error('Refusing to promote an inactive account.');
      process.exitCode = 1;
      return;
    }

    if (user.role === AccountRole.ADMIN) {
      console.log(`${user.email} is already an ADMIN. No changes made.`);
      return;
    }

    // 5. Promote.
    await prisma.user.update({
      where: { id: user.id },
      data: { role: AccountRole.ADMIN },
    });

    console.log(`Promoted ${user.email} (id: ${user.id}) to ADMIN.`);
  } finally {
    // 6. Always close the connection.
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Promotion failed:', error);
  process.exitCode = 1;
});
