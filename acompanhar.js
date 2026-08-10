const params = new URLSearchParams(window.location.search);
const initialCode = params.get("pedido") || "";
const input = document.querySelector("#track-code");
const result = document.querySelector("#tracking-result");

input.value = initialCode;
Pompero.applyBrandLogo();

function findOrder(code) {
  const state = Pompero.load();
  const normalized = code.trim().toUpperCase();
  const collections = [...state.pendingPayments, ...state.pendingOrders, ...state.sales];

  return collections.find((order) => order.code === normalized);
}

async function renderStatus() {
  await Pompero.syncFromServer();
  Pompero.applyBrandLogo();
  const order = findOrder(input.value);

  if (!order) {
    result.innerHTML = `<div class="empty-state">Pedido não encontrado. Confira o código informado.</div>`;
    return;
  }

  result.innerHTML = `
    <div class="table-main">
      <strong>${order.code} • ${order.status}</strong>
      <small>${order.customer}</small>
      <small>${order.items.map((item) => item.name).join(", ")}</small>
      <small>Total: ${Pompero.currency.format(order.total)}</small>
      ${order.address ? `<small>Entrega: ${order.address}</small>` : ""}
    </div>
  `;
}

async function initTracking() {
  await Pompero.syncFromServer();
  Pompero.applyBrandLogo();

  if (initialCode) {
    renderStatus();
  }
}

document.querySelector("#track-button").addEventListener("click", renderStatus);
initTracking();

setInterval(() => {
  if (input.value.trim()) {
    renderStatus();
  }
}, 3000);
