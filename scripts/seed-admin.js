const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com'; 
  const password = 'admin123';   
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.system_users.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN'
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });