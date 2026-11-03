import { useState } from "react";
import { API_URL } from "./api";

function Login({ setLogado }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        sessionStorage.setItem("token", dados.data.access_token);
        setLogado(true);
      } else {
        setErro(dados.message || "E-mail ou senha inválidos.");
      }
    } catch {
      setErro("Não foi possível conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form className="form login-form" onSubmit={fazerLogin}>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu@email.com"
          autoComplete="username"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          required
        />
      </div>

      {erro && <p className="feedback error">{erro}</p>}

      <button className="button primary full" type="submit" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default Login;
