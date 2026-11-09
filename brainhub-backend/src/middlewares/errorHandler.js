export function errorHandler(err, _req, res, _next) {
  if (res.headersSent) return _next(err);
  let status = err.status || 500;
  let message = err.message;
  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON inválido.'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Requisição muito grande.'; }
  else if (err.code === '23505') { status = 409; message = 'Registro já cadastrado.'; }
  else if (err.code === '23503') { status = 400; message = 'Referência inexistente ou registro ainda vinculado.'; }
  else if (['23514','23502','22P02','22003'].includes(err.code)) { status = 400; message = 'Dados incompatíveis com o modelo.'; }
  if (status >= 500) { console.error('Falha interna:', err.code || err.name); message = 'Erro interno do servidor.'; }
  res.status(status).json({ message });
}
