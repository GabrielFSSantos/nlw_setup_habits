import Fastfy from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';

const app =  Fastfy();

app.register(cors);
app.register(appRoutes);


app.listen({
  port: 3333,
}).then(() => {
  console.log("HTTP Server running!");
});