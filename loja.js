let storeCart = [];
let lastStateText = "";
let currentUser = null;

const sessionKey = "pompero-store-session";
const adminTabs = ["produtos", "estoque", "pagamentos", "mercadopago", "nfce", "marca", "equipe"];
const mercadoPagoKey = "pompero-mercado-pago-credentials";

function qs(selector) {
  return document.querySelector(selector);
}

function canAdmin() {
  return currentUser?.role === "admin";
}

function requireAdmin() {
  if (canAdmin()) return true;
  alert("Seu usuÃ¡rio nÃ£o tem permissÃ£o para alterar esta Ã¡rea.");
  return false;
}

function switchTab(tab) {
  if (adminTabs.includes(tab) && !canAdmin()) {
    alert("Este mÃ³dulo Ã© liberado somente para o editor/admin.");
    tab = "caixa";
  }

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tab);
  });
}

function applyPermissions() {
  document.body.classList.toggle("locked", !currentUser);
  document.body.classList.toggle("is-admin", canAdmin());
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.hidden = !canAdmin();
  });
  qs("#session-user").textContent = currentUser
    ? `${currentUser.name} â€¢ ${canAdmin() ? "Editor/admin" : "Colaborador"}`
    : "";

  const activePanel = document.querySelector(".tab-panel.active")?.id;
  if (activePanel && adminTabs.includes(activePanel) && !canAdmin()) {
    switchTab("caixa");
  }
}

async function login(event) {
  event.preventDefault();
  await Pompero.syncFromServer();
  const username = qs("#login-user").value.trim().toLowerCase();
  const password = qs("#login-password").value;
  const user = Pompero.load().users.find(
    (item) => item.active !== false && item.username.toLowerCase() === username && item.password === password,
  );

  if (!user) {
    qs("#login-error").hidden = false;
    return;
  }

  currentUser = { id: user.id, name: user.name, username: user.username, role: user.role };
  sessionStorage.setItem(sessionKey, JSON.stringify(currentUser));
  qs("#login-error").hidden = true;
  qs("#login-password").value = "";
  clearTestSalesOnce();
  applyPermissions();
  renderStoreCart();
  renderAll();
  renderMenu();
  await syncMercadoPagoCredentialsFromLocal();
}

function restoreSession() {
  const saved = sessionStorage.getItem(sessionKey);
  if (!saved) return;
  const session = JSON.parse(saved);
  const user = Pompero.load().users.find((item) => item.active !== false && item.id === session.id);
  if (user) {
    currentUser = { id: user.id, name: user.name, username: user.username, role: user.role };
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem(sessionKey);
  applyPermissions();
}

function clearTestSalesOnce() {
  return;
  const state = Pompero.load();
  state.maintenance = state.maintenance || {};

  if (state.maintenance.testSaleRemoved20260707) return;

  state.sales = [];
  state.nfce = [];
  state.messages = [];
  state.customers = {};
  state.coupons = {};
  state.pendingPayments = [];
  state.pendingOrders = [];
  state.maintenance.testSaleRemoved20260707 = true;
  Pompero.save(state);
}

function renderMenu() {
  const menu = Pompero.load().menu.filter((item) => item.active !== false);
  qs("#store-menu").innerHTML = menu
    .map(
      (item) => `
        <article class="menu-item">
          <img src="${item.photo}" alt="Foto do ${item.name}" loading="lazy" />
          <div class="menu-body">
            <h3>${item.name}</h3>
            <span class="price">${Pompero.currency.format(item.price)}</span>
            <small class="badge">${item.flavor || "HambÃºrguer"}</small>
            <p>${item.description}</p>
            <label>
              ObservaÃ§Ã£o
              <textarea rows="1" data-store-note="${item.id}" placeholder="Ex: sem tomate"></textarea>
            </label>
            <button class="primary-button" type="button" data-store-add="${item.id}">Adicionar no caixa</button>
          </div>
        </article>
      `,
    )
    .join("");

  document.querySelectorAll("[data-store-add]").forEach((button) => {
    button.addEventListener("click", () => addStoreItem(button.dataset.storeAdd));
  });
}

function addStoreItem(productId) {
  const product = Pompero.load().menu.find((item) => item.id === productId);
  const noteInput = qs(`[data-store-note="${productId}"]`);

  storeCart.push({
    cartId: Pompero.uid(),
    id: product.id,
    name: product.name,
    price: product.price,
    note: noteInput.value.trim(),
    recipe: product.recipe,
  });

  noteInput.value = "";
  renderStoreCart();
}

function productSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
}

function defaultRecipe() {
  return { pao: 1, carne170: 1, queijo: 1, fritas: 1 };
}

function clearProductForm() {
  if (!requireAdmin()) return;
  qs("#product-id").value = "";
  qs("#product-name").value = "";
  qs("#product-flavor").value = "";
  qs("#product-price").value = "";
  qs("#product-photo").value = "assets/lanches/salada-burger.jpg";
  qs("#product-description").value = "";
  qs("#product-active").checked = true;
}

function fillProductForm(productId) {
  if (!requireAdmin()) return;
  const product = Pompero.load().menu.find((item) => item.id === productId);
  if (!product) return;

  qs("#product-id").value = product.id;
  qs("#product-name").value = product.name;
  qs("#product-flavor").value = product.flavor || "";
  qs("#product-price").value = product.price;
  qs("#product-photo").value = product.photo;
  qs("#product-description").value = product.description;
  qs("#product-active").checked = product.active !== false;
}

function saveProduct(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const name = qs("#product-name").value.trim();
  const price = Number(qs("#product-price").value);

  if (!name || !price) {
    alert("Preencha nome e preÃ§o do produto.");
    return;
  }

  const state = Pompero.load();
  const currentId = qs("#product-id").value;
  const id = currentId || `${productSlug(name)}-${Pompero.uid().slice(-5)}`;
  const existing = state.menu.find((item) => item.id === id);
  const product = {
    id,
    name,
    flavor: qs("#product-flavor").value.trim() || "HambÃºrguer",
    price,
    photo: qs("#product-photo").value,
    description: qs("#product-description").value.trim(),
    active: qs("#product-active").checked,
    recipe: existing?.recipe || defaultRecipe(),
  };

  if (existing) {
    Object.assign(existing, product);
  } else {
    state.menu.unshift(product);
  }

  Pompero.save(state);
  clearProductForm();
  renderAll();
  renderMenu();
}

function toggleProduct(productId) {
  if (!requireAdmin()) return;
  const state = Pompero.load();
  const product = state.menu.find((item) => item.id === productId);
  if (!product) return;
  product.active = product.active === false;
  Pompero.save(state);
  renderAll();
  renderMenu();
}

function saveProductPrice(productId) {
  if (!requireAdmin()) return;
  const input = document.querySelector(`[data-product-price="${productId}"]`);
  const price = Number(input?.value);

  if (!price || price <= 0) {
    alert("Informe um preÃ§o vÃ¡lido para o lanche.");
    return;
  }

  const state = Pompero.load();
  const product = state.menu.find((item) => item.id === productId);
  if (!product) return;

  product.price = price;
  Pompero.save(state);
  renderAll();
  renderMenu();
}

function renderProducts(state) {
  qs("#product-list").innerHTML = state.menu
    .map(
      (product) => `
        <div class="table-row product-row">
          <div class="table-main">
            <img class="product-thumb" src="${product.photo}" alt="${product.name}" />
            <div>
              <strong>${product.name}</strong>
              <small>${product.flavor || "HambÃºrguer"} â€¢ ${product.active === false ? "Inativo" : "Ativo no cliente"}</small>
              <small>${product.description}</small>
            </div>
          </div>
          <div class="table-actions price-actions">
            <label class="inline-price">
              <span>PreÃ§o</span>
              <input data-product-price="${product.id}" type="number" min="0" step="0.01" value="${product.price}" />
            </label>
            <button class="small-button" type="button" data-edit-product="${product.id}">Editar</button>
            <button class="small-button" type="button" data-save-price="${product.id}">Salvar preÃ§o</button>
            <button class="small-button" type="button" data-toggle-product="${product.id}">
              ${product.active === false ? "Voltar ao cardÃ¡pio" : "Retirar do cardÃ¡pio"}
            </button>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => fillProductForm(button.dataset.editProduct));
  });
  document.querySelectorAll("[data-save-price]").forEach((button) => {
    button.addEventListener("click", () => saveProductPrice(button.dataset.savePrice));
  });
  document.querySelectorAll("[data-toggle-product]").forEach((button) => {
    button.addEventListener("click", () => toggleProduct(button.dataset.toggleProduct));
  });
}

function renderStoreCart() {
  qs("#store-cart-empty").hidden = storeCart.length > 0;
  qs("#store-cart").innerHTML = storeCart
    .map(
      (item) => `
        <div class="cart-row">
          <div class="cart-main">
            <strong>${item.name}</strong>
            <small>${item.note ? `Obs: ${item.note}` : "Sem observaÃ§Ã£o"}</small>
          </div>
          <div class="cart-actions">
            <span class="price">${Pompero.currency.format(item.price)}</span>
            <button class="small-button" type="button" data-store-remove="${item.cartId}">Remover</button>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-store-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      storeCart = storeCart.filter((item) => item.cartId !== button.dataset.storeRemove);
      renderStoreCart();
    });
  });

  qs("#store-total").textContent = Pompero.currency.format(Pompero.subtotal(storeCart));
}

function buildTicket(order) {
  qs("#ticket").innerHTML = `
    <h1>Pompero Burguer</h1>
    <div class="meta">Comanda â€¢ ${new Date().toLocaleString("pt-BR")}</div>
    <div class="block">
      ${order.code ? `<strong>${order.code}</strong>` : ""}
      <strong>${order.customer || "Cliente balcÃ£o"}</strong>
      <span>${order.source}</span>
      ${order.address ? `<small>Entrega: ${order.address}</small>` : ""}
    </div>
    <div class="block">
      ${order.items
        .map(
          (item, index) => `
            <div class="line">
              <strong>${index + 1}. ${item.name}</strong>
              <span>${Pompero.currency.format(item.price)}</span>
              ${item.note ? `<small>Obs: ${item.note}</small>` : ""}
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="block total">
      <strong>Total</strong>
      <strong>${Pompero.currency.format(order.total)}</strong>
    </div>
    <div class="footer">Pedido aceito. Preparar cozinha.</div>
  `;
}

function acceptOrder(orderId) {
  const state = Pompero.load();
  const order = state.pendingOrders.find((item) => item.id === orderId);
  if (!order) return;

  const sale = {
    ...order,
    id: Pompero.uid(),
    source: order.fulfillment === "pickup" ? "Retirada" : "Delivery",
    status: "Pedido aceito",
    acceptedAt: new Date().toISOString(),
  };

  Pompero.registerSale(state, sale);
  state.pendingOrders = state.pendingOrders.filter((item) => item.id !== orderId);
  Pompero.save(state);
  buildTicket(sale);
  renderAll();
  window.print();
}

function rejectOrder(orderId) {
  const state = Pompero.load();
  state.pendingOrders = state.pendingOrders.filter((item) => item.id !== orderId);
  Pompero.save(state);
  renderAll();
}

function isDeliveryOrder(sale) {
  return sale.fulfillment === "delivery" || String(sale.source || "").toLowerCase().includes("delivery");
}

function orderFlow(sale) {
  return isDeliveryOrder(sale)
    ? ["Pedido aceito", "Em preparaÃ§Ã£o", "Saiu para entrega", "Pedido finalizado"]
    : ["Pedido aceito", "Em preparaÃ§Ã£o", "Pedido pronto", "Pedido finalizado"];
}

function advanceStatus(saleId) {
  const state = Pompero.load();
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale) return;

  const flow = orderFlow(sale);
  const index = flow.indexOf(sale.status);
  sale.status = flow[Math.min(Math.max(index, 0) + 1, flow.length - 1)];
  Pompero.save(state);
  renderAll();
}

function finishStoreSale() {
  if (!storeCart.length) {
    alert("Adicione pelo menos um item.");
    return;
  }

  const state = Pompero.load();
  const total = Pompero.subtotal(storeCart);
  const sale = {
    id: Pompero.uid(),
    source: "BalcÃ£o",
    status: "Pedido aceito",
    createdAt: new Date().toISOString(),
    customer: qs("#store-name").value.trim(),
    phone: qs("#store-phone").value.trim(),
    address: "",
    items: structuredClone(storeCart),
    subtotal: total,
    discount: 0,
    total,
    payment: {
      method: qs("#store-payment").value,
      received: total,
      change: 0,
    },
  };

  Pompero.registerSale(state, sale);
  Pompero.save(state);
  buildTicket(sale);
  storeCart = [];
  qs("#store-name").value = "";
  qs("#store-phone").value = "";
  renderStoreCart();
  renderAll();
  window.print();
}

function isPaidOrder(order) {
  const isPickupPayLater =
    order?.fulfillment === "pickup" &&
    (order?.payment?.status === "pay_on_receive" || order?.payment?.timing === "pickup_pay");

  return Boolean(
    isPickupPayLater ||
      order?.paidAt ||
      order?.payment?.status === "approved" ||
      String(order?.status || "").toLowerCase().includes("pago"),
  );
}

function renderPending(state) {
  const paidPendingOrders = state.pendingOrders.filter(isPaidOrder);
  qs("#pending-empty").hidden = paidPendingOrders.length > 0;
  qs("#pending-orders").innerHTML = paidPendingOrders
    .map(
      (order) => `
        <div class="table-row paid-order">
          <div class="table-main">
            <strong>${order.customer} - ${Pompero.currency.format(order.total)}</strong>
            <small>${new Date(order.createdAt).toLocaleString("pt-BR")} â€¢ ${order.payment.method} â€¢ ${order.address}</small>
            <small>${order.items.map((item) => item.name).join(", ")}</small>
          </div>
          <div class="table-actions">
            <span class="badge">${order.status}</span>
            <button class="primary-button" type="button" data-accept="${order.id}">Aceitar e imprimir</button>
            <button class="danger-button" type="button" data-reject="${order.id}">Recusar</button>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-accept]").forEach((button) => {
    button.addEventListener("click", () => acceptOrder(button.dataset.accept));
  });
  document.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectOrder(button.dataset.reject));
  });
}

function renderProcessCard(sale) {
  const flow = orderFlow(sale);
  const currentIndex = flow.indexOf(sale.status);
  const nextLabel = flow[Math.min(Math.max(currentIndex, 0) + 1, flow.length - 1)];
  const canAdvance = sale.status !== "Pedido finalizado";

  return `
    <article class="process-card">
      <strong>${sale.code ? `${sale.code} â€¢ ` : ""}${sale.customer || "Cliente"}</strong>
      <small>${sale.source || "Pedido"} â€¢ ${Pompero.currency.format(sale.total)}</small>
      <small>${sale.items.map((item) => item.name).join(", ")}</small>
      <span class="badge">${sale.status}</span>
      ${canAdvance ? `<button class="small-button" type="button" data-process-next="${sale.id}">Mover para: ${nextLabel}</button>` : ""}
    </article>
  `;
}

function renderProcessBoard(state) {
  const columns = [
    { title: "Pedido aceito", matches: (sale) => sale.status === "Pedido aceito" },
    { title: "Em preparaÃ§Ã£o", matches: (sale) => sale.status === "Em preparaÃ§Ã£o" },
    { title: "Pronto / saiu para entrega", matches: (sale) => sale.status === "Pedido pronto" || sale.status === "Saiu para entrega" },
    { title: "Finalizados", matches: (sale) => sale.status === "Pedido finalizado" },
  ];

  qs("#process-board").innerHTML = columns
    .map((column) => {
      const items = state.sales.filter(column.matches).slice(0, 12);
      return `
        <section class="process-column">
          <h3>${column.title}</h3>
          ${items.length ? items.map(renderProcessCard).join("") : `<div class="empty-state">Sem pedidos nesta etapa.</div>`}
        </section>
      `;
    })
    .join("");

  document.querySelectorAll("[data-process-next]").forEach((button) => {
    button.addEventListener("click", () => advanceStatus(button.dataset.processNext));
  });
}

function renderPaymentWatch(state) {
  qs("#payment-watch-empty").hidden = true;
  qs("#payment-watch").hidden = true;
  qs("#payment-watch").innerHTML = "";
}

function renderStock(state) {
  qs("#stock-table").innerHTML = Object.entries(state.stock)
    .map(([id, item]) => {
      const low = item.qty <= item.min;
      return `
        <div class="table-row">
          <div class="table-main">
            <strong>${item.name}</strong>
            <small>MÃ­nimo: ${formatKg(item.min)} kg</small>
          </div>
          <div class="table-actions stock-actions">
            <label class="inline-price">
              <span>Saldo kg</span>
              <input data-stock-qty="${id}" type="number" min="0" step="0.001" value="${item.qty}" />
            </label>
            <label class="inline-price">
              <span>MÃ­n. kg</span>
              <input data-stock-min="${id}" type="number" min="0" step="0.001" value="${item.min}" />
            </label>
            <span class="${low ? "stock-low" : "stock-ok"}">${formatKg(item.qty)} kg</span>
            <button class="small-button" type="button" data-stock-save="${id}">Salvar</button>
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll("[data-stock-save]").forEach((button) => {
    button.addEventListener("click", () => saveStockItem(button.dataset.stockSave));
  });
}

function formatKg(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function saveStockItem(id) {
  if (!requireAdmin()) return;
  const state = Pompero.load();
  const qty = Number(document.querySelector(`[data-stock-qty="${id}"]`)?.value);
  const min = Number(document.querySelector(`[data-stock-min="${id}"]`)?.value);

  if (Number.isNaN(qty) || Number.isNaN(min) || qty < 0 || min < 0) {
    alert("Informe valores vÃ¡lidos em kg.");
    return;
  }

  state.stock[id].qty = Number(qty.toFixed(3));
  state.stock[id].min = Number(min.toFixed(3));
  state.stock[id].unit = "kg";
  Pompero.save(state);
  renderAll();
}

function renderPayments(state) {
  qs("#payments-total").textContent = Pompero.currency.format(
    state.sales.reduce((total, sale) => total + sale.total, 0),
  );
  qs("#payments-list").innerHTML = state.sales.length
    ? state.sales
        .map(
          (sale) => `
            <div class="table-row">
              <div class="table-main">
                <strong>${sale.code ? `${sale.code} â€¢ ` : ""}${sale.customer || "Cliente balcÃ£o"} - ${Pompero.currency.format(sale.total)}</strong>
                <small>${new Date(sale.createdAt).toLocaleString("pt-BR")} â€¢ ${sale.source} â€¢ ${sale.payment.method}</small>
              </div>
              <div class="table-actions">
                <span class="badge">${sale.status}</span>
                ${sale.status !== "Pedido finalizado" ? `<button class="small-button" type="button" data-next-status="${sale.id}">AvanÃ§ar etapa</button>` : ""}
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Nenhuma venda finalizada ainda.</div>`;

  document.querySelectorAll("[data-next-status]").forEach((button) => {
    button.addEventListener("click", () => advanceStatus(button.dataset.nextStatus));
  });
}

function mercadoPagoCredentials() {
  return JSON.parse(localStorage.getItem(mercadoPagoKey) || "{}");
}

async function fetchMercadoPagoConfig() {
  const response = await fetch("/api/mp/config");
  if (!response.ok) return null;
  return response.json();
}

async function syncMercadoPagoCredentialsFromLocal() {
  if (!canAdmin()) return;

  const localCredentials = mercadoPagoCredentials();
  if (!localCredentials.publicKey || !localCredentials.accessToken) return;

  try {
    const backendConfig = await fetchMercadoPagoConfig();
    if (backendConfig?.configured) {
      localStorage.setItem(
        mercadoPagoKey,
        JSON.stringify({
          ...localCredentials,
          publicKey: backendConfig.publicKey || localCredentials.publicKey,
          applicationId: backendConfig.applicationId || localCredentials.applicationId || "",
          userId: backendConfig.userId || localCredentials.userId || "",
          testUser: backendConfig.testUser || localCredentials.testUser || "",
          verificationCode: backendConfig.verificationCode || localCredentials.verificationCode || "",
          syncedAt: backendConfig.updatedAt || localCredentials.syncedAt || new Date().toISOString(),
        }),
      );
      renderMercadoPagoCredentials();
      return;
    }

    const response = await fetch("/api/mp/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localCredentials),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Falha ao sincronizar Mercado Pago.");

    localStorage.setItem(
      mercadoPagoKey,
      JSON.stringify({
        ...localCredentials,
        syncedAt: result.updatedAt || new Date().toISOString(),
      }),
    );
    renderMercadoPagoCredentials();
  } catch (error) {
    console.warn("Mercado Pago nao sincronizado:", error);
  }
}

function maskSecret(value) {
  if (!value) return "NÃ£o informado";
  if (value.length <= 12) return "â€¢â€¢â€¢â€¢â€¢â€¢";
  return `${value.slice(0, 6)}â€¢â€¢â€¢â€¢â€¢â€¢${value.slice(-4)}`;
}

function renderMercadoPagoCredentials() {
  const credentials = mercadoPagoCredentials();
  qs("#mp-public-key").value = credentials.publicKey || "";
  qs("#mp-application-id").value = credentials.applicationId || "";
  qs("#mp-user-id").value = credentials.userId || "";
  qs("#mp-test-user").value = credentials.testUser || "";
  qs("#mp-test-password").value = "";
  qs("#mp-verification-code").value = credentials.verificationCode || "";
  qs("#mp-access-token").value = "";
  qs("#mp-credentials-list").innerHTML = `
    <div class="table-row">
      <div class="table-main">
        <strong>Public Key</strong>
        <small>${credentials.publicKey || "NÃ£o informada"}</small>
      </div>
      <div class="table-actions">
        ${credentials.publicKey ? `<button class="small-button" type="button" data-copy-mp="publicKey">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Access Token</strong>
        <small>${maskSecret(credentials.accessToken)}</small>
      </div>
      <div class="table-actions">
        ${credentials.accessToken ? `<button class="small-button" type="button" data-copy-mp="accessToken">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Numero de aplicacao</strong>
        <small>${credentials.applicationId || "Nao informado"}</small>
      </div>
      <div class="table-actions">
        ${credentials.applicationId ? `<button class="small-button" type="button" data-copy-mp="applicationId">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>User ID</strong>
        <small>${credentials.userId || "Nao informado"}</small>
      </div>
      <div class="table-actions">
        ${credentials.userId ? `<button class="small-button" type="button" data-copy-mp="userId">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Usuario da conta</strong>
        <small>${credentials.testUser || "Nao informado"}</small>
      </div>
      <div class="table-actions">
        ${credentials.testUser ? `<button class="small-button" type="button" data-copy-mp="testUser">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Senha da conta</strong>
        <small>${maskSecret(credentials.testPassword)}</small>
      </div>
      <div class="table-actions">
        ${credentials.testPassword ? `<button class="small-button" type="button" data-copy-mp="testPassword">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Codigo de verificacao</strong>
        <small>${credentials.verificationCode || "Nao informado"}</small>
      </div>
      <div class="table-actions">
        ${credentials.verificationCode ? `<button class="small-button" type="button" data-copy-mp="verificationCode">Copiar</button>` : ""}
      </div>
    </div>
    <div class="table-row">
      <div class="table-main">
        <strong>Status do backend</strong>
        <small>${credentials.syncedAt ? `Conectado em ${new Date(credentials.syncedAt).toLocaleString("pt-BR")}` : "Ainda nao enviado ao servidor"}</small>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-copy-mp]").forEach((button) => {
    button.addEventListener("click", async () => {
      const current = mercadoPagoCredentials();
      await navigator.clipboard.writeText(current[button.dataset.copyMp] || "");
      alert("Credencial copiada.");
    });
  });
}

async function saveMercadoPagoCredentials(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const current = mercadoPagoCredentials();
  const publicKey = qs("#mp-public-key").value.trim();
  const accessTokenInput = qs("#mp-access-token").value.trim();
  const testPasswordInput = qs("#mp-test-password").value.trim();
  const next = {
    publicKey,
    accessToken: accessTokenInput || current.accessToken || "",
    applicationId: qs("#mp-application-id").value.trim(),
    userId: qs("#mp-user-id").value.trim(),
    testUser: qs("#mp-test-user").value.trim(),
    testPassword: testPasswordInput || current.testPassword || "",
    verificationCode: qs("#mp-verification-code").value.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (!next.publicKey || !next.accessToken) {
    alert("Preencha Public Key e Access Token.");
    return;
  }

  try {
    const response = await fetch("/api/mp/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(next),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Nao foi possivel salvar no backend.");
    }

    localStorage.setItem(
      mercadoPagoKey,
      JSON.stringify({
        ...next,
        accessToken: next.accessToken,
        syncedAt: result.updatedAt || next.updatedAt,
      }),
    );
    renderMercadoPagoCredentials();
    alert("Credenciais salvas no backend. O site do cliente ja pode gerar checkout real.");
  } catch (error) {
    alert(`Erro ao salvar Mercado Pago: ${error.message}`);
  }
}

async function testMercadoPagoPix() {
  if (!requireAdmin()) return;

  const resultBox = qs("#mp-pix-test-result");
  resultBox.hidden = false;
  resultBox.textContent = "Testando Pix Mercado Pago...";

  try {
    const response = await fetch("/api/mp/test-pix", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Falha ao testar Pix.");

    resultBox.textContent = `Pix API funcionando. Status: ${result.status}. QR Code: ${result.hasQrCode ? "gerado" : "nao gerado"}.`;
  } catch (error) {
    resultBox.textContent = `Erro no Pix Mercado Pago: ${error.message}`;
  }
}

function renderKitchen(state) {
  const activeOrders = state.sales.filter(
    (sale) => sale.status !== "Pedido finalizado",
  );

  qs("#kitchen-empty").hidden = activeOrders.length > 0;
  qs("#kitchen-board").innerHTML = activeOrders
    .map(
      (sale) => `
        <article class="kitchen-card">
          <div>
            <p class="eyebrow">${sale.code || "Pedido"}</p>
            <h3>${sale.customer || "Cliente delivery"}</h3>
          </div>
          <div class="kitchen-meta">
            <span class="badge">${sale.status}</span>
            <span class="badge">${new Date(sale.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <ul>
            ${sale.items
              .map((item) => `<li>${item.name}${item.note ? ` - ${item.note}` : ""}</li>`)
              .join("")}
          </ul>
          ${sale.address ? `<p class="empty-state">${sale.address}</p>` : ""}
          <button class="primary-button" type="button" data-next-status="${sale.id}">AvanÃ§ar status</button>
        </article>
      `,
    )
    .join("");

  document.querySelectorAll("#kitchen-board [data-next-status]").forEach((button) => {
    button.addEventListener("click", () => advanceStatus(button.dataset.nextStatus));
  });
}

function renderCrm(state) {
  const customers = Object.values(state.customers).sort((a, b) => b.orders.length - a.orders.length);
  qs("#crm-list").innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
            <div class="table-row">
              <div class="table-main">
                <strong>${customer.name} â€¢ ${customer.orders.length} pedido(s)</strong>
                <small>${customer.phone || "Sem WhatsApp"} â€¢ Total: ${Pompero.currency.format(customer.totalSpent)}</small>
                <small>Ãšltimos: ${customer.orders.slice(0, 3).map((order) => order.items.slice(0, 2).join(" + ")).join("; ")}</small>
                <small>Cupom: <span class="coupon-code">${customer.coupon}</span> â€¢ 5% prÃ³xima compra</small>
              </div>
              <div class="table-actions">
                <a class="small-button" href="${Pompero.whatsappUrl(customer.phone, Pompero.postSaleMessage(customer))}" target="_blank" rel="noreferrer">PÃ³s-venda</a>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Clientes aparecem aqui apÃ³s vendas.</div>`;
}

function renderNfce(state) {
  qs("#nfce-list").innerHTML = state.nfce.length
    ? state.nfce
        .map((doc) => {
          const sale = state.sales.find((item) => item.id === doc.saleId);
          return `
            <div class="table-row">
              <div class="table-main">
                <strong>${sale?.customer || "Cliente balcÃ£o"} - ${Pompero.currency.format(sale?.total || 0)}</strong>
                <small>${new Date(doc.createdAt).toLocaleString("pt-BR")} â€¢ Venda ${doc.saleId}</small>
              </div>
              <span class="badge">${doc.status}</span>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">Nenhuma NFC-e pendente.</div>`;
}

function renderWhatsapp(state) {
  qs("#settings-whatsapp").value = state.settings?.whatsappPhone || "";
  qs("#settings-instagram").value = state.settings?.instagramHandle || "";
  qs("#whatsapp-list").innerHTML = state.messages.length
    ? state.messages
        .map(
          (message) => `
            <div class="message-row">
              <div class="message-main">
                <strong>${message.phone || "Sem telefone"}</strong>
                <small>${message.text.replace(/\n/g, "<br />")}</small>
              </div>
              <div class="table-actions">
                <span class="badge">${message.status}</span>
                <a class="small-button" href="${Pompero.whatsappUrl(message.phone, message.text)}" target="_blank" rel="noreferrer">Abrir</a>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Mensagens aparecem após aceitar/finalizar vendas.</div>`;
}

function renderBrandSettings(state) {
  const logoUrl = state.settings?.logoUrl || Pompero.defaultSettings.logoUrl;
  qs("#settings-logo-url").value = logoUrl;
  qs("#settings-logo-preview").src = logoUrl;
}

async function saveBrandSettings(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const state = Pompero.load();
  state.settings = {
    ...(state.settings || {}),
    logoUrl: qs("#settings-logo-url").value.trim() || Pompero.defaultSettings.logoUrl,
    logoUpdatedAt: new Date().toISOString(),
  };
  const savedOnServer = await Pompero.save(state);
  renderAll();
  if (!savedOnServer) {
    alert("A logo mudou neste navegador, mas não salvou no servidor. Tente uma imagem menor ou um link de imagem.");
    return;
  }
  alert("Logo fixa salva para todas as páginas.");
}

async function saveContactSettings(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const state = Pompero.load();
  state.settings = {
    ...(state.settings || {}),
    whatsappPhone: Pompero.cleanPhone(qs("#settings-whatsapp").value) || Pompero.defaultSettings.whatsappPhone,
    instagramHandle: qs("#settings-instagram").value.trim().replace(/^@/, ""),
  };
  const savedOnServer = await Pompero.save(state);
  renderAll();
  if (!savedOnServer) {
    alert("Os contatos mudaram neste navegador, mas não salvaram no servidor. Tente novamente.");
    return;
  }
  alert("Contatos salvos para a tela inicial e mensagens.");
}

function clearUserForm() {
  if (!requireAdmin()) return;
  qs("#user-id").value = "";
  qs("#user-name").value = "";
  qs("#user-username").value = "";
  qs("#user-password").value = "";
  qs("#user-role").value = "operator";
  qs("#user-active").checked = true;
}

function fillUserForm(userId) {
  if (!requireAdmin()) return;
  const user = Pompero.load().users.find((item) => item.id === userId);
  if (!user) return;

  qs("#user-id").value = user.id;
  qs("#user-name").value = user.name;
  qs("#user-username").value = user.username;
  qs("#user-password").value = user.password;
  qs("#user-role").value = user.role;
  qs("#user-active").checked = user.active !== false;
}

function saveUser(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const name = qs("#user-name").value.trim();
  const username = qs("#user-username").value.trim().toLowerCase();
  const password = qs("#user-password").value.trim();

  if (!name || !username || !password) {
    alert("Preencha nome, usuÃ¡rio e senha.");
    return;
  }

  const state = Pompero.load();
  const currentId = qs("#user-id").value;
  const duplicated = state.users.some((user) => user.username === username && user.id !== currentId);
  if (duplicated) {
    alert("JÃ¡ existe um usuÃ¡rio com este login.");
    return;
  }

  const user = {
    id: currentId || `user-${Pompero.uid().slice(-6)}`,
    name,
    username,
    password,
    role: qs("#user-role").value,
    active: qs("#user-active").checked,
  };

  const existing = state.users.find((item) => item.id === user.id);
  if (existing) {
    Object.assign(existing, user);
  } else {
    state.users.push(user);
  }

  Pompero.save(state);
  clearUserForm();
  renderAll();
}

function renderUsers(state) {
  const usersList = qs("#users-list");
  if (!usersList) return;

  usersList.innerHTML = state.users
    .map(
      (user) => `
        <div class="table-row">
          <div class="table-main">
            <strong>${user.name}</strong>
            <small>${user.username} â€¢ ${user.role === "admin" ? "Editor/admin" : "Colaborador"} â€¢ ${user.active === false ? "Inativo" : "Ativo"}</small>
            <small>${user.role === "admin" ? "Acesso total." : "Sem acesso a cardÃ¡pio, formas de pagamento, fiscal, equipe e estoque."}</small>
          </div>
          <div class="table-actions">
            <button class="small-button" type="button" data-edit-user="${user.id}">Editar</button>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => fillUserForm(button.dataset.editUser));
  });
}

function renderSummary(state) {
  qs("#today-sales").textContent = state.sales.length;
  qs("#pending-count").textContent = state.pendingOrders.filter(isPaidOrder).length;
  qs("#payment-count").textContent = state.pendingPayments.length;
  qs("#today-total").textContent = Pompero.currency.format(
    state.sales.reduce((total, sale) => total + sale.total, 0),
  );
  qs("#stock-alerts").textContent = Object.values(state.stock).filter((item) => item.qty <= item.min).length;
}

function renderAll() {
  const state = Pompero.load();
  Pompero.applyBrandLogo(state);
  renderProcessBoard(state);
  renderPending(state);
  renderPaymentWatch(state);
  renderKitchen(state);
  renderProducts(state);
  renderStock(state);
  renderPayments(state);
  renderCrm(state);
  renderNfce(state);
  renderBrandSettings(state);
  renderWhatsapp(state);
  renderUsers(state);
  renderMercadoPagoCredentials();
  renderSummary(state);
}

async function bootStore() {
  await Pompero.syncFromServer();
  Pompero.applyBrandLogo();
  restoreSession();
  clearTestSalesOnce();
  applyPermissions();
  if (currentUser) {
    renderMenu();
    renderStoreCart();
    renderAll();
    syncMercadoPagoCredentialsFromLocal();
  }
}

bootStore();

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});
document.querySelectorAll("[data-open-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.openTab));
});

qs("#login-form").addEventListener("submit", login);
qs("#logout-button").addEventListener("click", logout);
qs("#store-finish").addEventListener("click", finishStoreSale);
qs("#store-clear").addEventListener("click", () => {
  storeCart = [];
  renderStoreCart();
});
qs("#print-ticket").addEventListener("click", () => {
  if (!storeCart.length) return alert("Adicione itens antes de imprimir.");
  buildTicket({
    source: "BalcÃ£o",
    customer: qs("#store-name").value.trim(),
    address: "",
    items: storeCart,
    total: Pompero.subtotal(storeCart),
  });
  window.print();
});
qs("#refresh-store").addEventListener("click", renderAll);
qs("#refresh-kitchen").addEventListener("click", renderAll);
qs("#product-form").addEventListener("submit", saveProduct);
qs("#new-product").addEventListener("click", clearProductForm);
qs("#user-form").addEventListener("submit", saveUser);
qs("#new-user").addEventListener("click", clearUserForm);
qs("#mp-form").addEventListener("submit", saveMercadoPagoCredentials);
qs("#test-mp-pix").addEventListener("click", testMercadoPagoPix);
qs("#brand-settings-form").addEventListener("submit", saveBrandSettings);
qs("#contact-settings-form").addEventListener("submit", saveContactSettings);
qs("#settings-logo-url").addEventListener("input", () => {
  qs("#settings-logo-preview").src = qs("#settings-logo-url").value.trim() || Pompero.defaultSettings.logoUrl;
});
qs("#settings-logo-file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Escolha um arquivo de imagem.");
    event.target.value = "";
    return;
  }
  if (file.size > 900 * 1024) {
    alert("A imagem precisa ter menos de 900 KB para salvar no sistema.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    qs("#settings-logo-url").value = reader.result;
    qs("#settings-logo-preview").src = reader.result;
  });
  reader.readAsDataURL(file);
});
qs("#reset-stock").addEventListener("click", () => {
  if (!requireAdmin()) return;
  const state = Pompero.load();
  state.stock = structuredClone(Pompero.initialStock);
  Pompero.save(state);
  renderAll();
});
qs("#mark-nfce-issued").addEventListener("click", () => {
  if (!requireAdmin()) return;
  const state = Pompero.load();
  state.nfce = state.nfce.map((doc) => ({ ...doc, status: "Emitida" }));
  Pompero.save(state);
  renderAll();
});
qs("#copy-last-message").addEventListener("click", async () => {
  const message = Pompero.load().messages[0]?.text;
  if (!message) return alert("Nenhuma mensagem ainda.");
  await navigator.clipboard.writeText(message);
  alert("Mensagem copiada.");
});
qs("#copy-crm-message").addEventListener("click", async () => {
  const customer = Object.values(Pompero.load().customers)[0];
  if (!customer) return alert("Nenhum cliente ainda.");
  await navigator.clipboard.writeText(Pompero.postSaleMessage(customer));
  alert("Mensagem de pÃ³s-venda copiada.");
});

setInterval(async () => {
  if (!currentUser) return;
  await Pompero.syncFromServer();
  const current = JSON.stringify(Pompero.load().pendingOrders);
  if (current !== lastStateText) {
    lastStateText = current;
    renderAll();
  }
}, 1500);

