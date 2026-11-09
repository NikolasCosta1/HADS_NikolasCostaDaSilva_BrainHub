const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
export const env = Object.freeze({
  port,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  questApiBaseUrl: (process.env.QUEST_API_BASE_URL || 'https://api.quest.api.br/v2').replace(/\/$/, ''),
  questApiKey: process.env.QUEST_API_KEY || '',
});
export function validateEnvironment() {
  if (!env.databaseUrl) throw new Error('Preencha DATABASE_URL.');
  if (env.jwtSecret.length < 32 || env.jwtSecret.startsWith('SUBSTITUA')) throw new Error('Defina JWT_SECRET aleatório com pelo menos 32 caracteres.');
}
