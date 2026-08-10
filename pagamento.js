const params = new URLSearchParams(window.location.search);
const paymentId = params.get("id");
const mpStatus = params.get("mp_status");
const summary = document.querySelector("#payment-summary");
const walletContainer = document.querySelector("#wallet_container");
let order = null;

async function approvePayment(message) {
  await Pompero.syncFromServer();
  const freshState = Pompero.load();
  const paidOrder = freshState.pendingPayments.find((item) => item.paymentId === paymentId);

  if (!paidOrder) {
    summary.innerHTML = `<div class="empty-state">Pedido nao encontrado ou ja confirmado.</div>`;
    return;
  }

  paidOrder.status = "Pago aguardando aceite";
  paidOrder.paidAt = new Date().toISOString();
  freshState.pendingPayments = freshState.pendingPayments.filter((item) => item.paymentId !== paymentId);
  freshState.pendingOrders.unshift(paidOrder);
  Pompero.save(freshState);
  document.querySelector("#payment-help").textContent = message || "Pagamento confirmado. Pedido enviado para a loja.";
  window.location.href = `acompanhar.html?pedido=${encodeURIComponent(paidOrder.code)}`;
}

async function renderMercadoPagoWallet() {
  if (!order.preferenceId || !order.mpPublicKey || !window.MercadoPago) {
    walletContainer.innerHTML = `<div class="notice">Checkout real indisponivel neste pedido. Volte e gere o pedido novamente.</div>`;
    return;
  }

  try {
    const mercadoPago = new MercadoPago(order.mpPublicKey, { locale: "pt-BR" });
    const bricksBuilder = mercadoPago.bricks();
    await bricksBuilder.create("wallet", "wallet_container", {
      initialization: {
        preferenceId: order.preferenceId,
      },
      customization: {
        texts: {
          valueProp: "smart_option",
        },
      },
    });
  } catch (error) {
    walletContainer.innerHTML = `<div class="notice">Nao foi possivel carregar o checkout oficial: ${error.message}</div>`;
  }
}

async function initPayment() {
  await Pompero.syncFromServer();
  Pompero.applyBrandLogo();
  const state = Pompero.load();
  order = state.pendingPayments.find((item) => item.paymentId === paymentId);

  if (!order) {
    summary.innerHTML = `<div class="empty-state">Pedido nao encontrado ou ja confirmado.</div>`;
    return;
  }

  summary.innerHTML = `
    <div class="table-main">
      <strong>${order.customer}</strong>
      <small>${order.items.map((item) => item.name).join(", ")}</small>
      <small>Pagamento: ${order.payment.method}</small>
      <small>Total: ${Pompero.currency.format(order.total)}</small>
      <small>Status: ${order.status}</small>
    </div>
  `;

  if (mpStatus === "success") {
    await approvePayment("Pagamento aprovado pelo Mercado Pago. Pedido enviado para a loja.");
  } else if (mpStatus === "pending") {
    document.querySelector("#payment-help").textContent = "Pagamento pendente. O pedido ainda nao foi liberado para a loja.";
    renderMercadoPagoWallet();
  } else if (mpStatus === "failure") {
    document.querySelector("#payment-help").textContent = "Pagamento nao aprovado. Tente novamente ou escolha outra forma.";
    renderMercadoPagoWallet();
  } else {
    renderMercadoPagoWallet();
  }
}

initPayment();
