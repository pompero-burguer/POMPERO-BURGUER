# Pompero Sistema - Producao

Para abrir no celular, no Google do computador e em qualquer lugar, este sistema precisa rodar em uma hospedagem com URL publica HTTPS. Sem comprar dominio, use a URL gratuita gerada pela hospedagem.

## O que ja esta preparado

- Cliente: `/cliente.html`
- Loja/admin: `/loja.html`
- Pagamento: `/pagamento.html`
- Acompanhamento: `/acompanhar.html`
- Backend Node: `server.js`
- Estado compartilhado no servidor: `pompero-state.local.json`
- Credenciais Mercado Pago no servidor ou por variaveis de ambiente
- Checkout Mercado Pago via backend: `/api/mp/create-preference`
- URL de webhook: `/api/mp/webhook`
- Health check da hospedagem: `/api/health`
- Configuracao Render: `render.yaml`

## Variaveis na hospedagem

Configure:

```text
PUBLIC_BASE_URL=https://sua-url-gratis-da-hospedagem
MERCADO_PAGO_PUBLIC_KEY=sua_public_key
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
DATA_DIR=/caminho/para/dados
```

`PUBLIC_BASE_URL` e a URL que deve entrar no app do Mercado Pago como URL oficial do sistema.

## URLs para colocar no Mercado Pago

Use a URL publica HTTPS gerada pela hospedagem:

```text
Site do cliente:
https://sua-url-gratis-da-hospedagem/cliente.html

Site da loja:
https://sua-url-gratis-da-hospedagem/loja.html

Webhook/notificacoes:
https://sua-url-gratis-da-hospedagem/api/mp/webhook
```

## Como rodar

```bash
npm install
npm start
```

ou, se usar pnpm:

```bash
pnpm install
pnpm start
```

## Importante

`localhost` so abre na sua maquina. Para abrir no celular fora da sua rede e para o Mercado Pago reconhecer a URL, precisa de hospedagem publica HTTPS.

Leia tambem `DEPLOY_GRATIS.md` para subir sem comprar dominio.

Antes de usar dinheiro real, faca um pedido pequeno em producao e confirme:

- O cliente gera checkout.
- O pagamento abre no Mercado Pago.
- O pedido aparece na loja depois da confirmacao.
- A comanda imprime corretamente.
