const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const menu = [
  {
    id: "salada-burger",
    name: "Salada Burger",
    price: 30.9,
    photo: "assets/lanches/salada-burger.jpg",
    description: "Pão brioche, hambúrguer 170g, queijo, alface, tomate e molho especial.",
    recipe: { pao: 1, carne170: 1, queijo: 1, alface: 1, tomate: 1, fritas: 1 },
  },
  {
    id: "salada-bacon",
    name: "Salada Bacon",
    price: 32.9,
    photo: "assets/lanches/salada-bacon.jpg",
    description: "Pão brioche, hambúrguer 170g, queijo, bacon, salada e molho especial.",
    recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, alface: 1, tomate: 1, fritas: 1 },
  },
  {
    id: "ranch-burger",
    name: "Ranch Burger",
    price: 35.9,
    photo: "assets/lanches/ranch-burger.jpg",
    description: "Queijo, bacon, cebola crispy, alface picado, molho ranch e molho especial.",
    recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, cebolaCrispy: 1, alface: 1, fritas: 1 },
  },
  {
    id: "cheddar-bacon-bbq",
    name: "Cheddar Bacon BBQ",
    price: 32.9,
    photo: "assets/lanches/cheddar-bacon-bbq.jpg",
    description: "Creme de cheddar, bacon, barbecue e molho especial.",
    recipe: { pao: 1, carne170: 1, cheddar: 1, bacon: 1, barbecue: 1, fritas: 1 },
  },
  {
    id: "geleia-bacon",
    name: "Geleia Bacon",
    price: 33.9,
    photo: "assets/lanches/geleia-bacon.jpg",
    description: "Queijo, geleia de bacon, onion rings e molho especial.",
    recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, onionRings: 1, fritas: 1 },
  },
  {
    id: "provobacon-pepper",
    name: "The Provobacon Pepper",
    price: 39,
    photo: "assets/lanches/provobacon-pepper.jpg",
    description: "Hambúrguer 180g, queijo prato, provolone empanado, bacon e geleia de pimenta.",
    recipe: { pao: 1, carne180: 1, queijo: 1, provolone: 1, bacon: 1, geleiaPimenta: 1 },
  },
  {
    id: "smash-duplo-especial",
    name: "The Smash Duplo Especial",
    price: 35,
    photo: "assets/lanches/smash-duplo-especial.jpg",
    description: "Dois smash de 100g, bacon, queijo prato, picles e molho especial.",
    recipe: { pao: 1, carne100: 2, queijo: 2, bacon: 1, picles: 1 },
  },
];

const initialStock = {
  pao: { name: "Pão brioche", unit: "un", qty: 80, min: 18 },
  carne170: { name: "Hambúrguer 170g", unit: "un", qty: 55, min: 12 },
  carne180: { name: "Hambúrguer 180g", unit: "un", qty: 24, min: 8 },
  carne100: { name: "Smash 100g", unit: "un", qty: 70, min: 20 },
  queijo: { name: "Queijo prato", unit: "fatias", qty: 120, min: 25 },
  cheddar: { name: "Creme de cheddar", unit: "porções", qty: 40, min: 10 },
  bacon: { name: "Bacon", unit: "porções", qty: 68, min: 16 },
  alface: { name: "Alface", unit: "porções", qty: 45, min: 10 },
  tomate: { name: "Tomate", unit: "porções", qty: 48, min: 10 },
  cebolaCrispy: { name: "Cebola crispy", unit: "porções", qty: 30, min: 8 },
  onionRings: { name: "Onion rings", unit: "porções", qty: 26, min: 8 },
  provolone: { name: "Provolone empanado", unit: "un", qty: 22, min: 6 },
  geleiaPimenta: { name: "Geleia de pimenta", unit: "porções", qty: 20, min: 6 },
  barbecue: { name: "Molho barbecue", unit: "porções", qty: 36, min: 10 },
  picles: { name: "Picles", unit: "porções", qty: 34, min: 10 },
  fritas: { name: "Fritas", unit: "porções", qty: 90, min: 24 },
};

const state = loadState();

function loadState() {
  const saved = localStorage.getItem("pompero-system-v2") || localStorage.getItem("pompero-system");

  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      cart: parsed.cart || [],
      deliveryCart: parsed.deliveryCart || [],
      pendingOrders: parsed.pendingOrders || [],
      stock: parsed.stock || structuredClone(initialStock),
      sales: parsed.sales || [],
      nfce: parsed.nfce || [],
      messages: parsed.messages || [],
      customers: parsed.customers || {},
      coupons: parsed.coupons || {},
    };
  }

  return {
    cart: [],
    deliveryCart: [],
    pendingOrders: [],
    stock: structuredClone(initialStock),
    sales: [],
    nfce: [],
    messages: [],
    customers: {},
    coupons: {},
  };
}

function saveState() {
  localStorage.setItem("pompero-system-v2", JSON.stringify(state));
}

function qs(selector) {
  return document.querySelector(selector);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanPhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

function customerKey(phone, fallbackName = "") {
  const phoneKey = cleanPhone(phone);
  return phoneKey || fallbackName.trim().toLowerCase() || "cliente-balcao";
}

function switchTab(tab) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tab);
  });
}

function addProductTo(target, productId) {
  const product = menu.find((item) => item.id === productId);
  const noteInput = qs(`[data-note-for="${target}-${productId}"]`);
  const note = noteInput?.value.trim() || "";

  state[target].push({
    cartId: uid(),
    id: product.id,
    name: product.name,
    price: product.price,
    note,
    recipe: product.recipe,
  });

  if (noteInput) noteInput.value = "";
  saveState();
  renderAll();

  if (target === "cart") {
    switchTab("caixa");
  }
}

function removeFrom(target, cartId) {
  state[target] = state[target].filter((item) => item.cartId !== cartId);
  saveState();
  renderAll();
}

function itemsSubtotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

function deliveryDiscount() {
  const couponCode = qs("#delivery-coupon").value.trim().toUpperCase();
  const phone = cleanPhone(qs("#delivery-phone").value);
  const coupon = state.coupons[couponCode];

  if (!coupon) return 0;
  if (coupon.phone && coupon.phone !== phone) return 0;

  return itemsSubtotal(state.deliveryCart) * coupon.percent;
}

function cartTotal() {
  return itemsSubtotal(state.cart);
}

function applyStock(items) {
  items.forEach((item) => {
    Object.entries(item.recipe).forEach(([ingredientId, amount]) => {
      state.stock[ingredientId].qty = Math.max(0, state.stock[ingredientId].qty - amount);
    });
  });
}

function couponForCustomer(customer) {
  const phone = cleanPhone(customer.phone);
  const suffix = phone.slice(-4) || "POMPERO";
  return `POMPERO5-${suffix}`.toUpperCase();
}

function upsertCustomerFromSale(sale) {
  const key = customerKey(sale.phone, sale.customer);
  const current = state.customers[key] || {
    key,
    name: sale.customer || "Cliente",
    phone: cleanPhone(sale.phone),
    orders: [],
    totalSpent: 0,
  };

  current.name = sale.customer || current.name;
  current.phone = cleanPhone(sale.phone) || current.phone;
  current.address = sale.address || current.address || "";
  current.orders.unshift({
    saleId: sale.id,
    date: sale.createdAt,
    items: sale.items.map((item) => item.name),
    total: sale.total,
  });
  current.totalSpent += sale.total;

  const code = couponForCustomer(current);
  current.coupon = code;
  state.customers[key] = current;
  state.coupons[code] = {
    code,
    phone: current.phone,
    percent: 0.05,
    used: false,
    customerKey: key,
    createdAt: new Date().toISOString(),
  };

  return current;
}

function previousOrdersText(customer, excludeSaleId) {
  const orders = (customer?.orders || []).filter((order) => order.saleId !== excludeSaleId).slice(0, 3);

  if (orders.length === 0) {
    return "Como é seu primeiro pedido registrado aqui, já deixamos seu cadastro pronto para os próximos benefícios.";
  }

  return `Vi aqui seus pedidos anteriores: ${orders
    .map((order) => `${order.items.slice(0, 2).join(" + ")} em ${new Date(order.date).toLocaleDateString("pt-BR")}`)
    .join("; ")}.`;
}

function buildCustomerMessage(sale, customer) {
  const couponLine =
    (customer.orders || []).length > 1
      ? `Como você já pediu com a gente antes, liberamos 5% de desconto na próxima compra com o cupom ${customer.coupon}.`
      : `Na próxima compra, use o cupom ${customer.coupon} para ganhar 5% de desconto.`;

  return [
    `Olá${sale.customer ? `, ${sale.customer}` : ""}! Seu pedido na Pompero Burguer foi recebido com carinho.`,
    "",
    `Pedido de hoje: ${sale.items.map((item) => item.name).join(", ")}.`,
    previousOrdersText(customer, sale.id),
    "",
    `Total: ${currency.format(sale.total)}.`,
    `Pagamento: ${sale.payment.method}.`,
    sale.address ? `Entrega: ${sale.address}.` : "Retirada/consumo na loja.",
    couponLine,
    "",
    "Muito obrigado pela preferência. A Pompero agradece e já está preparando tudo por aqui.",
  ].join("\n");
}

function buildPostSaleMessage(customer) {
  return [
    `Olá, ${customer.name}! Passando para agradecer seus pedidos na Pompero Burguer.`,
    "",
    previousOrdersText(customer),
    `Você tem um cupom de 5% para a próxima compra: ${customer.coupon}.`,
    "",
    "Quando bater aquela vontade de burger, é só chamar a gente. Muito obrigado pela preferência!",
  ].join("\n");
}

function registerSale(sale) {
  state.sales.unshift(sale);
  state.nfce.unshift({ saleId: sale.id, status: "Pendente", createdAt: sale.createdAt });
  applyStock(sale.items);

  const customer = upsertCustomerFromSale(sale);

  state.messages.unshift({
    saleId: sale.id,
    phone: cleanPhone(sale.phone),
    text: buildCustomerMessage(sale, customer),
    status: sale.phone ? "Pronta para envio" : "Sem WhatsApp informado",
    createdAt: sale.createdAt,
  });
}

function finishSale() {
  if (state.cart.length === 0) {
    alert("Adicione pelo menos um item antes de finalizar.");
    return;
  }

  const total = cartTotal();
  const received = Number(qs("#amount-received").value || total);
  const sale = {
    id: uid(),
    source: "Balcão",
    status: "Pago",
    createdAt: new Date().toISOString(),
    customer: qs("#customer-name").value.trim(),
    phone: qs("#customer-phone").value.trim(),
    address: "",
    note: qs("#order-note").value.trim(),
    items: structuredClone(state.cart),
    subtotal: total,
    discount: 0,
    total,
    payment: {
      method: qs("#payment-method").value,
      received,
      change: Math.max(0, received - total),
    },
  };

  registerSale(sale);
  buildTicket(sale);
  state.cart = [];
  qs("#customer-name").value = "";
  qs("#customer-phone").value = "";
  qs("#order-note").value = "";
  qs("#amount-received").value = "";
  saveState();
  renderAll();
  window.print();
  switchTab("pagamentos");
}

function sendOnlineOrder() {
  if (state.deliveryCart.length === 0) {
    alert("Escolha pelo menos um item.");
    return;
  }

  const name = qs("#delivery-name").value.trim();
  const phone = cleanPhone(qs("#delivery-phone").value);
  const address = qs("#delivery-address").value.trim();

  if (!name || !phone || !address) {
    alert("Preencha nome, WhatsApp e endereço de entrega.");
    return;
  }

  const couponCode = qs("#delivery-coupon").value.trim().toUpperCase();
  const subtotal = itemsSubtotal(state.deliveryCart);
  const discount = deliveryDiscount();

  state.pendingOrders.unshift({
    id: uid(),
    source: "Delivery site",
    status: "Pago aguardando aceite",
    createdAt: new Date().toISOString(),
    customer: name,
    phone,
    address,
    note: "",
    items: structuredClone(state.deliveryCart),
    subtotal,
    discount,
    total: subtotal - discount,
    couponCode: discount > 0 ? couponCode : "",
    payment: {
      method: qs("#delivery-payment").value,
      received: subtotal - discount,
      change: 0,
    },
  });

  state.deliveryCart = [];
  qs("#delivery-name").value = "";
  qs("#delivery-phone").value = "";
  qs("#delivery-address").value = "";
  qs("#delivery-coupon").value = "";
  saveState();
  renderAll();
  switchTab("caixa");
}

function acceptOnlineOrder(orderId) {
  const order = state.pendingOrders.find((item) => item.id === orderId);
  if (!order) return;

  const sale = {
    ...order,
    id: uid(),
    source: "Delivery aceito",
    status: "Pago",
    acceptedAt: new Date().toISOString(),
  };

  registerSale(sale);
  state.pendingOrders = state.pendingOrders.filter((item) => item.id !== orderId);
  buildTicket(sale);
  saveState();
  renderAll();
  window.print();
  switchTab("pagamentos");
}

function rejectOnlineOrder(orderId) {
  state.pendingOrders = state.pendingOrders.filter((item) => item.id !== orderId);
  saveState();
  renderAll();
}

function clearCart(target) {
  state[target] = [];
  saveState();
  renderAll();
}

function renderMenu(target, containerId, buttonText) {
  qs(containerId).innerHTML = menu
    .map(
      (item) => `
        <article class="menu-item">
          <img src="${item.photo}" alt="Foto do ${item.name}" loading="lazy" />
          <div class="menu-body">
            <h3>${item.name}</h3>
            <span class="price">${currency.format(item.price)}</span>
            <p>${item.description}</p>
            <label>
              Observação
              <textarea rows="1" data-note-for="${target}-${item.id}" placeholder="Ex: sem tomate, molho à parte"></textarea>
            </label>
            <button class="primary-button" type="button" data-add-target="${target}" data-add="${item.id}">${buttonText}</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCartList(target, container, removeAttribute) {
  qs(container).innerHTML = state[target]
    .map(
      (item) => `
        <div class="cart-row">
          <div class="cart-main">
            <strong>${item.name}</strong>
            <small>${item.note ? `Obs: ${item.note}` : "Sem observação"}</small>
          </div>
          <div class="cart-actions">
            <span class="price">${currency.format(item.price)}</span>
            <button class="small-button" type="button" ${removeAttribute}="${item.cartId}">Remover</button>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCarts() {
  qs("#cart-empty").hidden = state.cart.length > 0;
  qs("#delivery-empty").hidden = state.deliveryCart.length > 0;
  renderCartList("cart", "#cart-items", "data-remove-cart");
  renderCartList("deliveryCart", "#delivery-cart", "data-remove-delivery");

  document.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => removeFrom("cart", button.dataset.removeCart));
  });
  document.querySelectorAll("[data-remove-delivery]").forEach((button) => {
    button.addEventListener("click", () => removeFrom("deliveryCart", button.dataset.removeDelivery));
  });

  const subtotal = itemsSubtotal(state.deliveryCart);
  const discount = deliveryDiscount();
  qs("#cart-total").textContent = currency.format(cartTotal());
  qs("#delivery-subtotal").textContent = currency.format(subtotal);
  qs("#delivery-discount").textContent = currency.format(discount);
  qs("#delivery-total").textContent = currency.format(subtotal - discount);
  updateChange();
}

function renderPendingOrders() {
  qs("#pending-empty").hidden = state.pendingOrders.length > 0;
  qs("#pending-orders").innerHTML = state.pendingOrders
    .map(
      (order) => `
        <div class="table-row paid-order">
          <div class="table-main">
            <strong>${order.customer} - ${currency.format(order.total)}</strong>
            <small>${new Date(order.createdAt).toLocaleString("pt-BR")} • ${order.payment.method} • ${order.address}</small>
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
    button.addEventListener("click", () => acceptOnlineOrder(button.dataset.accept));
  });
  document.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectOnlineOrder(button.dataset.reject));
  });
}

function renderStock() {
  qs("#stock-table").innerHTML = Object.entries(state.stock)
    .map(([id, item]) => {
      const low = item.qty <= item.min;
      return `
        <div class="table-row">
          <div class="table-main">
            <strong>${item.name}</strong>
            <small>Mínimo: ${item.min} ${item.unit}</small>
          </div>
          <div class="table-actions">
            <span class="${low ? "stock-low" : "stock-ok"}">${item.qty} ${item.unit}</span>
            <button class="small-button" type="button" data-stock-minus="${id}">-</button>
            <button class="small-button" type="button" data-stock-plus="${id}">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll("[data-stock-minus]").forEach((button) => {
    button.addEventListener("click", () => adjustStock(button.dataset.stockMinus, -1));
  });
  document.querySelectorAll("[data-stock-plus]").forEach((button) => {
    button.addEventListener("click", () => adjustStock(button.dataset.stockPlus, 1));
  });
}

function adjustStock(id, amount) {
  state.stock[id].qty = Math.max(0, state.stock[id].qty + amount);
  saveState();
  renderAll();
}

function renderPayments() {
  qs("#payments-total").textContent = currency.format(
    state.sales.reduce((total, sale) => total + sale.total, 0),
  );
  qs("#payments-list").innerHTML = state.sales.length
    ? state.sales
        .map(
          (sale) => `
            <div class="table-row">
              <div class="table-main">
                <strong>${sale.customer || "Cliente balcão"} - ${currency.format(sale.total)}</strong>
                <small>${new Date(sale.createdAt).toLocaleString("pt-BR")} • ${sale.source} • ${sale.payment.method} • ${sale.items.length} item(ns)</small>
              </div>
              <span class="badge">${sale.status}</span>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Nenhuma venda finalizada ainda.</div>`;
}

function renderNfce() {
  qs("#nfce-list").innerHTML = state.nfce.length
    ? state.nfce
        .map((doc) => {
          const sale = state.sales.find((item) => item.id === doc.saleId);
          return `
            <div class="table-row">
              <div class="table-main">
                <strong>${sale?.customer || "Cliente balcão"} - ${currency.format(sale?.total || 0)}</strong>
                <small>${new Date(doc.createdAt).toLocaleString("pt-BR")} • Venda ${doc.saleId}</small>
              </div>
              <span class="badge">${doc.status}</span>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">Nenhuma NFC-e pendente.</div>`;
}

function renderCrm() {
  const customers = Object.values(state.customers).sort((a, b) => b.orders.length - a.orders.length);

  qs("#crm-list").innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
            <div class="table-row">
              <div class="table-main">
                <strong>${customer.name} • ${customer.orders.length} pedido(s)</strong>
                <small>${customer.phone || "Sem WhatsApp"} • Total: ${currency.format(customer.totalSpent)}</small>
                <small>Últimos: ${customer.orders.slice(0, 3).map((order) => order.items.slice(0, 2).join(" + ")).join("; ")}</small>
                <small>Cupom: <span class="coupon-code">${customer.coupon}</span> • 5% próxima compra</small>
              </div>
              <div class="table-actions">
                <a class="small-button" href="${whatsappUrl({
                  phone: customer.phone,
                  text: buildPostSaleMessage(customer),
                })}" target="_blank" rel="noreferrer">Pós-venda</a>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Finalize pedidos para alimentar o CRM.</div>`;
}

function renderWhatsapp() {
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
                <a class="small-button" href="${whatsappUrl(message)}" target="_blank" rel="noreferrer">Abrir</a>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Aceite ou finalize uma venda para gerar uma resposta automática.</div>`;
}

function whatsappUrl(message) {
  const phone = cleanPhone(message.phone);
  const target = phone ? `55${phone}` : "5514996213006";
  return `https://wa.me/${target}?text=${encodeURIComponent(message.text)}`;
}

function updateSummary() {
  qs("#today-sales").textContent = state.sales.length;
  qs("#pending-count").textContent = state.pendingOrders.length;
  qs("#today-total").textContent = currency.format(
    state.sales.reduce((total, sale) => total + sale.total, 0),
  );
  qs("#stock-alerts").textContent = Object.values(state.stock).filter((item) => item.qty <= item.min).length;
}

function updateChange() {
  const received = Number(qs("#amount-received").value || 0);
  qs("#change-total").textContent = currency.format(Math.max(0, received - cartTotal()));
}

function buildTicket(order = null) {
  const ticketOrder = order || {
    source: "Balcão",
    customer: qs("#customer-name").value.trim(),
    address: "",
    note: qs("#order-note").value.trim(),
    items: state.cart,
    subtotal: cartTotal(),
    discount: 0,
    total: cartTotal(),
    payment: { method: qs("#payment-method").value },
  };

  if (!ticketOrder.items.length) {
    alert("Adicione itens antes de imprimir a comanda.");
    return false;
  }

  qs("#ticket").innerHTML = `
    <h1>Pompero Burguer</h1>
    <div class="meta">Comanda • ${new Date().toLocaleString("pt-BR")}</div>
    <div class="block">
      <strong>${ticketOrder.customer || "Cliente balcão"}</strong>
      <span>${ticketOrder.source || "Pedido"}</span>
      ${ticketOrder.address ? `<small>Entrega: ${ticketOrder.address}</small>` : ""}
      ${ticketOrder.note ? `<small>Obs geral: ${ticketOrder.note}</small>` : ""}
    </div>
    <div class="block">
      ${ticketOrder.items
        .map(
          (item, index) => `
            <div class="line">
              <strong>${index + 1}. ${item.name}</strong>
              <span>${currency.format(item.price)}</span>
              ${item.note ? `<small>Obs: ${item.note}</small>` : ""}
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="block total">
      <strong>Total</strong>
      <strong>${currency.format(ticketOrder.total)}</strong>
    </div>
    <div class="footer">Pedido aceito. Preparar cozinha.</div>
  `;

  return true;
}

function renderAll() {
  renderCarts();
  renderPendingOrders();
  renderStock();
  renderPayments();
  renderNfce();
  renderCrm();
  renderWhatsapp();
  updateSummary();
}

renderMenu("deliveryCart", "#delivery-menu", "Adicionar ao pedido");
renderMenu("cart", "#menu-list", "Adicionar no caixa");

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.querySelectorAll("[data-open-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.openTab));
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => addProductTo(button.dataset.addTarget, button.dataset.add));
});

["#delivery-coupon", "#delivery-phone"].forEach((selector) => {
  qs(selector).addEventListener("input", renderCarts);
});

qs("#amount-received").addEventListener("input", updateChange);
qs("#finish-sale").addEventListener("click", finishSale);
qs("#clear-cart").addEventListener("click", () => clearCart("cart"));
qs("#clear-delivery").addEventListener("click", () => clearCart("deliveryCart"));
qs("#send-online-order").addEventListener("click", sendOnlineOrder);
qs("#print-ticket").addEventListener("click", () => {
  if (buildTicket()) window.print();
});
qs("#reset-stock").addEventListener("click", () => {
  state.stock = structuredClone(initialStock);
  saveState();
  renderAll();
});
qs("#mark-nfce-issued").addEventListener("click", () => {
  state.nfce = state.nfce.map((doc) => ({ ...doc, status: "Emitida" }));
  saveState();
  renderAll();
});
qs("#copy-last-message").addEventListener("click", async () => {
  const message = state.messages[0]?.text;
  if (!message) return alert("Nenhuma mensagem gerada ainda.");
  await navigator.clipboard.writeText(message);
  alert("Mensagem copiada.");
});
qs("#copy-crm-message").addEventListener("click", async () => {
  const customer = Object.values(state.customers)[0];
  if (!customer) return alert("Nenhum cliente no CRM ainda.");
  await navigator.clipboard.writeText(buildPostSaleMessage(customer));
  alert("Mensagem de pós-venda copiada.");
});

renderAll();
