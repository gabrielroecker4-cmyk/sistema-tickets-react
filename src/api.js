export const API_URL = "http://api-segunda-fase.pontosat.net.br:38723/api/v2";

export function cabecalhosAutenticados(comJson = false) {
  const token = sessionStorage.getItem("token");

  return {
    ...(comJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export function tratarSessaoExpirada(resposta) {
  if (resposta.status === 401) {
    sessionStorage.removeItem("token");
    window.location.reload();
    return true;
  }

  return false;
}
