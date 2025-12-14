import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const basePrisma = new PrismaClient({ adapter });

// Prisma에서 제공하는 Operation 타입 사용
type PrismaOperation = Prisma.PrismaAction;

// 조회(READ) 작업 목록 - 타입 안전하게 정의
const READ_OPERATIONS: PrismaOperation[] = [
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
];

// 조회(READ) 작업인지 확인
const isReadOperation = (operation: PrismaOperation): boolean => {
  return READ_OPERATIONS.includes(operation);
};

// Soft Delete Extension - 조회 작업에만 자동 적용
const prismaWithSoftDelete = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        // READ 작업인 경우에만 deletedAt: null 추가
        if (isReadOperation(operation)) {
          const argsWithWhere = args as { where?: Record<string, unknown> };
          argsWithWhere.where = { ...argsWithWhere.where, deletedAt: null };
        }

        return query(args);
      },
    },
  },
});

const globalForPrisma = globalThis as unknown as {
  prisma: typeof prismaWithSoftDelete | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaWithSoftDelete;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

