const { PrismaClient } = require('@prisma/client');

async function checkActivities() {
  const prisma = new PrismaClient();

  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('Recent Activities:', JSON.stringify(activities, null, 2));
    console.log('Total activities:', activities.length);

    // Get activity counts by type
    const activityCounts = await prisma.activity.groupBy({
      by: ['type'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } }
    });

    console.log('\nActivity Counts by Type:');
    activityCounts.forEach(count => {
      console.log(`${count.type}: ${count._count._all}`);
    });

  } catch (error) {
    console.error('Error checking activities:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();