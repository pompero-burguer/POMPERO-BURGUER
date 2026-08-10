const clientState = {
  cart: [],
  pixTimer: null,
  cardForm: null,
  cardOrder: null,
  mpPublicKey: "",
  activeCategory: "artesanais",
};

const DELIVERY_FREE_MINIMUM = 89.9;
const DELIVERY_FEE = 7;
const DELIVERY_CITY = "ourinhos";

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function fullNameIsValid(name) {
  return name
    .split(/\s+/)
    .filter((part) => part.replace(/[^A-Za-zÀ-ÿ]/g, "").length >= 2).length >= 2;
}

function deliveryAddress() {
  const street = qs("#client-street").value.trim();
  const number = qs("#client-number").value.trim();
  const neighborhood = qs("#client-neighborhood").value.trim();
  const city = qs("#client-city").value.trim();
  const complement = qs("#client-complement").value.trim();

  return {
    street,
    number,
    neighborhood,
    city,
    complement,
    formatted: [
      `${street}, ${number}`,
      neighborhood,
      city,
      complement ? `Complemento: ${complement}` : "",
    ]
      .filter(Boolean)
      .join(" - "),
  };
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isDeliveryInOurinhos(address) {
  return normalizeText(address.city) === DELIVERY_CITY;
}

function updateMapsLink() {
  const address = deliveryAddress();
  const query = [address.street, address.number, address.neighborhood, address.city || "Ourinhos", "SP"]
    .filter(Boolean)
    .join(", ");
  qs("#maps-check-link").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function currentTotals() {
  const subtotal = Pompero.subtotal(clientState.cart);
  const couponDiscount = discount();
  const fulfillment = selectedValue("fulfillment");
  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const deliveryFee = fulfillment === "delivery" && afterDiscount > 0 && afterDiscount < DELIVERY_FREE_MINIMUM ? DELIVERY_FEE : 0;

  return {
    subtotal,
    couponDiscount,
    deliveryFee,
    total: afterDiscount + deliveryFee,
  };
}

function categoryFor(item) {
  const id = item.id || "";
  const flavor = normalizeText(item.flavor);
  const name = normalizeText(item.name);

  if (flavor.includes("porcoes") || flavor.includes("porcoes")) return "porcoes";
  if (flavor.includes("alcool")) return "alcool";
  if (flavor.includes("refrigerantes") || name.includes("agua") || name.includes("tubaina")) return "refrigerantes";
  if (flavor.includes("sucos") || name.includes("suco") || name.includes("soda")) return "sucos";
  if (id.startsWith("x-") || id.startsWith("hot-dog")) return "podroes";
  return "artesanais";
}

function renderEntryLinks() {
  const state = Pompero.load();
  const settings = state.settings || {};
  const phone = Pompero.cleanPhone(settings.whatsappPhone) || Pompero.defaultSettings.whatsappPhone;
  const instagram = String(settings.instagramHandle || "").replace(/^@/, "").trim();

  qs("#entry-whatsapp").href = Pompero.whatsappUrl(phone, "Ola! Quero fazer um pedido na Pompero Burguer.");
  qs("#entry-instagram").href = instagram ? `https://www.instagram.com/${instagram}/` : "#";
  qs("#entry-instagram").dataset.configured = instagram ? "true" : "false";
}

function openOrderScreen() {
  document.body.classList.remove("customer-start");
  qs("#order-header").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setCategory(category) {
  clientState.activeCategory = category;
  qsa("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderMenu();
}

function renderMenu() {
  const menu = Pompero.load().menu.filter(
    (item) => item.active !== false && categoryFor(item) === clientState.activeCategory,
  );
  qs("#client-menu").innerHTML = menu
    .map(
      (item) => `
        <article class="menu-item">
          <img src="${item.photo}" alt="Foto do ${item.name}" loading="lazy" />
          <div class="menu-body">
            <h3>${item.name}</h3>
            <span class="price">${Pompero.currency.format(item.price)}</span>
            <small class="badge">${item.flavor || "Hamburguer"}</small>
            <p>${item.description}</p>
            <label>
              Observação
              <textarea rows="1" data-note="${item.id}" placeholder="Ex: sem tomate, molho à parte"></textarea>
            </label>
            <button class="primary-button" type="button" data-add="${item.id}">Adicionar</button>
          </div>
        </article>
      `,
    )
    .join("");

  if (!menu.length) {
    qs("#client-menu").innerHTML = `<div class="empty-state">Nenhum item ativo nesta categoria.</div>`;
  }

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addItem(button.dataset.add));
  });
}

function addBotMessage(text, fromUser = false) {
  const message = document.createElement("div");
  message.className = `bot-message${fromUser ? " user" : ""}`;
  message.textContent = text;
  qs("#bot-messages").append(message);
  qs("#bot-messages").scrollTop = qs("#bot-messages").scrollHeight;
}

function botAnswer(input) {
  const text = input.toLowerCase();

  if (text.includes("cupom") || text === "cupom") {
    return "Use o cupom recebido no WhatsApp. O desconto aparece no total antes de finalizar.";
  }

  if (text.includes("pag") || text.includes("pix") || text.includes("cart")) {
    return "Escolha Realizar pagamento para Pix, credito ou debito. Se escolher Pix, o codigo copia e cola vale por 5 minutos.";
  }

  if (text.includes("entrega") || text.includes("endereco") || text.includes("delivery")) {
    return "Entregamos em Ourinhos. O frete fica grátis acima de R$ 89,90; abaixo disso, entra a taxa de entrega no total.";
  }

  if (text.includes("acompanhar") || text.includes("status")) {
    return "Depois de finalizar, acompanhe as etapas: pedido aceito, em preparação, saiu para entrega ou pronto para retirada.";
  }

  return "Posso ajudar com lanche, entrega, retirada, cupom ou pagamento. O painel foi feito para voce seguir de cima para baixo.";
}

function sendBotMessage(text) {
  const value = text || qs("#bot-input").value.trim();
  if (!value) return;
  addBotMessage(value, true);
  addBotMessage(botAnswer(value));
  qs("#bot-input").value = "";
}

function toggleBot(open) {
  const shouldOpen = typeof open === "boolean" ? open : qs("#ai-assistant").hidden;
  qs("#ai-assistant").hidden = !shouldOpen;
  qs("#bot-toggle").setAttribute("aria-expanded", String(shouldOpen));
}

function addItem(productId) {
  const product = Pompero.load().menu.find((item) => item.id === productId);
  const noteInput = qs(`[data-note="${productId}"]`);

  clientState.cart.push({
    cartId: Pompero.uid(),
    id: product.id,
    name: product.name,
    price: product.price,
    note: noteInput.value.trim(),
    recipe: product.recipe,
  });

  noteInput.value = "";
  renderCart();
}

function removeItem(cartId) {
  clientState.cart = clientState.cart.filter((item) => item.cartId !== cartId);
  renderCart();
}

function discount() {
  const state = Pompero.load();
  return Pompero.discountFor(
    state,
    qs("#client-coupon").value,
    qs("#client-phone").value,
    clientState.cart,
  );
}

function renderCart() {
  qs("#client-empty").hidden = clientState.cart.length > 0;
  qs("#client-cart").innerHTML = clientState.cart
    .map(
      (item) => `
        <div class="cart-row">
          <div class="cart-main">
            <strong>${item.name}</strong>
            <small>${item.note ? `Obs: ${item.note}` : "Sem observação"}</small>
          </div>
          <div class="cart-actions">
            <span class="price">${Pompero.currency.format(item.price)}</span>
            <button class="small-button" type="button" data-remove="${item.cartId}">Remover</button>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeItem(button.dataset.remove));
  });

  const totals = currentTotals();
  qs("#client-subtotal").textContent = Pompero.currency.format(totals.subtotal);
  qs("#client-discount").textContent = Pompero.currency.format(totals.couponDiscount);
  qs("#client-delivery-fee").textContent =
    totals.deliveryFee > 0 ? Pompero.currency.format(totals.deliveryFee) : "Gratis";
  qs("#client-total").textContent = Pompero.currency.format(totals.total);
}

function updateFlowVisibility() {
  const fulfillment = selectedValue("fulfillment");
  const paymentTiming = selectedValue("paymentTiming");
  const onlinePayment = selectedValue("onlinePayment");
  const isPickup = fulfillment === "pickup";
  const isOnline = paymentTiming === "online";
  const isCardPayment = isOnline && (onlinePayment === "credit" || onlinePayment === "debit");

  document.body.classList.toggle("fulfillment-pickup", isPickup);
  document.body.classList.toggle("fulfillment-delivery", !isPickup);
  document.body.classList.toggle("payment-online", isOnline);
  document.body.classList.toggle("payment-pickup", !isOnline);
  document.body.classList.toggle("payment-card", isCardPayment);

  qs("#address-section").hidden = isPickup;
  qs("#online-payment-options").hidden = !isOnline;
  qs("#card-payment-form").hidden = !isCardPayment;
  if (isCardPayment) {
    initCardForm().catch((error) => {
      qs("#card-payment-status").textContent = error.message;
    });
  }

  qsa("#client-street,#client-number,#client-neighborhood,#client-city,#client-complement").forEach((input) => {
    input.disabled = isPickup;
    if (isPickup) input.value = "";
  });

  updateMapsLink();
  renderCart();
}

function paymentDescription() {
  const paymentTiming = selectedValue("paymentTiming");
  if (paymentTiming === "online") {
    const onlinePayment = selectedValue("onlinePayment");
    if (onlinePayment === "pix") return "Pix online";
    if (onlinePayment === "credit") return "Cartão de crédito online";
    return "Cartão de débito online";
  }

  return "Pagar na retirada";
}

function validateOrderBase(name, phone, address, fulfillment) {
  if (!clientState.cart.length) {
    alert("Escolha pelo menos um item.");
    return false;
  }
  if (!fullNameIsValid(name)) {
    alert("Preencha nome completo com nome e sobrenome.");
    qs("#client-name").focus();
    return false;
  }
  if (!phone) {
    alert("Preencha o WhatsApp.");
    qs("#client-phone").focus();
    return false;
  }
  if (fulfillment === "delivery" && (!address.street || !address.number || !address.neighborhood || !address.city)) {
    alert("Preencha rua, número, bairro e cidade para entrega.");
    if (!address.street) qs("#client-street").focus();
    else if (!address.number) qs("#client-number").focus();
    else if (!address.neighborhood) qs("#client-neighborhood").focus();
    else qs("#client-city").focus();
    return false;
  }
  if (fulfillment === "delivery" && !isDeliveryInOurinhos(address)) {
    alert("No momento, a entrega pelo site está disponível somente para Ourinhos.");
    qs("#client-city").focus();
    return false;
  }
  return true;
}

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildOrder() {
  const name = qs("#client-name").value.trim();
  const phone = Pompero.cleanPhone(qs("#client-phone").value);
  const email = qs("#client-email").value.trim();
  const address = deliveryAddress();
  const fulfillment = selectedValue("fulfillment");

  if (!validateOrderBase(name, phone, address, fulfillment)) return null;

  if (selectedValue("paymentTiming") === "online" && !emailIsValid(email)) {
    alert("Preencha um e-mail válido para gerar o pagamento online.");
    qs("#client-email").focus();
    return null;
  }

  const totals = currentTotals();
  const paymentId = Pompero.uid();

  return {
    paymentId,
    id: Pompero.uid(),
    code: Pompero.orderCode(),
    source: fulfillment === "delivery" ? "Site do cliente - Entrega" : "Site do cliente - Retirada",
    status: "Aguardando pagamento",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    customer: name,
    phone,
    email,
    fulfillment,
    address: fulfillment === "delivery" ? address.formatted : "Retirar na loja",
    deliveryAddress: fulfillment === "delivery" ? address : null,
    items: structuredClone(clientState.cart),
    subtotal: totals.subtotal,
    discount: totals.couponDiscount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    couponCode: totals.couponDiscount > 0 ? qs("#client-coupon").value.trim().toUpperCase() : "",
    payment: {
      timing: selectedValue("paymentTiming"),
      method: paymentDescription(),
      received: totals.total,
      status: selectedValue("paymentTiming") === "online" ? "pending" : "pay_on_receive",
    },
  };
}

async function getMercadoPagoPublicKey() {
  if (clientState.mpPublicKey) return clientState.mpPublicKey;
  const response = await fetch("/api/mp/config");
  const config = await response.json();
  if (!config.configured || !config.publicKey) {
    throw new Error("Configure o Mercado Pago no sistema da loja antes de vender online.");
  }
  clientState.mpPublicKey = config.publicKey;
  return clientState.mpPublicKey;
}

async function initCardForm() {
  if (clientState.cardForm) return clientState.cardForm;
  if (!window.MercadoPago) {
    throw new Error("A SDK do Mercado Pago não carregou. Recarregue a página e tente novamente.");
  }

  const publicKey = await getMercadoPagoPublicKey();
  const mp = new MercadoPago(publicKey, { locale: "pt-BR" });
  clientState.cardForm = mp.cardForm({
    amount: "1.00",
    iframe: true,
    form: {
      id: "card-payment-form",
      cardNumber: {
        id: "form-checkout__cardNumber",
        placeholder: "0000 0000 0000 0000",
      },
      expirationDate: {
        id: "form-checkout__expirationDate",
        placeholder: "MM/AA",
      },
      securityCode: {
        id: "form-checkout__securityCode",
        placeholder: "123",
      },
      cardholderName: {
        id: "form-checkout__cardholderName",
        placeholder: "Nome no cartão",
      },
      issuer: {
        id: "form-checkout__issuer",
        placeholder: "Banco emissor",
      },
      installments: {
        id: "form-checkout__installments",
        placeholder: "Parcelas",
      },
      identificationType: {
        id: "form-checkout__identificationType",
        placeholder: "CPF",
      },
      identificationNumber: {
        id: "form-checkout__identificationNumber",
        placeholder: "CPF",
      },
    },
    callbacks: {
      onFormMounted: (error) => {
        if (error) {
          qs("#card-payment-status").textContent = "Não foi possível carregar os campos do cartão.";
          return;
        }
        qs("#card-payment-status").textContent = "Os dados do cartão são protegidos pelo Mercado Pago.";
      },
      onSubmit: async (event) => {
        event.preventDefault();
        await submitCardPayment();
      },
      onFetching: () => {
        qs("#card-payment-status").textContent = "Validando dados do cartão...";
        return () => {
          qs("#card-payment-status").textContent = "Os dados do cartão são protegidos pelo Mercado Pago.";
        };
      },
    },
  });

  return clientState.cardForm;
}

async function createCardPayment(order, cardData) {
  const response = await fetch("/api/mp/process-card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order, card: cardData }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Nao foi possivel processar o cartao.");

  order.mercadoPagoPaymentId = result.paymentId;
  order.payment = {
    ...(order.payment || {}),
    status: result.status,
    statusDetail: result.statusDetail,
  };
  return result;
}

async function createPixPayment(order) {
  const response = await fetch("/api/mp/create-pix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Nao foi possivel gerar o Pix.");

  order.mercadoPagoPaymentId = result.paymentId;
  order.pix = result;
  order.status = "Aguardando pagamento Pix";
  return result;
}

function clearFormAfterOrder() {
  clientState.cart = [];
  qsa("#client-name,#client-phone,#client-email,#client-street,#client-number,#client-neighborhood,#client-city,#client-complement,#client-coupon").forEach((input) => {
    input.value = "";
  });
  renderCart();
}

function savePendingPayment(order) {
  const state = Pompero.load();
  state.pendingPayments.unshift(order);
  Pompero.save(state);
}

function savePayLaterOrder(order) {
  const state = Pompero.load();
  order.status = "Pedido aceito";
  state.pendingOrders.unshift(order);
  Pompero.save(state);
}

function savePaidOrder(order) {
  const state = Pompero.load();
  order.status = "Pago aguardando aceite";
  order.paidAt = order.paidAt || new Date().toISOString();
  order.payment = {
    ...(order.payment || {}),
    status: "approved",
  };
  state.pendingOrders.unshift(order);
  Pompero.save(state);
}

function statusSteps(order, mode = "created") {
  if (order.fulfillment === "pickup") {
    return [
      { label: "Pedido aceito", active: true },
      { label: "Em preparação", active: mode !== "created" },
      { label: "Pronto para retirada", active: false },
    ];
  }

  return [
    { label: "Pedido aceito", active: true },
    { label: "Lanche sendo preparado", active: mode !== "created" },
    { label: "Saiu para entrega", active: false },
  ];
}

function renderOrderProgress(order, mode = "created") {
  qs("#order-progress").innerHTML = statusSteps(order, mode)
    .map(
      (step) => `
        <span class="${step.active ? "active" : ""}">
          ${step.label}
        </span>
      `,
    )
    .join("");
}

function showSuccess(order, options = {}) {
  qs("#client-success").hidden = false;
  qs("#pix-box").hidden = true;
  renderOrderProgress(order, options.mode || "created");
  qs("#tracking-link").href = `acompanhar.html?pedido=${encodeURIComponent(order.code)}`;
  qs("#tracking-link").hidden = false;
  qs("#payment-link").hidden = !options.paymentUrl;
  if (options.paymentUrl) qs("#payment-link").href = options.paymentUrl;
}

function showPix(order, pix) {
  showSuccess(order);
  qs("#pix-box").hidden = false;
  qs("#pix-copy-code").value = pix.qrCode || "";
  qs("#pix-qr-image").hidden = !pix.qrCodeBase64;
  if (pix.qrCodeBase64) qs("#pix-qr-image").src = `data:image/png;base64,${pix.qrCodeBase64}`;
  startPixCountdown(order, pix);
}

function startPixCountdown(order, pix) {
  if (clientState.pixTimer) clearInterval(clientState.pixTimer);
  const expiresAt = Date.now() + 5 * 60 * 1000;

  clientState.pixTimer = setInterval(async () => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    qs("#pix-countdown").textContent = `Validade: ${minutes}:${seconds}`;

    if (pix.paymentId && remaining > 0) {
      const statusResponse = await fetch(`/api/mp/payment-status?id=${encodeURIComponent(pix.paymentId)}&paymentId=${encodeURIComponent(order.paymentId)}`).catch(() => null);
      if (statusResponse?.ok) {
        const status = await statusResponse.json();
        if (status.status === "approved") {
          clearInterval(clientState.pixTimer);
          renderOrderProgress(order, "preparing");
          qs("#pix-countdown").textContent = "Pagamento aprovado. Pedido aceito e sendo preparado.";
          return;
        }
      }
    }

    if (remaining <= 0) {
      clearInterval(clientState.pixTimer);
      await fetch("/api/mp/cancel-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: order.paymentId }),
      }).catch(() => {});
      qs("#pix-countdown").textContent = "Pix vencido. Pedido cancelado.";
    }
  }, 3000);
}

async function sendOrder() {
  const order = buildOrder();
  if (!order) return;

  const paymentTiming = selectedValue("paymentTiming");
  const onlinePayment = selectedValue("onlinePayment");

  try {
    if (paymentTiming === "pickup_pay") {
      if (order.fulfillment !== "pickup") {
        alert("Para entrega, realize o pagamento online antes do pedido chegar ao caixa.");
        return;
      }

      savePayLaterOrder(order);
      showSuccess(order, { mode: "preparing" });
      clearFormAfterOrder();
      alert("Pedido aceito e sendo preparado. O pagamento sera feito ao retirar.");
      return;
    }

    if (onlinePayment === "pix") {
      const pix = await createPixPayment(order);
      savePendingPayment(order);
      showPix(order, pix);
      clearFormAfterOrder();
      return;
    }

    clientState.cardOrder = order;
    qs("#card-payment-status").textContent = "Preencha os dados do cartão e confirme.";
    await initCardForm();
    qs("#card-payment-form").requestSubmit();
  } catch (error) {
    alert(`Erro ao finalizar pedido: ${error.message}`);
  }
}

async function submitCardPayment() {
  const order = clientState.cardOrder || buildOrder();
  if (!order) return;

  try {
    const form = await initCardForm();
    const data = form.getCardFormData();
    const payment = await createCardPayment(order, {
      token: data.token,
      issuerId: data.issuerId,
      paymentMethodId: data.paymentMethodId,
      transactionAmount: Number(data.amount || order.total),
      installments: Number(data.installments || 1),
      description: `Pedido ${order.code}`,
      payer: {
        email: data.cardholderEmail || order.email,
        identification: {
          type: data.identificationType || "CPF",
          number: data.identificationNumber,
        },
      },
    });

    if (payment.status === "approved") {
      order.paidAt = new Date().toISOString();
      savePaidOrder(order);
      showSuccess(order, { mode: "preparing" });
      clearFormAfterOrder();
      qs("#card-payment-status").textContent = "Pagamento aprovado. Pedido aceito e sendo preparado.";
      return;
    }

    if (payment.status === "in_process" || payment.status === "pending") {
      order.status = "Pagamento em analise";
      savePendingPayment(order);
      showSuccess(order);
      clearFormAfterOrder();
      qs("#card-payment-status").textContent = "Pagamento em análise. O pedido será liberado quando for aprovado.";
      return;
    }

    throw new Error(payment.message || "Pagamento recusado. Confira os dados do cartão.");
  } catch (error) {
    qs("#card-payment-status").textContent = error.message;
    alert(`Erro no cartão: ${error.message}`);
  } finally {
    clientState.cardOrder = null;
  }
}

async function initClient() {
  await Pompero.syncFromServer();
  Pompero.applyBrandLogo();
  renderEntryLinks();
  renderMenu();
  renderCart();
  updateFlowVisibility();
  addBotMessage("Oi! Eu sou o Robô Pompero. Escolha uma categoria, monte seu pedido e finalize do jeito que preferir.");

  qs("#start-site-order").addEventListener("click", openOrderScreen);
  qs("#entry-instagram").addEventListener("click", (event) => {
    if (qs("#entry-instagram").dataset.configured === "true") return;
    event.preventDefault();
    alert("Instagram ainda nao configurado no painel da loja.");
  });
  qsa("[data-category]").forEach((button) => {
    button.addEventListener("click", () => setCategory(button.dataset.category));
  });
  qs("#client-send").addEventListener("click", sendOrder);
  qs("#client-clear").addEventListener("click", () => {
    clientState.cart = [];
    renderCart();
  });
  qsa('input[name="fulfillment"], input[name="paymentTiming"], input[name="onlinePayment"]').forEach((input) => {
    input.addEventListener("change", updateFlowVisibility);
  });
  ["#client-coupon", "#client-phone", "#client-city"].forEach((selector) => {
    qs(selector).addEventListener("input", renderCart);
  });
  qsa("#client-street,#client-number,#client-neighborhood,#client-city,#client-complement").forEach((input) => {
    input.addEventListener("input", updateMapsLink);
  });
  qs("#copy-pix-code").addEventListener("click", async () => {
    await navigator.clipboard.writeText(qs("#pix-copy-code").value);
    alert("Codigo Pix copiado.");
  });
  document.querySelectorAll("[data-bot-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendBotMessage(button.dataset.botPrompt));
  });
  qs("#bot-send").addEventListener("click", () => sendBotMessage());
  qs("#bot-toggle").addEventListener("click", () => toggleBot());
  qs("#bot-close").addEventListener("click", () => toggleBot(false));
  qs("#bot-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendBotMessage();
  });
}

initClient();
