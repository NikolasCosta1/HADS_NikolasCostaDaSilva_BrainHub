import { Router } from 'express';
import { authenticate,requireRole } from '../middlewares/auth.js';
import { login,createUser } from '../services/auth/authService.js';
import { listCatalog,saveCatalog } from '../services/disciplinas/catalogoService.js';
import * as questions from '../controllers/questoes/questaoController.js';
const router=Router();
router.get('/health',(_req,res)=>res.json({ status:'ok',service:'brainhub-backend' }));
router.post('/auth/login',async(req,res)=>res.json(await login(req.body,req.ip)));
router.use(authenticate);
router.get('/me',(req,res)=>res.json(req.user));
for (const [path,kind] of [['disciplinas','disciplina'],['assuntos','assunto']]) {
  router.get(`/${path}`,async(req,res)=>res.json(await listCatalog(kind,req.query,false)));
  router.get(`/admin/${path}`,requireRole('ADMINISTRADOR'),async(req,res)=>res.json(await listCatalog(kind,req.query,true)));
  router.post(`/admin/${path}`,requireRole('ADMINISTRADOR'),async(req,res)=>res.status(201).json(await saveCatalog(kind,req.body)));
  router.put(`/admin/${path}/:id`,requireRole('ADMINISTRADOR'),async(req,res)=>res.json(await saveCatalog(kind,req.body,req.params.id)));
}
router.post('/admin/usuarios',requireRole('ADMINISTRADOR'),async(req,res)=>res.status(201).json(await createUser(req.body)));
router.get('/admin/questoes',requireRole('ADMINISTRADOR'),questions.listAdmin);
router.get('/admin/questoes/:id',requireRole('ADMINISTRADOR'),questions.getAdmin);
router.post('/admin/questoes',requireRole('ADMINISTRADOR'),questions.create);
router.put('/admin/questoes/:id',requireRole('ADMINISTRADOR'),questions.update);
router.patch('/admin/questoes/:id/inativar',requireRole('ADMINISTRADOR'),questions.deactivate);
router.get('/questoes',questions.listAluno);
router.get('/questoes/:id',questions.getAluno);
router.post('/questoes/:id/respostas',requireRole('ALUNO'),questions.answer);
export default router;
