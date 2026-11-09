import { useState } from 'react';

const SESSAO_VAZIA = { titulo: '', assunto: '', data: '', duracaoMinutos: '', anotacoes: '' };

export default function SessaoForm({ sessaoInicial, onSalvar, onCancelar }) {
  const [valores, setValores] = useState(() => ({ ...SESSAO_VAZIA, ...sessaoInicial }));
  const [materiais, setMateriais] = useState(() => sessaoInicial?.materiais || []);
  const [erro, setErro] = useState('');

  const alterar = (e) => setValores(v => ({ ...v, [e.target.name]: e.target.value }));

  function adicionarMaterial() {
    setMateriais(m => [...m, { id: `${Date.now()}-${m.length}`, titulo: '', link: '' }]);
  }
  function alterarMaterial(id, campo, valor) {
    setMateriais(m => m.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  }
  function removerMaterial(id) {
    setMateriais(m => m.filter(item => item.id !== id));
  }

  function enviar(e) {
    e.preventDefault();
    if (!valores.titulo.trim()) { setErro('Informe um título para a sessão.'); return; }
    if (!valores.data) { setErro('Informe a data da sessão.'); return; }
    setErro('');
    onSalvar({
      titulo: valores.titulo.trim(),
      assunto: valores.assunto.trim(),
      data: valores.data,
      duracaoMinutos: valores.duracaoMinutos ? Number(valores.duracaoMinutos) : null,
      anotacoes: valores.anotacoes.trim(),
      materiais: materiais.filter(m => m.titulo.trim() || m.link.trim()).map(m => ({ titulo: m.titulo.trim(), link: m.link.trim() })),
    });
  }

  return (
    <form onSubmit={enviar} className="form sessao-form">
      {erro && <div className="alert" role="alert">{erro}</div>}

      <div className="field">
        <label htmlFor="titulo">Título</label>
        <input id="titulo" name="titulo" type="text" maxLength={150} value={valores.titulo} onChange={alterar} placeholder="Ex.: Revisão de Direito Constitucional" autoFocus />
      </div>

      <div className="campos-linha">
        <div className="field">
          <label htmlFor="assunto">Assunto (opcional)</label>
          <input id="assunto" name="assunto" type="text" maxLength={150} value={valores.assunto} onChange={alterar} placeholder="Ex.: Controle de constitucionalidade" />
        </div>
        <div className="field">
          <label htmlFor="data">Data</label>
          <input id="data" name="data" type="date" value={valores.data} onChange={alterar} />
        </div>
        <div className="field">
          <label htmlFor="duracaoMinutos">Duração (min)</label>
          <input id="duracaoMinutos" name="duracaoMinutos" type="number" min="1" max="1440" value={valores.duracaoMinutos} onChange={alterar} placeholder="60" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="anotacoes">Anotações</label>
        <textarea id="anotacoes" name="anotacoes" rows={4} maxLength={3000} value={valores.anotacoes} onChange={alterar} placeholder="O que você estudou, dúvidas, pontos a revisar…" />
      </div>

      <div className="materiais-edicao">
        <div className="materiais-edicao-cabecalho">
          <span>Materiais (links)</span>
          <button type="button" className="btn-link" onClick={adicionarMaterial}>+ Adicionar link</button>
        </div>
        {materiais.length === 0 && <p className="comentarios-vazio">Nenhum material adicionado.</p>}
        {materiais.map(m => (
          <div key={m.id} className="material-linha">
            <input type="text" placeholder="Título" maxLength={150} value={m.titulo} onChange={e => alterarMaterial(m.id, 'titulo', e.target.value)} />
            <input type="url" placeholder="https://…" maxLength={2000} value={m.link} onChange={e => alterarMaterial(m.id, 'link', e.target.value)} />
            <button type="button" className="btn-link btn-link-danger" onClick={() => removerMaterial(m.id)} aria-label="Remover material">Remover</button>
          </div>
        ))}
      </div>

      <div className="acoes">
        <button type="submit" className="btn btn-primary btn-inline">Salvar sessão</button>
        <button type="button" className="btn btn-secondary btn-inline" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
