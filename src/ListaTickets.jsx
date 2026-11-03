import { useEffect, useState } from "react";
import DetalheTicket from "./DetalheTicket";
import {
  API_URL,
  cabecalhosAutenticados,
  tratarSessaoExpirada,
} from "./api";

const LIMITE = 50;

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

function ListaTickets({
  tickets,
  setTickets,
  totalTickets,
  setTotalTickets,
}) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");

  useEffect(() => {
    async function buscarTickets() {
      setCarregando(true);
      setErro("");

      const offset = (pagina - 1) * LIMITE;
      const parametros = new URLSearchParams({
        offset: String(offset),
        limit: String(LIMITE),
      });

      if (buscaAplicada) {
        const condicoes = [
          { column: "title", op: "ilike", value: buscaAplicada },
          { column: "description", op: "ilike", value: buscaAplicada },
        ];

        if (/^\d+$/.test(buscaAplicada)) {
          condicoes.push({
            column: "id",
            op: "eq",
            value: Number(buscaAplicada),
          });
        }

        parametros.set(
          "filters",
          JSON.stringify({
            and: [],
            or: condicoes,
          })
        );
      }

      try {
        const resposta = await fetch(
          `${API_URL}/tickets?${parametros.toString()}`,
          { headers: cabecalhosAutenticados() }
        );

        if (tratarSessaoExpirada(resposta)) return;

        const dados = await resposta.json();

        if (resposta.ok) {
          setTickets(dados.data);
          setTotalTickets(dados.meta?.total ?? dados.data.length);
        } else {
          setErro(dados.message || "Não foi possível carregar os chamados.");
        }
      } catch {
        setErro("Erro ao conectar com o servidor.");
      } finally {
        setCarregando(false);
      }
    }

    buscarTickets();
  }, [pagina, buscaAplicada, setTickets, setTotalTickets]);

  function pesquisar(event) {
    event.preventDefault();
    setPagina(1);
    setBuscaAplicada(busca.trim());
  }

  function limparBusca() {
    setBusca("");
    setPagina(1);
    setBuscaAplicada("");
  }

  if (ticketSelecionado) {
    return (
      <DetalheTicket
        ticket={ticketSelecionado}
        setTickets={setTickets}
        fechar={() => setTicketSelecionado(null)}
      />
    );
  }

  const totalPaginas = Math.max(1, Math.ceil(totalTickets / LIMITE));

  return (
    <div>
      <div className="section-heading list-heading">
        <div>
          <p className="eyebrow">Central de chamados</p>
          <h2>Tickets</h2>
          <p className="muted">
            {buscaAplicada
              ? `${totalTickets} resultado(s) encontrado(s)`
              : `${totalTickets} chamados cadastrados`}
          </p>
        </div>

        <form className="search-form" onSubmit={pesquisar}>
          <input
            className="search-input"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Título, descrição ou ID"
            aria-label="Buscar tickets"
          />
          <button className="button primary" type="submit">
            Buscar
          </button>
          {buscaAplicada && (
            <button
              className="button secondary"
              type="button"
              onClick={limparBusca}
            >
              Limpar
            </button>
          )}
        </form>
      </div>

      {carregando && <p className="state-message">Carregando chamados...</p>}
      {erro && <p className="feedback error">{erro}</p>}

      {!carregando && !erro && tickets.length === 0 && (
        <p className="state-message">Nenhum chamado encontrado.</p>
      )}

      {!carregando && !erro && tickets.length > 0 && (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <article className="ticket-card" key={ticket.id}>
              <div className="ticket-card-top">
                <span className="ticket-id">#{ticket.id}</span>
                <span className={`status-badge ${classeStatus(ticket.status)}`}>
                  {traduzirStatus(ticket.status)}
                </span>
              </div>

              <h3>{ticket.title}</h3>
              <p className="ticket-description">{ticket.description}</p>

              <button
                className="button secondary"
                type="button"
                onClick={() => setTicketSelecionado(ticket)}
              >
                Ver chamado
              </button>
            </article>
          ))}
        </div>
      )}

      {!carregando && !erro && totalPaginas > 1 && (
        <div className="pagination">
          <button
            className="button secondary"
            type="button"
            onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>

          <span>
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
          </span>

          <button
            className="button secondary"
            type="button"
            onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
            disabled={pagina === totalPaginas}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export default ListaTickets;
