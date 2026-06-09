export const categories = ["Yerbas", "Mates", "Materas", "Bombillas", "Termos", "Accesorios"];

export const paymentMethods = ["Efectivo", "Transferencia", "Mercado Pago", "Tarjeta"];

export const orderStatuses = [
  "Nuevo",
  "Pendiente de pago",
  "Pagado",
  "Preparado",
  "Entregado",
  "Cancelado"
];

export const initialProducts = [
  {
    id: "prod-yerba-baldo",
    name: "Yerba Baldo 1kg",
    category: "Yerbas",
    price: 3500,
    cost: 2200,
    stock: 28,
    unit: "unidad",
    description: "Yerba uruguaya intensa, estacionada y con molienda equilibrada.",
    image: "",
    active: true
  },
  {
    id: "prod-mate-algarrobo",
    name: "Mate de Algarrobo",
    category: "Mates",
    price: 18500,
    cost: 11200,
    stock: 15,
    unit: "unidad",
    description: "Mate torneado en algarrobo, curado y listo para usar.",
    image: "",
    active: true
  },
  {
    id: "prod-camionero",
    name: "Mate Camionero Forrado Cuero",
    category: "Mates",
    price: 21000,
    cost: 13800,
    stock: 10,
    unit: "unidad",
    description: "Calabaza seleccionada con virola y base forrada en cuero.",
    image: "",
    active: true
  },
  {
    id: "prod-matera-cuero",
    name: "Matera Cuero Premium C/ Costura",
    category: "Materas",
    price: 28000,
    cost: 17800,
    stock: 7,
    unit: "unidad",
    description: "Matera rígida con terminaciones premium y costura reforzada.",
    image: "",
    active: true
  },
  {
    id: "prod-bombilla-pico",
    name: "Bombilla Pico de Loro Acero Inox.",
    category: "Bombillas",
    price: 4500,
    cost: 2300,
    stock: 4,
    unit: "unidad",
    description: "Bombilla de acero inoxidable con filtro eficiente y pico cómodo.",
    image: "",
    active: true
  },
  {
    id: "prod-yerba-export",
    name: "Yerba Export 500g",
    category: "Yerbas",
    price: 2800,
    cost: 1650,
    stock: 40,
    unit: "unidad",
    description: "Paquete de 500g, sabor tradicional para consumo diario.",
    image: "",
    active: true
  },
  {
    id: "prod-termo-acero",
    name: "Termo Acero Inox. 1 Litro",
    category: "Termos",
    price: 15000,
    cost: 9300,
    stock: 18,
    unit: "unidad",
    description: "Termo de acero inoxidable con pico cebador y buena conservación.",
    image: "",
    active: true
  },
  {
    id: "prod-imperial",
    name: "Mate Imperial Grabado",
    category: "Mates",
    price: 24000,
    cost: 15800,
    stock: 6,
    unit: "unidad",
    description: "Mate imperial con grabado artesanal y detalle dorado.",
    image: "",
    active: true
  }
];

export const initialClients = [
  {
    id: "client-sofia",
    name: "Sofía Molina",
    whatsapp: "2364551122",
    instagram: "@sofimolina",
    notes: "Prefiere mates de cuero y pagos por transferencia.",
    purchases: ["Mate de Algarrobo", "Yerba Baldo 1kg"]
  },
  {
    id: "client-martin",
    name: "Martín Duarte",
    whatsapp: "2364667788",
    instagram: "",
    notes: "Compra regalos empresariales.",
    purchases: ["Termo Acero Inox. 1 Litro"]
  },
  {
    id: "client-carolina",
    name: "Carolina Ríos",
    whatsapp: "2364219988",
    instagram: "@carorios",
    notes: "Cliente frecuente de accesorios.",
    purchases: ["Bombilla Pico de Loro Acero Inox."]
  }
];

export const initialOrders = [
  {
    id: "order-1001",
    client: "Sofía Molina",
    whatsapp: "2364551122",
    items: [{ productId: "prod-camionero", name: "Mate Camionero Forrado Cuero", quantity: 1, price: 21000 }],
    total: 21000,
    status: "Pendiente de pago",
    date: "Hoy, 11:20",
    notes: "Retira por showroom."
  },
  {
    id: "order-1002",
    client: "Martín Duarte",
    whatsapp: "2364667788",
    items: [{ productId: "prod-termo-acero", name: "Termo Acero Inox. 1 Litro", quantity: 2, price: 15000 }],
    total: 30000,
    status: "Preparado",
    date: "Ayer, 18:10",
    notes: "Enviar con bolsa de regalo."
  },
  {
    id: "order-1003",
    client: "Carolina Ríos",
    whatsapp: "2364219988",
    items: [
      { productId: "prod-yerba-baldo", name: "Yerba Baldo 1kg", quantity: 2, price: 3500 },
      { productId: "prod-bombilla-pico", name: "Bombilla Pico de Loro Acero Inox.", quantity: 1, price: 4500 }
    ],
    total: 11500,
    status: "Nuevo",
    date: "Hoy, 09:45",
    notes: "Confirmar disponibilidad por WhatsApp."
  }
];

export const initialSales = [
  {
    id: "sale-9001",
    client: "Sofía Molina",
    method: "Mercado Pago",
    date: "Hoy, 10:05",
    items: [
      { productId: "prod-mate-algarrobo", name: "Mate de Algarrobo", quantity: 1, price: 18500 },
      { productId: "prod-yerba-baldo", name: "Yerba Baldo 1kg", quantity: 1, price: 3500 }
    ],
    total: 22000
  },
  {
    id: "sale-9002",
    client: "Sin cliente",
    method: "Efectivo",
    date: "Hoy, 12:30",
    items: [{ productId: "prod-matera-cuero", name: "Matera Cuero Premium C/ Costura", quantity: 1, price: 28000 }],
    total: 28000
  }
];

export const initialStockMovements = [
  {
    id: "mov-1",
    productId: "prod-yerba-export",
    productName: "Yerba Export 500g",
    type: "Ingreso de stock",
    quantity: 12,
    date: "Hoy, 10:30",
    note: "Reposición semanal"
  },
  {
    id: "mov-2",
    productId: "prod-mate-algarrobo",
    productName: "Mate de Algarrobo",
    type: "Salida por venta",
    quantity: 1,
    date: "Hoy, 10:05",
    note: "Venta registrada"
  },
  {
    id: "mov-3",
    productId: "prod-bombilla-pico",
    productName: "Bombilla Pico de Loro Acero Inox.",
    type: "Ajuste manual",
    quantity: -2,
    date: "Ayer, 16:45",
    note: "Control de mostrador"
  }
];
