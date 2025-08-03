import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Add middleware for logging and access control
prisma.$use(async (params, next) => {
  // Log all queries in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Prisma ${params.model}.${params.action}`)
  }
  
  // Implement access control for sensitive operations
  // This is a simple example - you would expand this based on your requirements
  if (params.action === 'delete' || params.action === 'deleteMany') {
    // In a real app, you would check the user's role from the session
    // const session = await getSession();
    // if (session?.user?.role !== 'admin') {
    //   throw new Error('Not authorized to perform this action');
    // }
  }
  
  return next(params);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;