import { useState } from "react";
import {
  API_URL,
  cabecalhosAutenticados,
  tratarSessaoExpirada,
} from "./api";

function FormularioTicket({ setTickets, setTotalTickets }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);

    const novoTicket = {
      title: titulo.trim(),
      description: descricao.trim(),
      status: "open",
    };

    try {
      const resposta = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: cabecalhosAutenticados(true),
        body: JSON.stringify(novoTicket),
      });

      if (tratarSessaoExpirada(resposta)) return;

      const dados = await resposta.json();

      if (resposta.ok) {
        setTickets((ticketsAtuais) => [dados.data, ...ticketsAtuais]);
        setTotalTickets((totalAtual) => totalAtual + 1);
        setTitulo("");
        setDescricao("");
        setTipoMensagem("success");
        setMensagem("Chamado criado com sucesso.");
      } else {
        setTipoMensagem("error");
        setMensagem(dados.message || "Não foi possível criar o chamado.");
      }
    } catch {
      setTipoMensagem("error");
      setMensagem("Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="form" onSubmit={enviarFormulario}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Novo atendimento</p>
          <h2>Abrir chamado</h2>
        </div>
        <span className="status-badge status-open">Aberto</span>
      </div>

      <div className="field">
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Ex.: Sem acesso ao sistema"
          maxLength={160}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          placeholder="Descreva o problema com o máximo de detalhes possível."
          rows={6}
          required
        />
      </div>

      <button className="button primary" type="submit" disabled={enviando}>
        {enviando ? "Criando..." : "Criar chamado"}
      </button>

      {mensagem && <p className={`feedback ${tipoMensagem}`}>{mensagem}</p>}
    </form>
  );
}

export default FormularioTicket;
