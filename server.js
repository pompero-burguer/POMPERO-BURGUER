const http = require("http");
const fs = require("fs");
const path = require("path");
const { MercadoPagoConfig, Payment, Preference } = require("mercadopago");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : root;
fs.mkdirSync(dataDir, { recursive: true });
const configPath = path.join(dataDir, "mp-config.local.json");
const statePath = path.join(dataDir, "pompero-state.local.json");
const publicUrlPath = path.join(root, "public-url.local.txt");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4 * 1024 * 1024) {
        reject(new Error("Payload muito grande."));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("JSON invalido."));
      }
    });
    request.on("error", reject);
  });
}

function readMercadoPagoConfig() {
  const envConfig = {
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || process.env.MP_PUBLIC_KEY || "",
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || "",
    applicationId: process.env.MERCADO_PAGO_APPLICATION_ID || process.env.MP_APPLICATION_ID || "",
    userId: process.env.MERCADO_PAGO_USER_ID || process.env.MP_USER_ID || "",
    verificationCode: process.env.MERCADO_PAGO_VERIFICATION_CODE || process.env.MP_VERIFICATION_CODE || "",
  };
  const hasEnvConfig = Object.values(envConfig).some(Boolean);
  if (!fs.existsSync(configPath)) return hasEnvConfig ? envConfig : {};
  try {
    return {
      ...JSON.parse(fs.readFileSync(configPath, "utf8")),
      ...Object.fromEntries(Object.entries(envConfig).filter(([, value]) => value)),
    };
  } catch (error) {
    return hasEnvConfig ? envConfig : {};
  }
}

function writeMercadoPagoConfig(config) {
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function readPomperoState() {
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function writePomperoState(state) {
  const payload = {
    ...state,
    serverUpdatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(statePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function publicConfig(config) {
  return {
    configured: Boolean(config.publicKey && config.accessToken),
    publicKey: config.publicKey || "",
    applicationId: config.applicationId || "",
    userId: config.userId || "",
    testUser: config.testUser || "",
    verificationCode: config.verificationCode || "",
    hasAccessToken: Boolean(config.accessToken),
    hasTestPassword: Boolean(config.testPassword),
    updatedAt: config.updatedAt || "",
  };
}

function baseUrlFrom(request) {
  const envUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
  if (envUrl) return envUrl;
  if (fs.existsSync(publicUrlPath)) {
    const fileUrl = fs.readFileSync(publicUrlPath, "utf8").trim().replace(/\/$/, "");
    if (fileUrl) return fileUrl;
  }
  return `http://${request.headers.host}`;
}

function normalizeMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.round(number * 100) / 100;
}

function buildPreferenceBody(order, request) {
  const paymentId = String(order.paymentId || order.id || Date.now());
  const total = normalizeMoney(order.total);
  const baseUrl = baseUrlFrom(request);
  const canUseBackUrls = baseUrl.startsWith("https://");
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        id: String(item.id || item.cartId || item.name || "item"),
        title: String(item.name || "Pedido Pompero"),
        quantity: 1,
        unit_price: normalizeMoney(item.price),
        currency_id: "BRL",
      }))
    : [];

  if (!items.length || !total) {
    throw new Error("Pedido sem itens ou valor valido.");
  }

  const body = {
    items,
    external_reference: paymentId,
    statement_descriptor: "POMPERO",
    metadata: {
      order_id: String(order.id || ""),
      order_code: String(order.code || ""),
      payment_id: paymentId,
      phone: String(order.phone || ""),
    },
    payer: {
      name: String(order.customer || "Cliente Pompero"),
    },
  };

  if (canUseBackUrls) {
    body.back_urls = {
      success: `${baseUrl}/pagamento.html?id=${encodeURIComponent(paymentId)}&mp_status=success`,
      pending: `${baseUrl}/pagamento.html?id=${encodeURIComponent(paymentId)}&mp_status=pending`,
      failure: `${baseUrl}/pagamento.html?id=${encodeURIComponent(paymentId)}&mp_status=failure`,
    };
    body.auto_return = "approved";
    body.notification_url = `${baseUrl}/api/mp/webhook`;
  }

  return body;
}

function splitName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Cliente",
    lastName: parts.slice(1).join(" ") || "Pompero",
  };
}

function payerEmail(order) {
  const email = String(order.email || "").trim();
  if (email.includes("@")) return email;
  const phone = String(order.phone || "cliente").replace(/\D/g, "") || "cliente";
  return `${phone}@cliente.pompero.local`;
}

function cardPaymentBody(order, card) {
  const amount = normalizeMoney(order.total);
  const token = String(card.token || "").trim();
  const paymentMethodId = String(card.paymentMethodId || "").trim();
  const payer = card.payer || {};

  if (!amount) throw new Error("Valor do pedido invalido.");
  if (!token || !paymentMethodId) throw new Error("Dados do cartao incompletos.");

  return {
    transaction_amount: amount,
    token,
    description: String(card.description || `Pedido ${order.code || "Pompero Burguer"}`),
    installments: Math.max(1, Number(card.installments || 1)),
    payment_method_id: paymentMethodId,
    issuer_id: String(card.issuerId || ""),
    external_reference: String(order.paymentId || order.id),
    notification_url: `${baseUrlFrom({ headers: { host: "" } })}/api/mp/webhook`,
    metadata: {
      payment_id: String(order.paymentId || ""),
      order_id: String(order.id || ""),
      order_code: String(order.code || ""),
    },
    payer: {
      email: String(payer.email || order.email || "").trim(),
      identification: {
        type: String(payer.identification?.type || "CPF"),
        number: String(payer.identification?.number || "").replace(/\D/g, ""),
      },
    },
  };
}

function pixExpirationDate(minutes = 5) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function paidOrderFromStateByPaymentId(paymentId) {
  const state = readPomperoState();
  if (!state) return null;
  const order = (state.pendingPayments || []).find((item) => item.paymentId === paymentId);
  return { state, order };
}

function releasePaidOrder(paymentId, paymentData = {}) {
  const current = paidOrderFromStateByPaymentId(paymentId);
  if (!current?.order) return null;

  const { state, order } = current;
  order.status = "Pago aguardando aceite";
  order.paidAt = new Date().toISOString();
  order.mercadoPagoPaymentId = paymentData.id || order.mercadoPagoPaymentId || "";
  order.payment = {
    ...(order.payment || {}),
    status: "approved",
  };
  state.pendingPayments = (state.pendingPayments || []).filter((item) => item.paymentId !== paymentId);
  state.pendingOrders = state.pendingOrders || [];
  if (!state.pendingOrders.some((item) => item.paymentId === paymentId)) {
    state.pendingOrders.unshift(order);
  }
  writePomperoState(state);
  return order;
}

function cancelPendingPayment(paymentId) {
  const current = paidOrderFromStateByPaymentId(paymentId);
  if (!current?.order) return null;
  const { state, order } = current;
  order.status = "Cancelado por falta de pagamento";
  order.cancelledAt = new Date().toISOString();
  state.pendingPayments = (state.pendingPayments || []).filter((item) => item.paymentId !== paymentId);
  state.cancelledOrders = state.cancelledOrders || [];
  state.cancelledOrders.unshift(order);
  writePomperoState(state);
  return order;
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      service: "pompero-sistema",
      time: new Date().toISOString(),
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/state") {
    const state = readPomperoState();
    if (!state) {
      sendJson(response, 404, { error: "Estado ainda nao criado no servidor." });
      return true;
    }
    sendJson(response, 200, state);
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/state") {
    const body = await readBody(request);
    if (!body || typeof body !== "object" || !Array.isArray(body.menu)) {
      sendJson(response, 400, { error: "Estado invalido." });
      return true;
    }
    sendJson(response, 200, writePomperoState(body));
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/mp/config") {
    sendJson(response, 200, publicConfig(readMercadoPagoConfig()));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/config") {
    const body = await readBody(request);
    const publicKey = String(body.publicKey || "").trim();
    const accessToken = String(body.accessToken || "").trim();
    const applicationId = String(body.applicationId || "").trim();
    const userId = String(body.userId || "").trim();
    const testUser = String(body.testUser || "").trim();
    const testPassword = String(body.testPassword || "").trim();
    const verificationCode = String(body.verificationCode || "").trim();

    if (!publicKey || !accessToken) {
      sendJson(response, 400, { error: "Preencha Public Key e Access Token." });
      return true;
    }

    const nextConfig = {
      publicKey,
      accessToken,
      applicationId,
      userId,
      testUser,
      testPassword,
      verificationCode,
      updatedAt: new Date().toISOString(),
    };
    writeMercadoPagoConfig(nextConfig);
    sendJson(response, 200, publicConfig(nextConfig));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/create-preference") {
    const config = readMercadoPagoConfig();
    if (!config.publicKey || !config.accessToken) {
      sendJson(response, 400, { error: "Configure o Mercado Pago no sistema da loja antes de vender online." });
      return true;
    }

    const order = await readBody(request);
    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const preference = new Preference(client);
    let result;
    try {
      result = await preference.create({ body: buildPreferenceBody(order, request) });
    } catch (error) {
      const message =
        error?.cause?.[0]?.description ||
        error?.message ||
        "Mercado Pago recusou a criacao da preferencia.";
      sendJson(response, 400, { error: message });
      return true;
    }

    sendJson(response, 200, {
      publicKey: config.publicKey,
      preferenceId: result.id,
      checkoutUrl: result.init_point || result.sandbox_init_point || "",
      sandboxCheckoutUrl: result.sandbox_init_point || "",
      paymentUrl: `pagamento.html?id=${encodeURIComponent(order.paymentId)}`,
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/create-pix") {
    const config = readMercadoPagoConfig();
    if (!config.publicKey || !config.accessToken) {
      sendJson(response, 400, { error: "Configure o Mercado Pago no sistema da loja antes de vender online." });
      return true;
    }

    const order = await readBody(request);
    const amount = normalizeMoney(order.total);
    if (!amount) {
      sendJson(response, 400, { error: "Valor do pedido invalido." });
      return true;
    }

    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const payment = new Payment(client);
    const name = splitName(order.customer);
    let result;

    try {
      result = await payment.create({
        body: {
          transaction_amount: amount,
          description: `Pedido ${order.code || "Pompero Burguer"}`,
          payment_method_id: "pix",
          external_reference: String(order.paymentId || order.id),
          date_of_expiration: pixExpirationDate(5),
          notification_url: `${baseUrlFrom(request)}/api/mp/webhook`,
          metadata: {
            payment_id: String(order.paymentId || ""),
            order_id: String(order.id || ""),
            order_code: String(order.code || ""),
          },
          payer: {
            email: payerEmail(order),
            first_name: name.firstName,
            last_name: name.lastName,
          },
        },
        requestOptions: {
          idempotencyKey: String(order.paymentId || order.id || Date.now()),
        },
      });
    } catch (error) {
      const message =
        error?.cause?.[0]?.description ||
        error?.message ||
        "Mercado Pago recusou a criacao do Pix.";
      sendJson(response, 400, { error: message });
      return true;
    }

    const transactionData = result.point_of_interaction?.transaction_data || {};
    sendJson(response, 200, {
      paymentId: result.id,
      status: result.status,
      expiresAt: result.date_of_expiration || "",
      qrCode: transactionData.qr_code || "",
      qrCodeBase64: transactionData.qr_code_base64 || "",
      ticketUrl: transactionData.ticket_url || "",
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/process-card") {
    const config = readMercadoPagoConfig();
    if (!config.publicKey || !config.accessToken) {
      sendJson(response, 400, { error: "Configure o Mercado Pago no sistema da loja antes de vender online." });
      return true;
    }

    const body = await readBody(request);
    const order = body.order || {};
    const card = body.card || {};
    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const payment = new Payment(client);
    let result;

    try {
      const paymentBody = cardPaymentBody(order, card);
      paymentBody.notification_url = `${baseUrlFrom(request)}/api/mp/webhook`;
      result = await payment.create({
        body: paymentBody,
        requestOptions: {
          idempotencyKey: String(order.paymentId || order.id || Date.now()),
        },
      });
    } catch (error) {
      const message =
        error?.cause?.[0]?.description ||
        error?.message ||
        "Mercado Pago recusou o pagamento com cartao.";
      sendJson(response, 400, { error: message });
      return true;
    }

    sendJson(response, 200, {
      paymentId: result.id,
      status: result.status,
      statusDetail: result.status_detail || "",
      message:
        result.status === "approved"
          ? "Pagamento aprovado."
          : result.status === "in_process" || result.status === "pending"
            ? "Pagamento em analise."
            : "Pagamento recusado.",
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/test-pix") {
    const config = readMercadoPagoConfig();
    if (!config.publicKey || !config.accessToken) {
      sendJson(response, 400, { error: "Configure Public Key e Access Token antes de testar o Pix." });
      return true;
    }

    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const payment = new Payment(client);
    const testId = `teste-pix-${Date.now()}`;

    try {
      const result = await payment.create({
        body: {
          transaction_amount: 1,
          description: "Teste Pix Pompero Burguer",
          payment_method_id: "pix",
          external_reference: testId,
          date_of_expiration: pixExpirationDate(5),
          notification_url: `${baseUrlFrom(request)}/api/mp/webhook`,
          metadata: {
            payment_id: testId,
            order_code: "TESTE-PIX",
          },
          payer: {
            email: "teste.pix@pompero.com.br",
            first_name: "Teste",
            last_name: "Pompero",
          },
        },
        requestOptions: {
          idempotencyKey: testId,
        },
      });
      const transactionData = result.point_of_interaction?.transaction_data || {};
      sendJson(response, 200, {
        ok: true,
        paymentId: result.id,
        status: result.status,
        hasQrCode: Boolean(transactionData.qr_code),
        hasQrImage: Boolean(transactionData.qr_code_base64),
      });
    } catch (error) {
      const message =
        error?.cause?.[0]?.description ||
        error?.message ||
        "Mercado Pago recusou o teste Pix.";
      sendJson(response, 400, { error: message });
    }
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/mp/payment-status") {
    const config = readMercadoPagoConfig();
    const mercadoPagoPaymentId = url.searchParams.get("id");
    const localPaymentId = url.searchParams.get("paymentId");

    if (!config.accessToken || !mercadoPagoPaymentId) {
      sendJson(response, 400, { error: "Pagamento nao informado." });
      return true;
    }

    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const payment = new Payment(client);
    try {
      const result = await payment.get({ id: mercadoPagoPaymentId });
      if (result.status === "approved" && localPaymentId) {
        releasePaidOrder(localPaymentId, result);
      }
      sendJson(response, 200, {
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail || "",
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Nao foi possivel consultar o pagamento." });
    }
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/cancel-pending") {
    const body = await readBody(request);
    const paymentId = String(body.paymentId || "").trim();
    if (!paymentId) {
      sendJson(response, 400, { error: "Pedido nao informado." });
      return true;
    }
    const cancelled = cancelPendingPayment(paymentId);
    sendJson(response, 200, { cancelled: Boolean(cancelled) });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/mp/webhook") {
    const body = await readBody(request).catch(() => ({}));
    const paymentId = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
    const config = readMercadoPagoConfig();

    if (config.accessToken && paymentId) {
      try {
        const client = new MercadoPagoConfig({ accessToken: config.accessToken });
        const payment = new Payment(client);
        const result = await payment.get({ id: paymentId });
        const localPaymentId = result.external_reference || result.metadata?.payment_id;
        if (result.status === "approved" && localPaymentId) {
          releasePaidOrder(localPaymentId, result);
        }
      } catch (error) {
        console.error("Webhook Mercado Pago:", error.message);
      }
    }
    sendJson(response, 200, { received: true });
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith("/api/") && (await handleApi(request, response, url))) {
      return;
    }

    const requestedPath =
      url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^[/\\]+/, "");
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, host, () => {
  console.log(`Pompero rodando em http://localhost:${port}`);
});
