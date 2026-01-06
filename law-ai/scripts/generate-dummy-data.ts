import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  // Clear existing data (for dev only)
  await prisma.auditLog.deleteMany({});
  await prisma.fileVersion.deleteMany({});
  await prisma.taskBoard.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.lawyerProfile.deleteMany({});
  await prisma.clientProfile.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});

  // Create dummy users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@law.ai',
      password: process.env.DEFAULT_PASSWORD || 'temp123',
      name: 'Admin',
      role: 'admin',
      admin: { create: {} }
    },
  });

  const lawyerUser = await prisma.user.create({
    data: {
      email: 'lawyer@law.ai',
      password: process.env.DEFAULT_PASSWORD || 'temp123',
      name: 'Jane Lawyer',
      role: 'lawyer',
      lawyerProfile: {
        create: {
          bio: 'Experienced contract lawyer.',
          barId: 'BAR12345',
          languages: ['English', 'Hindi']
        }
      }
    },
    include: { lawyerProfile: true }
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@law.ai',
      password: process.env.DEFAULT_PASSWORD || 'temp123',
      name: 'John Client',
      role: 'client',
      clientProfile: { create: {} }
    },
    include: { clientProfile: true }
  });

  // Create a contract between lawyer and client
  const contract = await prisma.contract.create({
    data: {
      title: 'Service Agreement',
      content: 'This is a dummy contract for legal services.',
      lawyer: { connect: { id: lawyerUser.lawyerProfile?.id } },
      client: { connect: { id: clientUser.clientProfile?.id } },
      fileVersions: {
        create: [{ url: 'https://dummy.url/contract-v1.pdf', version: 1 }]
      }
    }
  });

  // Create a case
  const legalCase = await prisma.case.create({
    data: {
      title: 'Case #1',
      description: 'A sample legal case.',
      lawyer: { connect: { id: lawyerUser.lawyerProfile?.id } },
      client: { connect: { id: clientUser.clientProfile?.id } },
    }
  });

  // Add a message
  await prisma.message.create({
    data: {
      content: 'Hello, this is your lawyer.',
      user: { connect: { id: lawyerUser.id } },
      case: { connect: { id: legalCase.id } },
    }
  });

  // Add an appointment
  await prisma.appointment.create({
    data: {
      user: { connect: { id: clientUser.id } },
      case: { connect: { id: legalCase.id } },
      date: new Date(Date.now() + 86400000),
      notes: 'Initial consultation.'
    }
  });

  // Add an invoice
  await prisma.invoice.create({
    data: {
      user: { connect: { id: clientUser.id } },
      amount: 500.0,
      status: 'unpaid',
      pdfUrl: 'https://dummy.url/invoice.pdf'
    }
  });

  // Add a task board
  await prisma.taskBoard.create({
    data: {
      title: 'Case Tasks',
      user: { connect: { id: lawyerUser.id } },
      tasks: ['Draft contract', 'Review evidence', 'Client call']
    }
  });

  // Add an audit log
  await prisma.auditLog.create({
    data: {
      user: { connect: { id: admin.id } },
      action: 'Seeded database with dummy data.'
    }
  });

  console.log('Dummy data generated!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
