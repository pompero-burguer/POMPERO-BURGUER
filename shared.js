const Pompero = (() => {
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const menu = [
    {
      id: "salada-burger",
      name: "Salada Burger",
      flavor: "Clássico",
      price: 30.9,
      photo: "assets/lanches/salada-burger.jpg",
      description: "Pão brioche, hambúrguer 170g, queijo, alface, tomate e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, alface: 1, tomate: 1, fritas: 1 },
    },
    {
      id: "salada-bacon",
      name: "Salada Bacon",
      flavor: "Bacon",
      price: 32.9,
      photo: "assets/lanches/salada-bacon.jpg",
      description: "Pão brioche, hambúrguer 170g, queijo, bacon, salada e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, alface: 1, tomate: 1, fritas: 1 },
    },
    {
      id: "ranch-burger",
      name: "Ranch Burger",
      flavor: "Especial",
      price: 35.9,
      photo: "assets/lanches/ranch-burger.jpg",
      description: "Queijo, bacon, cebola crispy, alface picado, molho ranch e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, cebolaCrispy: 1, alface: 1, fritas: 1 },
    },
    {
      id: "cheddar-bacon-bbq",
      name: "Cheddar Bacon BBQ",
      flavor: "Bacon",
      price: 32.9,
      photo: "assets/lanches/cheddar-bacon-bbq.jpg",
      description: "Creme de cheddar, bacon, barbecue e molho especial.",
      recipe: { pao: 1, carne170: 1, cheddar: 1, bacon: 1, barbecue: 1, fritas: 1 },
    },
    {
      id: "geleia-bacon",
      name: "Geleia Bacon",
      flavor: "Especial",
      price: 33.9,
      photo: "assets/lanches/geleia-bacon.jpg",
      description: "Queijo, geleia de bacon, onion rings e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, onionRings: 1, fritas: 1 },
    },
    {
      id: "provobacon-pepper",
      name: "The Provobacon Pepper",
      flavor: "Premium",
      price: 39,
      photo: "assets/lanches/provobacon-pepper.jpg",
      description: "Hambúrguer 180g, queijo prato, provolone empanado, bacon e geleia de pimenta.",
      recipe: { pao: 1, carne180: 1, queijo: 1, provolone: 1, bacon: 1, geleiaPimenta: 1 },
    },
    {
      id: "smash-duplo-especial",
      name: "The Smash Duplo Especial",
      flavor: "Smash",
      price: 35,
      photo: "assets/lanches/smash-duplo-especial.jpg",
      description: "Dois smash de 100g, bacon, queijo prato, picles e molho especial.",
      recipe: { pao: 1, carne100: 2, queijo: 2, bacon: 1, picles: 1 },
    },
    {
      id: "x-burguer-kids",
      name: "X Burguer Kids",
      flavor: "Kids",
      price: 19.9,
      photo: "assets/lanches/novos/x-burguer-kids.png",
      description: "Pão macio, hambúrguer, queijo e molho suave em porção menor.",
      recipe: { pao: 1, carne100: 1, presunto: 1, queijo: 1 },
    },
    {
      id: "x-salada",
      name: "X Salada",
      flavor: "Tradicional",
      price: 27.9,
      photo: "assets/lanches/novos/x-salada.png",
      description: "Pão, hambúrguer, queijo, alface, tomate, maionese e molho da casa.",
      recipe: { pao: 1, carne170: 1, queijo: 1, alface: 1, tomate: 1, maionese: 1 },
    },
    {
      id: "x-salada-especial",
      name: "X Salada Especial",
      flavor: "Especial",
      price: 32.9,
      photo: "assets/lanches/novos/x-salada-especial.png",
      description: "X Salada completo com presunto, bacon e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, alface: 1, tomate: 1 },
    },
    {
      id: "x-bacon",
      name: "X Bacon",
      flavor: "Bacon",
      price: 31.9,
      photo: "assets/lanches/novos/x-bacon.png",
      description: "Hambúrguer, queijo, bacon crocante e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1 },
    },
    {
      id: "x-calabresa",
      name: "X Calabresa",
      flavor: "Calabresa",
      price: 31.9,
      photo: "assets/lanches/novos/x-calabresa.png",
      description: "Hambúrguer, queijo, calabresa grelhada, cebola e molho da casa.",
      recipe: { pao: 1, carne170: 1, queijo: 1 },
    },
    {
      id: "x-egg",
      name: "X Egg",
      flavor: "Egg",
      price: 30.9,
      photo: "assets/lanches/novos/x-egg.png",
      description: "Hambúrguer, queijo, ovo frito e molho especial.",
      recipe: { pao: 1, carne170: 1, queijo: 1 },
    },
    {
      id: "hot-dog",
      name: "Hot Dog",
      flavor: "Hot dog",
      price: 20.9,
      photo: "assets/lanches/novos/hot-dog.png",
      description: "Pão, salsicha, molho, milho, batata palha, maionese, ketchup e mostarda.",
      recipe: { pao: 1 },
    },
    {
      id: "hot-dog-especial",
      name: "Hot Dog Especial",
      flavor: "Hot dog",
      price: 25.9,
      photo: "assets/lanches/novos/hot-dog-especial.png",
      description: "Hot dog completo com bacon, queijo/cheddar e batata palha.",
      recipe: { pao: 1, bacon: 1, cheddar: 1 },
    },
    {
      id: "x-pompero",
      name: "X Pompero",
      flavor: "Especial da casa",
      price: 36.9,
      photo: "assets/lanches/novos/x-pompero.png",
      description: "Lanche da casa com hambúrguer, queijo, bacon, salada, cebola caramelizada e molho Pompero.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, alface: 1, tomate: 1 },
    },
    {
      id: "x-tudo",
      name: "X Tudo",
      flavor: "Completo",
      price: 39.9,
      photo: "assets/lanches/novos/x-tudo.png",
      description: "Lanche completo com hambúrguer, queijo, presunto, bacon, ovo, salada, milho, batata palha e molho.",
      recipe: { pao: 1, carne170: 1, queijo: 1, bacon: 1, alface: 1, tomate: 1 },
    },
  ];

  const initialStock = {
    pao: { name: "Pão", unit: "kg", qty: 8, min: 1.5 },
    carne170: { name: "Hambúrguer 170g", unit: "kg", qty: 9.35, min: 2.04 },
    carne180: { name: "Hambúrguer 180g", unit: "kg", qty: 4.32, min: 1.44 },
    carne100: { name: "Hambúrguer 100g", unit: "kg", qty: 7, min: 2 },
    queijo: { name: "Queijo mussarela/prato", unit: "kg", qty: 3, min: 0.7 },
    cheddar: { name: "Creme de cheddar", unit: "kg", qty: 2, min: 0.5 },
    bacon: { name: "Bacon", unit: "kg", qty: 4, min: 0.8 },
    calabresa: { name: "Calabresa", unit: "kg", qty: 4, min: 0.8 },
    presunto: { name: "Presunto", unit: "kg", qty: 2, min: 0.4 },
    ovo: { name: "Ovo", unit: "kg", qty: 3, min: 0.6 },
    salsicha: { name: "Salsicha", unit: "kg", qty: 5, min: 1 },
    pure: { name: "Purê de batata", unit: "kg", qty: 3, min: 0.7 },
    milho: { name: "Milho", unit: "kg", qty: 2, min: 0.4 },
    ervilha: { name: "Ervilha", unit: "kg", qty: 2, min: 0.4 },
    batataPalha: { name: "Batata palha", unit: "kg", qty: 2.5, min: 0.5 },
    alface: { name: "Alface", unit: "kg", qty: 3, min: 0.6 },
    tomate: { name: "Tomate", unit: "kg", qty: 5, min: 1 },
    cebola: { name: "Cebola", unit: "kg", qty: 4, min: 0.8 },
    cebolaCrispy: { name: "Cebola crispy", unit: "kg", qty: 1.5, min: 0.3 },
    onionRings: { name: "Onion rings", unit: "kg", qty: 2, min: 0.4 },
    provolone: { name: "Provolone empanado", unit: "kg", qty: 2, min: 0.4 },
    geleiaPimenta: { name: "Geleia de pimenta", unit: "kg", qty: 1, min: 0.2 },
    barbecue: { name: "Molho barbecue", unit: "kg", qty: 2, min: 0.4 },
    picles: { name: "Picles", unit: "kg", qty: 1.5, min: 0.3 },
    fritas: { name: "Fritas", unit: "kg", qty: 10, min: 2 },
    maionese: { name: "Maionese caseira", unit: "kg", qty: 4, min: 0.8 },
  };

  const defaultUsers = [
    { id: "owner", name: "admin", username: "admin", password: "pompero2026", role: "admin", active: true },
    { id: "caixa", name: "Operador Caixa", username: "caixa", password: "caixa123", role: "operator", active: true },
  ];

  const recipeKg = {
    pao: 0.08,
    carne170: 0.17,
    carne180: 0.18,
    carne100: 0.1,
    queijo: 0.025,
    cheddar: 0.05,
    bacon: 0.05,
    calabresa: 0.06,
    presunto: 0.035,
    ovo: 0.055,
    salsicha: 0.06,
    pure: 0.09,
    milho: 0.025,
    ervilha: 0.02,
    batataPalha: 0.03,
    alface: 0.02,
    tomate: 0.04,
    cebola: 0.025,
    cebolaCrispy: 0.025,
    onionRings: 0.06,
    provolone: 0.08,
    geleiaPimenta: 0.025,
    barbecue: 0.03,
    picles: 0.02,
    fritas: 0.18,
    maionese: 0.03,
  };

  const key = "pompero-connected-system";

  const defaultSettings = {
    whatsappPhone: "14996213006",
    instagramHandle: "",
  };

  const productUpdates = {
    "x-burguer-kids": {
      name: "X Burguer Kids",
      flavor: "Kids",
      price: 19.9,
      photo: "assets/lanches/novos/x-burguer-kids-v2.png",
      description: "Pão de hambúrguer, hambúrguer, presunto e queijo mussarela derretido.",
      recipe: { pao: 1, carne100: 1, queijo: 1 },
    },
    "x-salada": {
      name: "X Salada",
      flavor: "Tradicional",
      price: 27.9,
      photo: "assets/lanches/novos/x-salada-v2.png",
      description: "Pão de hambúrguer, hambúrguer grelhado, queijo mussarela derretido, alface, tomate e maionese caseira.",
      recipe: { pao: 1, carne170: 1, queijo: 1, alface: 1, tomate: 1 },
    },
    "x-salada-especial": {
      name: "X Salada Especial",
      flavor: "Especial",
      price: 32.9,
      photo: "assets/lanches/novos/x-salada-especial-v2.png",
      description: "Pão de hambúrguer, hambúrguer artesanal alto, queijo mussarela duplo, alface, tomate, cebola roxa e maionese especial da casa.",
      recipe: { pao: 1, carne170: 1, queijo: 2, alface: 1, tomate: 1, cebola: 1, maionese: 1 },
    },
    "x-egg": {
      name: "X Egg",
      flavor: "Egg",
      price: 30.9,
      photo: "assets/lanches/novos/x-egg-v2.png",
      description: "Pão de hambúrguer, hambúrguer grelhado, ovo frito na chapa, queijo mussarela derretido, alface, tomate e maionese caseira.",
      recipe: { pao: 1, carne170: 1, ovo: 1, queijo: 1, alface: 1, tomate: 1, maionese: 1 },
    },
    "x-bacon": {
      name: "X Bacon",
      flavor: "Bacon",
      price: 31.9,
      photo: "assets/lanches/novos/x-bacon-v2.png",
      description: "Pão de hambúrguer, hambúrguer grelhado, muito bacon crocante, queijo mussarela derretido e maionese caseira.",
      recipe: { pao: 1, carne170: 1, bacon: 2, queijo: 1, maionese: 1 },
    },
    "x-calabresa": {
      name: "X Calabresa",
      flavor: "Calabresa",
      price: 31.9,
      photo: "assets/lanches/novos/x-calabresa-v2.png",
      description: "Pão de hambúrguer, hambúrguer grelhado, calabresa defumada fatiada na chapa, queijo mussarela derretido e maionese caseira.",
      recipe: { pao: 1, carne170: 1, calabresa: 1, queijo: 1, maionese: 1 },
    },
    "x-tudo": {
      name: "X Tudo",
      flavor: "Completo",
      price: 39.9,
      photo: "assets/lanches/novos/x-tudo-v2.png",
      description: "Pão de hambúrguer, hambúrguer, bacon, calabresa, ovo, presunto, queijo mussarela derretido, alface, tomate, milho, ervilha, batata palha e maionese.",
      recipe: { pao: 1, carne170: 1, bacon: 1, calabresa: 1, ovo: 1, presunto: 1, queijo: 1, alface: 1, tomate: 1, milho: 1, ervilha: 1, batataPalha: 1, maionese: 1 },
    },
    "x-calota": {
      id: "x-calota",
      name: "X Pompero",
      flavor: "Serve até 4 pessoas",
      price: 89.9,
      photo: "assets/lanches/novos/x-calota-v2.png",
      description: "Pão gigante de calota recheado com hambúrgueres, contrafilé, frango, calabresa, bacon, ovos, presunto e queijo mussarela derretido. Finalizado com alface, tomate, milho, ervilha, batata palha e maionese. Servido no prato. Acompanha garfo e faca.",
      recipe: { pao: 4, carne170: 4, carne180: 2, calabresa: 3, bacon: 3, ovo: 4, presunto: 4, queijo: 6, alface: 4, tomate: 4, milho: 3, ervilha: 3, batataPalha: 4, maionese: 4 },
      active: true,
    },
    "hot-dog": {
      name: "Hot Dog",
      flavor: "Hot dog",
      price: 20.9,
      photo: "assets/lanches/novos/hot-dog-v2.png",
      description: "Pão de dog, uma salsicha, vinagrete, milho, ervilha, batata palha, catchup, mostarda e maionese caseira.",
      recipe: { pao: 1, salsicha: 1, tomate: 1, cebola: 1, milho: 1, ervilha: 1, batataPalha: 1, maionese: 1 },
    },
    "hot-dog-especial": {
      name: "Hot Dog Especial",
      flavor: "Hot dog",
      price: 25.9,
      photo: "assets/lanches/novos/hot-dog-especial-v2.png",
      description: "Pão de dog, duas salsichas, purê de batata cremoso, bacon picado, queijo mussarela derretido, milho, ervilha, batata palha e maionese da casa.",
      recipe: { pao: 1, salsicha: 2, pure: 1, bacon: 1, queijo: 1, milho: 1, ervilha: 1, batataPalha: 1, maionese: 1 },
    },
    "porcao-chicken": {
      name: "Chicken",
      flavor: "Porções",
      price: 29.9,
      photo: "assets/produtos/chicken.png",
      description: "Porcao de chicken crocante.",
      recipe: { fritas: 1 },
    },
    "batata-individual": {
      name: "Batata Frita Individual",
      flavor: "Porções",
      price: 15.9,
      photo: "assets/produtos/batata-frita.png",
      description: "Batata frita individual.",
      recipe: { fritas: 1 },
    },
    "batata-cheddar-bacon-individual": {
      name: "Batata Frita com Cheddar e Bacon Individual",
      flavor: "Porções",
      price: 22.9,
      photo: "assets/produtos/batata-cheddar-bacon.png",
      description: "Batata frita individual com cheddar e bacon.",
      recipe: { fritas: 1, cheddar: 1, bacon: 1 },
    },
    "batata-familia": {
      name: "Batata Frita Tamanho Familia",
      flavor: "Porções",
      price: 35.9,
      photo: "assets/produtos/batata-frita.png",
      description: "Batata frita tamanho familia.",
      recipe: { fritas: 3 },
    },
    "batata-cheddar-bacon-familia": {
      name: "Batata Frita com Cheddar e Bacon Tamanho Familia",
      flavor: "Porções",
      price: 45.9,
      photo: "assets/produtos/batata-cheddar-bacon.png",
      description: "Batata frita familia com cheddar e bacon.",
      recipe: { fritas: 3, cheddar: 2, bacon: 2 },
    },
    "aneis-cebola": {
      name: "Aneis de Cebola",
      flavor: "Porções",
      price: 24.9,
      photo: "assets/produtos/aneis-cebola.png",
      description: "Aneis de cebola crocantes.",
      recipe: { onionRings: 2 },
    },
    "refrigerante-2l": {
      name: "Refrigerante 2L",
      flavor: "Refrigerantes e Águas",
      price: 13,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "refrigerante-lata": {
      name: "Refrigerante Lata",
      flavor: "Refrigerantes e Águas",
      price: 6,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "refrigerante-600-pet": {
      name: "Refrigerante 600ml PET",
      flavor: "Refrigerantes e Águas",
      price: 8,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "refrigerante-600-vidro": {
      name: "Refrigerante 600ml Vidro",
      flavor: "Refrigerantes e Águas",
      price: 8.5,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "refrigerante-1l-vidro": {
      name: "Refrigerante 1L Vidro",
      flavor: "Refrigerantes e Águas",
      price: 10,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "refrigerante-1l-pet": {
      name: "Refrigerante 1L PET",
      flavor: "Refrigerantes e Águas",
      price: 10,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Coca-Cola, Fanta, Sprite ou Conquista em sabores variados.",
      recipe: {},
    },
    "tubaina-conquista-vidro": {
      name: "Tubaina de Vidro Conquista",
      flavor: "Refrigerantes e Águas",
      price: 6,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Tubaina de vidro da Conquista.",
      recipe: {},
    },
    "agua-com-gas": {
      name: "Agua com Gas",
      flavor: "Refrigerantes e Águas",
      price: 4.5,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Agua com gas.",
      recipe: {},
    },
    "agua-mineral": {
      name: "Agua Mineral",
      flavor: "Refrigerantes e Águas",
      price: 4,
      photo: "assets/produtos/refrigerantes-aguas.png",
      description: "Agua mineral sem gas.",
      recipe: {},
    },
    "cerveja-lata": {
      name: "Cerveja Lata",
      flavor: "Bebidas com Álcool",
      price: 7,
      photo: "assets/produtos/cervejas.png",
      description: "Skol, Brahma, Original, Heineken, Amstel ou Imperio.",
      recipe: {},
    },
    "cerveja-long-neck": {
      name: "Cerveja Long Neck",
      flavor: "Bebidas com Álcool",
      price: 10,
      photo: "assets/produtos/cervejas.png",
      description: "Skol, Brahma, Original, Heineken, Amstel ou Imperio.",
      recipe: {},
    },
    "batidinha-uva": {
      name: "Batidinha de Uva",
      flavor: "Bebidas com Álcool",
      price: 12,
      photo: "assets/produtos/drinks-alcoolicos.png",
      description: "Batidinha de uva.",
      recipe: {},
    },
    "caipirinha": {
      name: "Caipirinha",
      flavor: "Bebidas com Álcool",
      price: 18,
      photo: "assets/produtos/drinks-alcoolicos.png",
      description: "Sabores: kiwi, limao, maracuja ou morango.",
      recipe: {},
    },
    "suco-copo": {
      name: "Suco no Copo",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-limao.png",
      description: "Sabores: limao, laranja, maracuja, morango, abacaxi, acerola ou uva.",
      recipe: {},
      active: false,
    },
    "suco-limao": {
      name: "Suco de Limão",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-limao.png",
      description: "Suco natural de limão no copo.",
      recipe: {},
    },
    "suco-laranja": {
      name: "Suco de Laranja",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-laranja.png",
      description: "Suco natural de laranja no copo.",
      recipe: {},
    },
    "suco-maracuja": {
      name: "Suco de Maracujá",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-maracuja.png",
      description: "Suco de maracujá no copo.",
      recipe: {},
    },
    "suco-morango": {
      name: "Suco de Morango",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-morango.png",
      description: "Suco de morango no copo.",
      recipe: {},
    },
    "suco-abacaxi": {
      name: "Suco de Abacaxi",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-laranja.png",
      description: "Suco de abacaxi no copo.",
      recipe: {},
    },
    "suco-acerola": {
      name: "Suco de Acerola",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-morango.png",
      description: "Suco de acerola no copo.",
      recipe: {},
    },
    "suco-uva": {
      name: "Suco de Uva",
      flavor: "Sucos e Soda",
      price: 8,
      photo: "assets/produtos/suco-morango.png",
      description: "Suco de uva no copo.",
      recipe: {},
    },
    "soda-italiana": {
      name: "Soda Italiana",
      flavor: "Sucos e Soda",
      price: 12,
      photo: "assets/produtos/drinks-alcoolicos.png",
      description: "Soda italiana em sabores variados.",
      recipe: {},
    },
  };

  const generatedPhotoProductIds = new Set([
    "porcao-chicken",
    "batata-individual",
    "batata-cheddar-bacon-individual",
    "batata-familia",
    "batata-cheddar-bacon-familia",
    "aneis-cebola",
    "refrigerante-2l",
    "refrigerante-lata",
    "refrigerante-600-pet",
    "refrigerante-600-vidro",
    "refrigerante-1l-vidro",
    "refrigerante-1l-pet",
    "tubaina-conquista-vidro",
    "agua-com-gas",
    "agua-mineral",
    "cerveja-lata",
    "cerveja-long-neck",
    "batidinha-uva",
    "caipirinha",
    "suco-copo",
    "suco-limao",
    "suco-laranja",
    "suco-maracuja",
    "suco-morango",
    "suco-abacaxi",
    "suco-acerola",
    "suco-uva",
    "soda-italiana",
  ]);

  function normalizeMenu(sourceMenu) {
    const byId = new Map(sourceMenu.map((item) => [item.id, { flavor: "Hambúrguer", active: true, ...item }]));

    byId.delete("x-pompero");

    Object.entries(productUpdates).forEach(([id, update]) => {
      const savedProduct = byId.get(id) || {};
      byId.set(id, {
        flavor: "Hambúrguer",
        active: true,
        ...savedProduct,
        id,
        ...update,
        name: id === "x-calota" ? update.name : savedProduct.name ?? update.name,
        flavor: id === "x-calota" ? update.flavor : savedProduct.flavor ?? update.flavor,
        photo: generatedPhotoProductIds.has(id) ? update.photo : savedProduct.photo ?? update.photo,
        description: savedProduct.description ?? update.description,
        recipe: savedProduct.recipe ?? update.recipe,
        price: savedProduct.price ?? update.price,
        active: id === "suco-copo" ? false : savedProduct.active ?? update.active ?? true,
      });
    });

    return repairSavedText(Array.from(byId.values()));
  }

  function normalizeStock(savedStock = {}) {
    const nextStock = structuredClone(initialStock);

    Object.entries(nextStock).forEach(([id, item]) => {
      const savedItem = savedStock[id];
      if (savedItem?.unit === "kg") {
        item.qty = Number(savedItem.qty ?? item.qty);
        item.min = Number(savedItem.min ?? item.min);
      }
    });

    return nextStock;
  }

  function normalizeUsers(savedUsers = []) {
    const byUsername = new Map(defaultUsers.map((user) => [user.username, { ...user }]));
    savedUsers.forEach((user) => {
      if (user?.username) {
        byUsername.set(user.username, { active: true, role: "operator", ...user });
      }
    });
    const legacyAdmin = savedUsers.find((user) => user?.id === "owner" || user?.username === "keven");
    if (legacyAdmin) {
      byUsername.delete(legacyAdmin.username);
      byUsername.set("admin", {
        ...legacyAdmin,
        id: "owner",
        name: "admin",
        username: "admin",
        password: legacyAdmin.password || "pompero2026",
        role: "admin",
        active: true,
      });
    }
    return Array.from(byUsername.values());
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function orderCode() {
    return `PMP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function cleanPhone(phone) {
    return (phone || "").replace(/\D/g, "");
  }

  function repairText(text) {
    if (typeof text !== "string") return text;

    const directFixes = {
      "Por\uFFFD\uFFFDes": "Porções",
      "Por\u00EF\u00BF\u00BD\u00EF\u00BF\u00BDes": "Porções",
      "Refrigerantes e \uFFFDguas": "Refrigerantes e Águas",
      "Refrigerantes e \u00EF\u00BF\u00BDguas": "Refrigerantes e Águas",
      "Bebidas com \uFFFDlcool": "Bebidas com Álcool",
      "Bebidas com \u00EF\u00BF\u00BDlcool": "Bebidas com Álcool",
      "Suco de Lim\uFFFDo": "Suco de Limão",
      "Suco de Lim\u00EF\u00BF\u00BDo": "Suco de Limão",
      "Suco de Maracuj\uFFFD": "Suco de Maracujá",
      "Suco de Maracuj\u00EF\u00BF\u00BD": "Suco de Maracujá",
      "Suco de maracuj\uFFFD no copo.": "Suco de maracujá no copo.",
      "Suco de maracuj\u00EF\u00BF\u00BD no copo.": "Suco de maracujá no copo.",
      "Em prepara\uFFFD\uFFFDo": "Em preparação",
      "Em prepara\u00EF\u00BF\u00BD\u00EF\u00BF\u00BDo": "Em preparação",
    };

    let fixed = directFixes[text] || text;
    if (/[\u00C3\u00C2\u00E2]/.test(fixed)) {
      try {
        fixed = decodeURIComponent(escape(fixed));
      } catch {
        fixed = fixed
          .replaceAll("\u00C3\u00A1", "á")
          .replaceAll("\u00C3\u00A9", "é")
          .replaceAll("\u00C3\u00AD", "í")
          .replaceAll("\u00C3\u00B3", "ó")
          .replaceAll("\u00C3\u00BA", "ú")
          .replaceAll("\u00C3\u00A2", "â")
          .replaceAll("\u00C3\u00AA", "ê")
          .replaceAll("\u00C3\u00B4", "ô")
          .replaceAll("\u00C3\u00A3", "ã")
          .replaceAll("\u00C3\u00B5", "õ")
          .replaceAll("\u00C3\u00A7", "ç")
          .replaceAll("\u00E2\u0080\u00A2", "•");
      }
    }

    return directFixes[fixed] || fixed;
  }

  function repairSavedText(value) {
    if (Array.isArray(value)) return value.map(repairSavedText);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([itemKey, itemValue]) => [itemKey, repairSavedText(itemValue)]));
    }
    return repairText(value);
  }

  function normalizeSaleStatus(status) {
    const map = {
      "Aceito pela loja": "Pedido aceito",
      "Em preparo": "Em preparação",
      "Pago": "Pedido aceito",
      "Entregue": "Pedido finalizado",
    };
    return map[status] || status || "Pedido aceito";
  }

  function normalizeState(parsed = {}) {
    parsed = repairSavedText(parsed);
    const savedMenu = parsed.menu || [];
    const mergedMenu = [
      ...savedMenu,
      ...structuredClone(menu).filter((item) => !savedMenu.some((savedItem) => savedItem.id === item.id)),
    ];
    const normalized = {
      menu: normalizeMenu(mergedMenu),
      stock: normalizeStock(parsed.stock),
      pendingPayments: parsed.pendingPayments || [],
      pendingOrders: (parsed.pendingOrders || []).map((order) => ({
        ...order,
        status: normalizeSaleStatus(order.status),
      })),
      sales: (parsed.sales || []).map((sale) => ({
        ...sale,
        status: normalizeSaleStatus(sale.status),
      })),
      nfce: parsed.nfce || [],
      customers: parsed.customers || {},
      messages: parsed.messages || [],
      coupons: parsed.coupons || {},
      users: normalizeUsers(parsed.users),
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      maintenance: parsed.maintenance || {},
      serverUpdatedAt: parsed.serverUpdatedAt || "",
    };

    return repairSavedText(normalized);
  }

  function load() {
    const saved = localStorage.getItem(key);

    if (saved) {
      return normalizeState(JSON.parse(saved));
    }

    return normalizeState({ menu: structuredClone(menu) });
  }

  function save(state) {
    const normalized = normalizeState(state);
    localStorage.setItem(key, JSON.stringify(normalized));

    fetch("/api/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalized),
      keepalive: true,
    }).catch(() => {});
  }

  async function syncFromServer() {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.ok) {
        const serverState = normalizeState(await response.json());
        localStorage.setItem(key, JSON.stringify(serverState));
        return serverState;
      }

      if (response.status === 404) {
        const localState = load();
        await fetch("/api/state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(localState),
        });
        return localState;
      }
    } catch (error) {
      return load();
    }

    return load();
  }

  function subtotal(items) {
    return items.reduce((total, item) => total + item.price, 0);
  }

  function couponFor(customer) {
    const suffix = cleanPhone(customer.phone).slice(-4) || "POMPERO";
    return `POMPERO5-${suffix}`.toUpperCase();
  }

  function customerKey(phone, name = "") {
    return cleanPhone(phone) || name.trim().toLowerCase() || "cliente";
  }

  function applyStock(state, items) {
    items.forEach((item) => {
      Object.entries(item.recipe).forEach(([ingredient, amount]) => {
        if (!state.stock[ingredient]) return;
        const kgAmount = amount >= 1 ? amount * (recipeKg[ingredient] || 0.05) : amount;
        state.stock[ingredient].qty = Math.max(0, Number((state.stock[ingredient].qty - kgAmount).toFixed(3)));
      });
    });
  }

  function upsertCustomer(state, sale) {
    const id = customerKey(sale.phone, sale.customer);
    const customer = state.customers[id] || {
      id,
      name: sale.customer || "Cliente",
      phone: cleanPhone(sale.phone),
      address: sale.address || "",
      orders: [],
      totalSpent: 0,
    };

    customer.name = sale.customer || customer.name;
    customer.phone = cleanPhone(sale.phone) || customer.phone;
    customer.address = sale.address || customer.address;
    customer.orders.unshift({
      saleId: sale.id,
      date: sale.createdAt,
      items: sale.items.map((item) => item.name),
      total: sale.total,
    });
    customer.totalSpent += sale.total;
    customer.coupon = couponFor(customer);

    state.customers[id] = customer;
    state.coupons[customer.coupon] = {
      code: customer.coupon,
      phone: customer.phone,
      percent: 0.05,
      customerId: id,
    };

    return customer;
  }

  function previousOrders(customer, excludeSaleId) {
    const orders = (customer?.orders || []).filter((order) => order.saleId !== excludeSaleId).slice(0, 3);

    if (!orders.length) {
      return "Como é seu primeiro pedido registrado aqui, já deixamos seu cadastro pronto para os próximos benefícios.";
    }

    return `Vi aqui seus pedidos anteriores: ${orders
      .map((order) => `${order.items.slice(0, 2).join(" + ")} em ${new Date(order.date).toLocaleDateString("pt-BR")}`)
      .join("; ")}.`;
  }

  function customerMessage(sale, customer) {
    const recurrenceLine =
      customer.orders.length > 1
        ? `Como você já pediu com a gente antes, liberamos 5% de desconto na próxima compra com o cupom ${customer.coupon}.`
        : `Na próxima compra, use o cupom ${customer.coupon} para ganhar 5% de desconto.`;

    return [
      `Olá${sale.customer ? `, ${sale.customer}` : ""}! Seu pedido na Pompero Burguer foi recebido com carinho.`,
      "",
      `Pedido de hoje: ${sale.items.map((item) => item.name).join(", ")}.`,
      previousOrders(customer, sale.id),
      "",
      `Total: ${currency.format(sale.total)}.`,
      `Pagamento: ${sale.payment.method}.`,
      sale.address ? `Entrega: ${sale.address}.` : "Retirada/consumo na loja.",
      sale.code ? `Acompanhe seu pedido pelo código ${sale.code}.` : "",
      recurrenceLine,
      "",
      "Muito obrigado pela preferência. A Pompero agradece e já está preparando tudo por aqui.",
    ].join("\n");
  }

  function postSaleMessage(customer) {
    return [
      `Olá, ${customer.name}! Passando para agradecer seus pedidos na Pompero Burguer.`,
      "",
      previousOrders(customer),
      `Você tem 5% de desconto para a próxima compra com o cupom ${customer.coupon}.`,
      "",
      "Quando bater aquela vontade de burger, é só chamar a gente. Muito obrigado pela preferência!",
    ].join("\n");
  }

  function discountFor(state, code, phone, items) {
    const coupon = state.coupons[(code || "").trim().toUpperCase()];
    if (!coupon) return 0;
    if (coupon.phone && coupon.phone !== cleanPhone(phone)) return 0;
    return subtotal(items) * coupon.percent;
  }

  function registerSale(state, sale) {
    state.sales.unshift(sale);
    state.nfce.unshift({ saleId: sale.id, status: "Pendente", createdAt: sale.createdAt });
    applyStock(state, sale.items);

    const customer = upsertCustomer(state, sale);
    state.messages.unshift({
      saleId: sale.id,
      phone: cleanPhone(sale.phone),
      text: customerMessage(sale, customer),
      status: sale.phone ? "Pronta para envio" : "Sem WhatsApp informado",
      createdAt: sale.createdAt,
    });

    return customer;
  }

  function whatsappUrl(phone, text) {
    const target = cleanPhone(phone) ? `55${cleanPhone(phone)}` : "5514996213006";
    return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  }

  return {
    currency,
    menu,
    initialStock,
    defaultUsers,
    defaultSettings,
    recipeKg,
    uid,
    orderCode,
    cleanPhone,
    load,
    save,
    syncFromServer,
    subtotal,
    discountFor,
    registerSale,
    postSaleMessage,
    whatsappUrl,
  };
})();
