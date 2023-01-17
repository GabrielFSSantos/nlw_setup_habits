import Fastfy from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const app =  Fastfy();
const prisma = new PrismaClient();

app.register(cors);

app.get('/', async () => {
  const habits = await prisma.habit.findMany();

  return habits;
});

app.listen({
  port: 3333,
}).then(() => {
  console.log("HTTP Server running!");
});