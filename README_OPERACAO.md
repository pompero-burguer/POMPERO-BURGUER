# Pompero Burguer - Operacao

## Abrir o sistema

Com o servidor rodando, acesse:

- Entrada local: http://localhost:8080/
- Cliente local: http://localhost:8080/cliente.html
- Loja local: http://localhost:8080/loja.html
- Acompanhar pedido local: http://localhost:8080/acompanhar.html

URL publica atual:

- Cliente: https://tons-raises-popularity-wins.trycloudflare.com/cliente.html
- Loja: https://tons-raises-popularity-wins.trycloudflare.com/loja.html
- Webhook Mercado Pago: https://tons-raises-popularity-wins.trycloudflare.com/api/mp/webhook

## Mercado Pago

Para usar pagamento real com Mercado Pago, configure a Public Key e o Access Token de producao na aba Mercado Pago da loja.

Nunca coloque o Access Token em arquivos que o navegador baixa, como `cliente.js`, `shared.js` ou arquivos HTML.

Com token configurado, o site chama o backend e gera Pix, cartao ou Checkout Pro pelo Mercado Pago.

## Fluxo de operacao

1. Cliente monta o pedido.
2. Sistema cria pedido em `Aguardando pagamento`.
3. Pagamento e gerado pelo Mercado Pago.
4. Depois da confirmacao, o pedido vira `Pago aguardando aceite`.
5. A loja aceita e imprime a comanda.

Em operacao real, a confirmacao do pagamento deve ser feita pelo webhook do Mercado Pago.
