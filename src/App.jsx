import { useState } from "react";
import FormularioTicket from "./FormularioTicket";
import ListaTickets from "./ListaTickets";
import Login from "./Login";
import "./App.css";

function App() {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [logado, setLogado] = useState(
    sessionStorage.getItem("token") !== null
  );

  function sair() {
    sessionStorage.removeItem("token");
    setTickets([]);
    setTotalTickets(0);
    setLogado(false);
  }

  if (!logado) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-mark">PS</div>
          <p className="eyebrow">Central de atendimento</p>
          <h1>Sistema de Tickets</h1>
          <p className="muted">Acesse para consultar e gerenciar chamados.</p>
          <Login setLogado={setLogado} />
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PontoSat • Atendimento</p>
          <h1>Sistema de Tickets</h1>
        </div>
        <button className="button secondary" type="button" onClick={sair}>
          Sair
        </button>
      </header>

      <main className="content">
        <section className="panel new-ticket-panel">
          <FormularioTicket
            setTickets={setTickets}
            setTotalTickets={setTotalTickets}
          />
        </section>

        <section className="panel tickets-panel">
          <ListaTickets
            tickets={tickets}
            setTickets={setTickets}
            totalTickets={totalTickets}
            setTotalTickets={setTotalTickets}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
