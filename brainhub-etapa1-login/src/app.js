import express from 'express';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
const app=express();
app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store');
  res.set('X-Content-Type-Options','nosniff');
  if (req.headers.origin===env.frontendOrigin) {
    res.set('Access-Control-Allow-Origin',env.frontendOrigin);
    res.vary('Origin');
    res.set('Access-Control-Allow-Headers','Content-Type,Authorization');
    res.set('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  if (req.method==='OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({limit:'256kb'}));
app.use('/api',routes);
app.use((_req,res)=>res.status(404).json({message:'Rota não encontrada.'}));
app.use(errorHandler);
export default app;
