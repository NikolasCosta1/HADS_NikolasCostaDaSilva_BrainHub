import app from './app.js';
import { env,validateEnvironment } from './config/env.js';
import { pool } from './config/database.js';
validateEnvironment();
await pool.query('SELECT 1');
const server=app.listen(env.port,()=>console.log(`BrainHub: http://localhost:${env.port}/api/health`));
async function shutdown() { server.close(async()=>{await pool.end();process.exit(0);}); }
process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown);
