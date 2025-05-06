import {PrismaClient} from "../generated/prisma/index.js";

// good practice to use singleton pattern

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;