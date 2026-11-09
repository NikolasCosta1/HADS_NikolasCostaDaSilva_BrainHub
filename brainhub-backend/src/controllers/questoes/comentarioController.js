import * as service from '../../services/questoes/comentarioService.js';

export const list = async (req, res) => res.json({ items: await service.listComments(req.params.id) });
export const create = async (req, res) => res.status(201).json(await service.createComment(req.params.id, req.body, req.user.id_usuario));
export const update = async (req, res) => res.json(await service.updateComment(req.params.id, req.params.id_comentario, req.body, req.user));
export const remove = async (req, res) => res.json(await service.deleteComment(req.params.id, req.params.id_comentario, req.user));
