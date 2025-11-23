const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com'; // Email bạn dùng để đăng nhập
  const password = 'admin123';    // Mật khẩu mới
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Đang reset mật khẩu cho ${email}...`);

  // Dùng upsert: Nếu chưa có thì tạo mới, có rồi thì cập nhật pass
  const user = await prisma.system_users.upsert({
    where: { email: email },
    update: { 
        password: hashedPassword 
    },
    create: {
      email: email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN'
    },
  });

  console.log("Thành công! User:", user);
  console.log(`Mật khẩu hash trong DB: ${user.password}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });