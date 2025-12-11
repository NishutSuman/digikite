const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Subscription Plans
  const plans = [
    {
      name: 'Starter',
      code: 'STARTER',
      description: 'Perfect for small alumni associations and community groups',
      priceMonthly: 2999,
      priceQuarterly: 7999,
      priceYearly: 29999,
      currency: 'INR',
      maxUsers: 500,
      storageQuotaMB: 5120,
      features: {
        events: true,
        posts: true,
        directory: true,
        messaging: true,
        albums: true,
        polls: true,
        treasury: false,
        merchandise: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
      },
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      trialDays: 7,
    },
    {
      name: 'Professional',
      code: 'PROFESSIONAL',
      description: 'Ideal for growing organizations with advanced needs',
      priceMonthly: 5999,
      priceQuarterly: 15999,
      priceYearly: 59999,
      currency: 'INR',
      maxUsers: 2000,
      storageQuotaMB: 20480,
      features: {
        events: true,
        posts: true,
        directory: true,
        messaging: true,
        albums: true,
        polls: true,
        treasury: true,
        merchandise: true,
        customBranding: true,
        apiAccess: false,
        prioritySupport: true,
      },
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      trialDays: 7,
    },
    {
      name: 'Enterprise',
      code: 'ENTERPRISE',
      description: 'For large institutions with custom requirements',
      priceMonthly: 14999,
      priceQuarterly: 39999,
      priceYearly: 149999,
      currency: 'INR',
      maxUsers: 10000,
      storageQuotaMB: 102400,
      features: {
        events: true,
        posts: true,
        directory: true,
        messaging: true,
        albums: true,
        polls: true,
        treasury: true,
        merchandise: true,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedSupport: true,
        sla: true,
        whiteLabel: true,
      },
      isActive: true,
      isPopular: false,
      sortOrder: 3,
      trialDays: 14,
    },
  ];

  console.log('📋 Creating subscription plans...');
  for (const plan of plans) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { code: plan.code },
    });

    if (existingPlan) {
      console.log(`  ✓ Plan "${plan.name}" already exists, updating...`);
      await prisma.subscriptionPlan.update({
        where: { code: plan.code },
        data: plan,
      });
    } else {
      console.log(`  + Creating plan "${plan.name}"...`);
      await prisma.subscriptionPlan.create({ data: plan });
    }
  }

  // Create Super Admin user
  const superAdminEmail = 'admin@digikite.com';
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    console.log('👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash('DigiKite@2024', 12);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Digikite Admin',
        password: hashedPassword,
        provider: 'EMAIL',
        emailVerified: true,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log(`  ✓ Super admin created: ${superAdminEmail}`);
  } else {
    console.log(`  ✓ Super admin already exists: ${superAdminEmail}`);
  }

  // Create Admin user
  const adminEmail = 'team@digikite.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('DigiKite@2024', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Digikite Team',
        password: hashedPassword,
        provider: 'EMAIL',
        emailVerified: true,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`  ✓ Admin created: ${adminEmail}`);
  } else {
    console.log(`  ✓ Admin already exists: ${adminEmail}`);
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
