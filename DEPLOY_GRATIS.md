# Deploy gratis com URL fixa

Este projeto pode rodar sem comprar dominio usando uma hospedagem com subdominio gratuito.

## Opcao recomendada agora: Render

1. Crie uma conta em https://render.com.
2. Suba a pasta `pompero-sistema` para um repositorio GitHub.
3. No Render, clique em `New` > `Web Service`.
4. Conecte o repositorio.
5. Configure:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

6. Depois que o Render criar a URL, copie o endereco gerado, por exemplo:

```text
https://pompero-sistema.onrender.com
```

7. Em `Environment`, configure:

```text
PUBLIC_BASE_URL=https://SUA-URL-DO-RENDER
MERCADO_PAGO_PUBLIC_KEY=SUA_PUBLIC_KEY
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN
```

8. No Mercado Pago, use:

```text
Site do cliente:
https://SUA-URL-DO-RENDER/cliente.html

Site da loja:
https://SUA-URL-DO-RENDER/loja.html

Webhook:
https://SUA-URL-DO-RENDER/api/mp/webhook
```

## Observacao importante

Plano gratuito pode dormir quando fica sem acesso por um tempo. O primeiro acesso depois disso pode demorar alguns segundos.

Para operacao diaria com pedidos reais, o ideal futuro e usar hospedagem com persistencia garantida ou banco de dados. Esta versao ja separa `DATA_DIR` para facilitar esse proximo passo.
