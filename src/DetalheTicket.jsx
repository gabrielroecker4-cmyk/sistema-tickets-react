import { useEffect, useState } from "react";
import {
  API_URL,
  cabecalhosAutenticados,
  tratarSessaoExpirada,
} from "./api";

function traduzirStatus(status) {
  if (status === "open") return "Aberto";
  if (status === "in_progress") return "Em atendimento";
  return "Finalizado";
}

function classeStatus(status) {
  if (status === "open") return "status-open";
  if (status === "in_progress") return "status-progress";
  return "status-closed";
}

function formatarData(data) {
  if (!data) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function DetalheTicket({ ticket, setTickets, fechar }) {
  const [ticketAtual, setTicketAtual] = useState(ticket);
  const [titulo, setTitulo] = useState(ticket.title);
  const [descricao, setDescricao] = useState(ticket.description);
  const [status, setStatus] = useState(ticket.status);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [interacoes, setInteracoes] = useState([]);
  const [carregandoInteracoes, setCarregandoInteracoes] = useState(true);
  const [erroInteracoes, setErroInteracoes] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  useEffect(() => {
    async function buscarInteracoes() {
      setCarregandoInteracoes(true);
      setErroInteracoes("");

      try {
        const resposta = await fetch(
          `${API_URL}/ticket-interaction?id_ticket=${ticket.id}`,
          { headers: cabecalhosAutenticados() }
        );

        if (tratarSessaoExpirada(resposta)) return;

        const dados = await resposta.json();

        if (resposta.ok) {
          setInteracoes(dados.data ?? []);
        } else {
          setErroInteracoes(dados.message || "Não foi possível carregar o histórico.");
        }
      } catch {
        setErroInteracoes("Erro ao carregar o histórico do chamado.");
      } finally {
        setCarregandoInteracoes(false);
      }
    }

    buscarInteracoes();
  }, [ticket.id]);

  async function salvarAlteracoes(event) {
    event.preventDefault();
    setMensagem("");
    setSalvando(true);

    const ticketAtualizado = {
      title: titulo.trim(),
      description: descricao.trim(),
      // Um chamado finalizado é terminal na interface: não pode ser reaberto.
      status: ticketAtual.status === "closed" ? "closed" : status,
    };

    try {
      const resposta = await fetch(`${API_URL}/tickets/${ticket.id}`, {
        method: "PUT",
        headers: cabecalhosAutenticados(true),
        body: JSON.stringify(ticketAtualizado),
      });

      if (tratarSessaoExpirada(resposta)) return;

      const dados = await resposta.json();

      if (resposta.ok) {
        setTicketAtual(dados.data);
        setTitulo(dados.data.title);
        setDescricao(dados.data.description);
        setStatus(dados.data.status);
        setTickets((ticketsAtuais) =>
          ticketsAtuais.map((item) =>
            item.id === ticket.id ? dados.data : item
          )
        );
        setTipoMensagem("success");
        setMensagem("Chamado atualizado com sucesso.");
      } else {
        setTipoMensagem("error");
        setMensagem(dados.message || "Não foi possível atualizar o chamado.");
      }
    } catch {
      setTipoMensagem("error");
      setMensagem("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarInteracao(event) {
    event.preventDefault();

    if (!novaMensagem.trim()) return;

    setEnviandoMensagem(true);
    setErroInteracoes("");

    try {
      const resposta = await fetch(`${API_URL}/ticket-interaction`, {
        method: "POST",
        headers: cabecalhosAutenticados(true),
        body: JSON.stringify({
          text: novaMensagem.trim(),
          id_ticket: ticket.id,
        }),
      });

      if (tratarSessaoExpirada(resposta)) return;

      const dados = await resposta.json();

      if (resposta.ok) {
        setInteracoes((atuais) => [...atuais, dados.data]);
        setNovaMensagem("");
      } else {
        setErroInteracoes(dados.message || "Não foi possível enviar a mensagem.");
      }
    } catch {
      setErroInteracoes("Erro ao enviar a mensagem.");
    } finally {
      setEnviandoMensagem(false);
    }
  }

  return (
    <div className="ticket-detail">
      <div className="detail-header">
        <button className="button ghost" type="button" onClick={fechar}>
          ← Voltar aos chamados
        </button>

        <span className={`status-badge ${classeStatus(ticketAtual.status)}`}>
          {traduzirStatus(ticketAtual.status)}
        </span>
      </div>

      <div className="detail-title">
        <div>
          <p className="eyebrow">Chamado #{ticketAtual.id}</p>
          <h2>{ticketAtual.title}</h2>
        </div>
        {ticketAtual.date_updated && (
          <span className="muted small">
            Atualizado em {formatarData(ticketAtual.date_updated)}
          </span>
        )}
      </div>

      <div className="detail-grid">
        <form className="form detail-form" onSubmit={salvarAlteracoes}>
          <h3>Editar chamado</h3>

          <div className="field">
            <label htmlFor="editar-titulo">Título</label>
            <input
              id="editar-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              disabled={ticketAtual.status === "closed"}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="editar-descricao">Descrição</label>
            <textarea
              id="editar-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              rows={7}
              disabled={ticketAtual.status === "closed"}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={ticketAtual.status === "closed"}
            >
              <option value="open">Aberto</option>
              <option value="in_progress">Em atendimento</option>
              <option value="closed">Finalizado</option>
            </select>
            {ticketAtual.status === "closed" && (
              <span className="field-hint">
                Chamados finalizados não podem ser reabertos.
              </span>
            )}
          </div>

          {ticketAtual.status === "closed" && (
            <p className="field-hint">
              Título, descrição e status ficam bloqueados após a finalização.
            </p>
          )}

          <button
            className="button primary"
            type="submit"
            disabled={salvando || ticketAtual.status === "closed"}
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>

          {mensagem && <p className={`feedback ${tipoMensagem}`}>{mensagem}</p>}
        </form>

        <section className="conversation">
          <div className="conversation-header">
            <div>
              <p className="eyebrow">Histórico</p>
              <h3>Conversa do chamado</h3>
            </div>
            <span className="interaction-count">{interacoes.length}</span>
          </div>

          <div className="messages">
            {carregandoInteracoes && (
              <p className="state-message">Carregando histórico...</p>
            )}

            {erroInteracoes && <p className="feedback error">{erroInteracoes}</p>}

            {!carregandoInteracoes && !erroInteracoes && interacoes.length === 0 && (
              <p className="state-message">Ainda não há mensagens neste chamado.</p>
            )}

            {interacoes.map((interacao) => (
              <article className="message" key={interacao.id}>
                <div className="message-meta">
                  <strong>Usuário #{interacao.id_user}</strong>
                  <span>{formatarData(interacao.created_at)}</span>
                </div>
                <p>{interacao.text}</p>
              </article>
            ))}
          </div>

          <form className="message-form" onSubmit={enviarInteracao}>
            <label htmlFor="nova-mensagem">Nova mensagem</label>
            <textarea
              id="nova-mensagem"
              value={novaMensagem}
              onChange={(event) => setNovaMensagem(event.target.value)}
              placeholder="Escreva uma atualização para este chamado..."
              rows={4}
              required
            />
            <button
              className="button primary"
              type="submit"
              disabled={enviandoMensagem}
            >
              {enviandoMensagem ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default DetalheTicket;
