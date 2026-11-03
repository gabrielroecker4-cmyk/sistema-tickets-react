# Sistema de Tickets

Aplicação front-end desenvolvida em React para abertura, consulta, edição e acompanhamento de chamados, consumindo a API disponibilizada no desafio técnico.

## Funcionalidades

- Login e autenticação com Bearer Token
- Criação de novos chamados
- Listagem paginada de tickets
- Busca de chamados por título, descrição ou ID
- Visualização dos detalhes do chamado
- Edição de título e descrição
- Alteração de status: Aberto, Em atendimento e Finalizado
- Bloqueio de título, descrição e status após a finalização do chamado
- Consulta do histórico de interações
- Envio de novas mensagens no chamado
- Tratamento de carregamento, erros básicos e sessão expirada
- Interface responsiva

## Tecnologias

- React
- JavaScript
- Vite
- CSS
- Fetch API
- Session Storage

## Como executar

1. Clone o repositório e entre na pasta do projeto.
2. Instale as dependências:

```bash
npm install
```

3. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

4. Abra no navegador o endereço informado pelo Vite.

## Estrutura principal

- `src/App.jsx`: controla autenticação e estrutura principal da aplicação.
- `src/Login.jsx`: realiza o login e armazena o token da sessão.
- `src/FormularioTicket.jsx`: cria novos tickets.
- `src/ListaTickets.jsx`: consulta, pesquisa, pagina e exibe os chamados.
- `src/DetalheTicket.jsx`: edita o ticket, altera status e gerencia interações.
- `src/api.js`: centraliza a URL da API e os cabeçalhos de autenticação.

## Observações

As credenciais de teste não são armazenadas no código-fonte. O token de autenticação é mantido apenas no `sessionStorage` durante a sessão do navegador.
