import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = Date.now()
          const result = await query(args)
          const end = Date.now()
          
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Prisma ${model}.${operation} took ${end - start}ms`)
          }
          
          // Implement access control for sensitive operations
          if (operation === 'delete' || operation === 'deleteMany') {
            // In a real app, you would check the user's role from the session
            // This is handled at the API route level for better security
            console.log(`Warning: Performing ${operation} on ${model}`)
          }
          
          return result
        },
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;