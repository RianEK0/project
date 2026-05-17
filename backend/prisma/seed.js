const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'Super Admin' },
    { name: 'Admin Direktorat' },
    { name: 'Pegawai' }
  ];

  for (let role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Struktur Organisasi Resmi Komdigi (Kementerian Komunikasi dan Digital)
  const dirs = [
    { 
      name: 'Ditjen Aplikasi Informatika (Aptika)', 
      color: '#16a34a', // Green
      divisis: ['Direktorat Tata Kelola Aptika', 'Direktorat Layanan Aplikasi Informatika Pemerintahan']
    },
    { 
      name: 'Ditjen Informasi dan Komunikasi Publik (IKP)', 
      color: '#dc2626', // Red
      divisis: ['Direktorat Pengelolaan Media', 'Direktorat Tata Kelola dan Kemitraan Komunikasi Publik']
    },
    { 
      name: 'Ditjen Sumber Daya dan Perangkat Pos dan Informatika (SDPPI)', 
      color: '#2563eb', // Blue
      divisis: ['Direktorat Penataan Sumber Daya', 'Direktorat Operasi Sumber Daya']
    },
    { 
      name: 'Ditjen Penyelenggaraan Pos dan Informatika (PPI)', 
      color: '#ca8a04', // Yellow
      divisis: ['Direktorat Pos', 'Direktorat Telekomunikasi']
    }
  ];

  for (let dir of dirs) {
    await prisma.direktorat.upsert({
      where: { name: dir.name },
      update: {},
      create: {
        name: dir.name,
        color: dir.color,
        divisis: {
          create: dir.divisis.map(d => ({ name: d }))
        }
      }
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  const adminDirRole = await prisma.role.findUnique({ where: { name: 'Admin Direktorat' } });
  const pegawaiRole = await prisma.role.findUnique({ where: { name: 'Pegawai' } });
  
  const allDirs = await prisma.direktorat.findMany({ include: { divisis: true } });

  const hash = bcrypt.hashSync('admin123', 8);

  // Super Admin Utama
  await prisma.user.upsert({
    where: { email: 'admin@komdigi.go.id' },
    update: {},
    create: {
      name: 'Menteri / Super Admin Komdigi',
      email: 'admin@komdigi.go.id',
      password: hash,
      position: 'Menteri',
      roleId: superAdminRole.id,
      direktoratId: allDirs[0].id, // Default assign to first dir, but role is Super Admin
      divisiId: allDirs[0].divisis[0].id
    }
  });

  // Generate Akun Admin & Pegawai untuk setiap Direktorat dan Divisi
  for (let d of allDirs) {
    // Prefix email dari nama singkatan direktorat, misal Aptika -> aptika
    const prefixMatch = d.name.match(/\(([^)]+)\)/);
    const prefix = prefixMatch ? prefixMatch[1].toLowerCase() : d.name.split(' ')[1].toLowerCase();
    
    // Admin Direktorat (berada di Divisi pertama)
    await prisma.user.upsert({
      where: { email: `admin.${prefix}@komdigi.go.id` },
      update: {},
      create: {
        name: `Dirjen ${prefix.toUpperCase()}`,
        email: `admin.${prefix}@komdigi.go.id`,
        password: hash,
        position: 'Direktur Jenderal',
        roleId: adminDirRole.id,
        direktoratId: d.id,
        divisiId: d.divisis[0].id
      }
    });

    // Pegawai di Divisi 1
    await prisma.user.upsert({
      where: { email: `pegawai1.${prefix}@komdigi.go.id` },
      update: {},
      create: {
        name: `Pegawai ${d.divisis[0].name}`,
        email: `pegawai1.${prefix}@komdigi.go.id`,
        password: hash,
        position: 'Staff Ahli',
        roleId: pegawaiRole.id,
        direktoratId: d.id,
        divisiId: d.divisis[0].id
      }
    });

    // Pegawai di Divisi 2
    if (d.divisis.length > 1) {
      await prisma.user.upsert({
        where: { email: `pegawai2.${prefix}@komdigi.go.id` },
        update: {},
        create: {
          name: `Pegawai ${d.divisis[1].name}`,
          email: `pegawai2.${prefix}@komdigi.go.id`,
          password: hash,
          position: 'Staff Teknis',
          roleId: pegawaiRole.id,
          direktoratId: d.id,
          divisiId: d.divisis[1].id
        }
      });
    }
  }

  console.log('Seeding finished with authentic Komdigi data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
