import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Box,
  ChartNoAxesColumn,
  ClipboardList,
  DollarSign,
  Home,
  Menu,
  PackagePlus,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  Warehouse
} from "lucide-react";
import {
  categories,
  initialClients,
  initialOrders,
  initialProducts,
  initialSales,
  initialStockMovements,
  orderStatuses,
  paymentMethods
} from "./data/mockData";
import { formatCurrency, todayLabel, uid } from "./utils/formatters";

const navItems = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "productos", label: "Productos", icon: Box },
  { key: "ventas", label: "Ventas", icon: ShoppingBag },
  { key: "pedidos", label: "Pedidos", icon: ClipboardList },
  { key: "clientes", label: "Clientes", icon: UsersRound },
  { key: "catalogo", label: "Catálogo", icon: BookOpen },
  { key: "reportes", label: "Reportes", icon: ChartNoAxesColumn },
  { key: "configuracion", label: "Configuración", icon: Settings }
];

const emptyProduct = {
  name: "",
  category: "Yerbas",
  price: "",
  cost: "",
  stock: "",
  unit: "unidad",
  description: "",
  image: "",
  active: true
};

const productTone = {
  Yerbas: "yerba",
  Mates: "mate",
  Materas: "cuero",
  Bombillas: "bombilla",
  Termos: "termo",
  Accesorios: "accesorio"
};

export default function App() {
  const [activePage, setActivePage] = useState("inicio");
  const [globalSearch, setGlobalSearch] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [clients, setClients] = useState(initialClients);
  const [orders, setOrders] = useState(initialOrders);
  const [sales, setSales] = useState(initialSales);
  const [stockMovements, setStockMovements] = useState(initialStockMovements);

  const stats = useMemo(() => {
    const stockTotal = products.reduce((sum, product) => sum + Number(product.stock), 0);
    const inventoryValue = products.reduce(
      (sum, product) => sum + Number(product.stock) * Number(product.cost),
      0
    );
    const todaySales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const pendingOrders = orders.filter((order) =>
      ["Nuevo", "Pendiente de pago", "Pagado", "Preparado"].includes(order.status)
    ).length;
    return { stockTotal, inventoryValue, todaySales, pendingOrders };
  }, [orders, products, sales]);

  const addStockMovement = (movement) => {
    setStockMovements((current) => [{ id: uid("mov"), date: todayLabel(), ...movement }, ...current]);
  };

  const upsertProduct = (payload) => {
    if (payload.id) {
      setProducts((current) =>
        current.map((product) =>
          product.id === payload.id
            ? {
                ...product,
                ...payload,
                price: Number(payload.price),
                cost: Number(payload.cost),
                stock: Number(payload.stock)
              }
            : product
        )
      );
      return;
    }

    setProducts((current) => [
      {
        ...payload,
        id: uid("prod"),
        price: Number(payload.price),
        cost: Number(payload.cost),
        stock: Number(payload.stock)
      },
      ...current
    ]);
  };

  const deleteProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const applyStockMovement = ({ productId, type, quantity, note }) => {
    const amount = Number(quantity);
    const selected = products.find((product) => product.id === productId);
    if (!selected || !amount) return;

    const signedAmount =
      type === "Ingreso de stock" ? amount : type === "Salida por venta" ? -amount : amount;

    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, stock: Math.max(0, Number(product.stock) + signedAmount) }
          : product
      )
    );
    addStockMovement({
      productId,
      productName: selected.name,
      type,
      quantity: signedAmount,
      note: note || "Movimiento manual"
    });
  };

  const registerSale = ({ items, method, client }) => {
    const saleItems = items
      .map((item) => {
        const selected = products.find((product) => product.id === item.productId);
        const quantity = Number(item.quantity);
        return selected && quantity > 0
          ? { product: selected, quantity }
          : null;
      })
      .filter(Boolean);

    const totalsByProduct = saleItems.reduce((acc, item) => {
      acc[item.product.id] = (acc[item.product.id] || 0) + item.quantity;
      return acc;
    }, {});
    const canSell =
      saleItems.length > 0 &&
      Object.entries(totalsByProduct).every(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId);
        return product && quantity <= product.stock;
      });
    if (!canSell) return false;

    const sale = {
      id: uid("sale"),
      client: client || "Sin cliente",
      method,
      date: todayLabel(),
      items: saleItems.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price
      })),
      total: saleItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    };

    setProducts((current) =>
      current.map((product) => {
        const soldQuantity = totalsByProduct[product.id] || 0;
        return soldQuantity ? { ...product, stock: Number(product.stock) - soldQuantity } : product;
      })
    );

    setSales((current) => [sale, ...current]);
    saleItems.forEach(({ product, quantity }) => {
      addStockMovement({
        productId: product.id,
        productName: product.name,
        type: "Salida por venta",
        quantity: -quantity,
        note: `Venta ${method}`
      });
    });
    return true;
  };

  const addOrder = (order) => {
    const selected = products.find((product) => product.id === order.productId);
    if (!selected) return;
    const quantity = Number(order.quantity);
    setOrders((current) => [
      {
        id: uid("order"),
        client: order.client,
        whatsapp: order.whatsapp,
        items: [{ productId: selected.id, name: selected.name, quantity, price: selected.price }],
        total: selected.price * quantity,
        status: order.status,
        date: todayLabel(),
        notes: order.notes
      },
      ...current
    ]);
  };

  const updateOrderStatus = (id, status) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const upsertClient = (client) => {
    if (client.id) {
      setClients((current) => current.map((item) => (item.id === client.id ? client : item)));
      return;
    }
    setClients((current) => [{ ...client, id: uid("client"), purchases: [] }, ...current]);
  };

  const deleteClient = (id) => {
    setClients((current) => current.filter((client) => client.id !== id));
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main">
        <Header value={globalSearch} onChange={setGlobalSearch} />
        {activePage === "inicio" && (
          <Dashboard
            stats={stats}
            clients={clients}
            orders={orders}
            products={products}
            stockMovements={stockMovements}
            setActivePage={setActivePage}
          />
        )}
        {activePage === "productos" && (
          <ProductsPage
            products={products}
            onSave={upsertProduct}
            onDelete={deleteProduct}
            onStockMovement={applyStockMovement}
          />
        )}
        {activePage === "ventas" && (
          <SalesPage products={products} clients={clients} sales={sales} onRegister={registerSale} />
        )}
        {activePage === "pedidos" && (
          <OrdersPage
            products={products}
            orders={orders}
            onAdd={addOrder}
            onStatusChange={updateOrderStatus}
          />
        )}
        {activePage === "clientes" && (
          <ClientsPage clients={clients} onSave={upsertClient} onDelete={deleteClient} />
        )}
        {activePage === "catalogo" && <CatalogPage products={products} />}
        {activePage === "reportes" && (
          <ReportsPage products={products} sales={sales} orders={orders} stats={stats} />
        )}
        {activePage === "configuracion" && <SettingsPage />}
        <span className="global-search-note">
          {globalSearch ? `Buscando en la app: ${globalSearch}` : ""}
        </span>
      </main>
    </div>
  );
}

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">CJ</div>
        <h1>Cagna Junín</h1>
        <p>Artesanía · Tradición · Calidad</p>
      </div>
      <nav className="menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={activePage === item.key ? "active" : ""}
              onClick={() => setActivePage(item.key)}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-note">
        <h3>Gestión integral</h3>
        <p>Controlá productos, ventas, stock, pedidos y catálogo desde un solo lugar.</p>
      </div>
    </aside>
  );
}

function Header({ value, onChange }) {
  return (
    <header className="topbar">
      <button className="hamburger" aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <label className="search">
        <Search size={18} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type="text"
          placeholder="Buscar productos, clientes, pedidos..."
        />
      </label>
      <div className="top-actions">
        <button className="notification" aria-label="Notificaciones">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <div className="profile">
          <div className="avatar">CJ</div>
          <div className="profile-info">
            <strong>Cagna Junín</strong>
            <small>Administrador</small>
          </div>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ stats, clients, orders, products, stockMovements, setActivePage }) {
  const lowStock = products.filter((product) => product.stock <= 7);

  return (
    <>
      <section className="kpi-grid">
        <KpiCard icon={DollarSign} title="Ventas hoy" value={formatCurrency(stats.todaySales)} note="+12% vs ayer" />
        <KpiCard icon={ClipboardList} title="Pedidos pendientes" value={stats.pendingOrders} note="Ver pedidos" gold />
        <KpiCard icon={Warehouse} title="Productos en stock" value={stats.stockTotal} note="Unidades disponibles" />
        <KpiCard icon={UserRound} title="Clientes registrados" value={clients.length} note="Base activa" gold />
      </section>

      <section className="section-card">
        <h2 className="section-title">Acciones rápidas</h2>
        <div className="quick-actions">
          <QuickAction icon={Plus} label="Cargar producto" onClick={() => setActivePage("productos")} />
          <QuickAction icon={ShoppingBag} label="Registrar venta" onClick={() => setActivePage("ventas")} />
          <QuickAction icon={PackagePlus} label="Ingreso de stock" onClick={() => setActivePage("productos")} />
          <QuickAction icon={SlidersHorizontal} label="Ajuste de stock" onClick={() => setActivePage("productos")} />
          <QuickAction icon={ClipboardList} label="Nuevo pedido" onClick={() => setActivePage("pedidos")} />
          <QuickAction icon={BookOpen} label="Generar catálogo" onClick={() => setActivePage("catalogo")} />
        </div>
      </section>

      <section className="content-grid">
        <section className="products-panel">
          <PanelHeader title="Productos destacados" action="Ver todo" onAction={() => setActivePage("productos")} />
          <div className="products-grid compact">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <aside className="right-column">
          <StockSummary products={products} lowStock={lowStock} stats={stats} stockMovements={stockMovements} />
          <section className="catalog-card">
            <PanelHeader title="Catálogo y comunicación" />
            <p className="muted">Generá tu catálogo de productos y compartilo con clientes por WhatsApp.</p>
            <div className="catalog-actions">
              <button className="btn-primary" onClick={() => setActivePage("catalogo")}>
                Generar catálogo
              </button>
              <button className="btn-outline" onClick={() => setActivePage("catalogo")}>
                Compartir por WhatsApp
              </button>
            </div>
          </section>
          <section className="list-card">
            <PanelHeader title="Pedidos recientes" />
            {orders.slice(0, 3).map((order) => (
              <MiniRow key={order.id} title={order.client} meta={`${order.status} · ${formatCurrency(order.total)}`} />
            ))}
          </section>
        </aside>
      </section>
    </>
  );
}

function KpiCard({ icon: Icon, title, value, note, gold = false }) {
  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <div className={`kpi-icon ${gold ? "gold" : "green"}`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="kpi-title">{title}</div>
          <div className="kpi-value">{value}</div>
        </div>
      </div>
      <span className="kpi-link">{note}</span>
    </article>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button className="action-btn" onClick={onClick}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function PanelHeader({ title, action, onAction }) {
  return (
    <div className="card-head">
      <h3>{title}</h3>
      {action && (
        <button className="small-btn" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function ProductsPage({ products, onSave, onDelete, onStockMovement }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [editing, setEditing] = useState(null);
  const [stockForm, setStockForm] = useState({ productId: products[0]?.id || "", type: "Ingreso de stock", quantity: 1, note: "" });

  const filtered = products.filter((product) => {
    const categoryMatch = category === "Todos" || product.category === category;
    const queryMatch = product.name.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  });

  return (
    <section className="page-grid">
      <div className="products-panel">
        <div className="products-head">
          <h2 className="section-title">Gestión de productos</h2>
          <div className="products-tools">
            <input className="mini-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos..." />
            <button className="tool-btn">Filtros</button>
          </div>
        </div>
        <CategoryFilters value={category} onChange={setCategory} />
        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={() => setEditing(product)} onDelete={() => onDelete(product.id)} />
          ))}
        </div>
      </div>
      <aside className="right-column">
        <ProductForm product={editing} onCancel={() => setEditing(null)} onSave={(payload) => { onSave(payload); setEditing(null); }} />
        <StockPanelForm
          products={products}
          value={stockForm}
          onChange={setStockForm}
          onSubmit={onStockMovement}
        />
      </aside>
    </section>
  );
}

function CategoryFilters({ value, onChange }) {
  return (
    <div className="filters">
      {["Todos", ...categories].map((item) => (
        <button key={item} className={value === item ? "chip active" : "chip"} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className={`product-card ${!product.active ? "inactive" : ""}`}>
      <div className={`product-image ${productTone[product.category] || "accesorio"}`}>
        {product.image ? <img src={product.image} alt={product.name} /> : <span>{product.name}</span>}
      </div>
      <div className="product-body">
        <div className="product-meta-line">
          <span className="tag">{product.category}</span>
          <span className={product.active ? "status active" : "status"}>{product.active ? "Activo" : "Inactivo"}</span>
        </div>
        <div className="product-title">{product.name}</div>
        <p className="product-description">{product.description}</p>
        <div className="product-price">{formatCurrency(product.price)}</div>
        <div className="stock-text">Costo: {formatCurrency(product.cost)} · Stock: {product.stock} {product.unit}</div>
        {(onEdit || onDelete) && (
          <div className="card-actions">
            {onEdit && <button className="btn-outline small" onClick={onEdit}>Editar</button>}
            {onDelete && <button className="icon-danger" onClick={onDelete} aria-label={`Eliminar ${product.name}`}><Trash2 size={17} /></button>}
          </div>
        )}
      </div>
    </article>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product || emptyProduct);

  useEffect(() => setForm(product || emptyProduct), [product]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.price || !form.cost) return;
    onSave({ ...form, stock: form.stock || 0 });
    setForm(emptyProduct);
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (file) update("image", URL.createObjectURL(file));
  };

  return (
    <section className="form-card">
      <PanelHeader title={product ? "Editar producto" : "Agregar producto"} />
      <form onSubmit={submit}>
        <label className="upload-box">
          {form.image ? <img src={form.image} alt="Vista previa" /> : <div><strong>Subir imagen</strong><p>Seleccioná una foto para usar preview local.</p></div>}
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>
        <div className="form-grid">
          <Field label="Nombre del producto" full><input value={form.name} onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Categoría" full><select value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Costo"><input type="number" value={form.cost} onChange={(event) => update("cost", event.target.value)} /></Field>
          <Field label="Precio de venta"><input type="number" value={form.price} onChange={(event) => update("price", event.target.value)} /></Field>
          <Field label="Stock disponible"><input type="number" value={form.stock} onChange={(event) => update("stock", event.target.value)} /></Field>
          <Field label="Unidad"><select value={form.unit} onChange={(event) => update("unit", event.target.value)}><option>unidad</option><option>kg</option><option>pack</option></select></Field>
          <Field label="Descripción" full><textarea value={form.description} onChange={(event) => update("description", event.target.value)} /></Field>
        </div>
        <label className="toggle-row">
          <span>Producto activo</span>
          <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />
        </label>
        <div className="save-wrap">
          {product && <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>}
          <button className="btn-save" type="submit">{product ? "Guardar cambios" : "Guardar producto"}</button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children, full = false }) {
  return (
    <label className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function StockPanelForm({ products, value, onChange, onSubmit }) {
  return (
    <section className="stock-card">
      <PanelHeader title="Control de stock" />
      <p className="muted">Registrá ingresos, ajustes manuales o salidas por venta.</p>
      <div className="form-grid single">
        <Field label="Producto" full><select value={value.productId} onChange={(event) => onChange({ ...value, productId: event.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
        <Field label="Movimiento"><select value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}><option>Ingreso de stock</option><option>Ajuste manual</option><option>Salida por venta</option></select></Field>
        <Field label="Cantidad"><input type="number" value={value.quantity} onChange={(event) => onChange({ ...value, quantity: event.target.value })} /></Field>
        <Field label="Observación" full><input value={value.note} onChange={(event) => onChange({ ...value, note: event.target.value })} placeholder="Ej: reposición, control, rotura..." /></Field>
      </div>
      <button className="btn-primary full" onClick={() => onSubmit(value)}>Registrar movimiento</button>
    </section>
  );
}

function StockSummary({ products, lowStock, stats, stockMovements }) {
  return (
    <section className="stock-card">
      <PanelHeader title="Control de stock" />
      <div className="stock-grid">
        <div className="stock-block">
          <h4>Alertas de stock bajo</h4>
          {lowStock.slice(0, 4).map((product) => (
            <div className="alert-item" key={product.id}>
              <span className="dot" />
              <div><strong>{product.name}</strong><br /><span className="muted">Stock: {product.stock} unidades</span></div>
            </div>
          ))}
        </div>
        <div className="stock-block">
          <h4>Stock disponible</h4>
          <div className="big-number">{stats.stockTotal}</div>
          <div className="muted">unidades</div>
          <h4>Valor de inventario</h4>
          <div className="inventory-value">{formatCurrency(stats.inventoryValue)}</div>
        </div>
        <div className="stock-block">
          <h4>Movimientos recientes</h4>
          {stockMovements.slice(0, 4).map((movement) => (
            <div className="movement" key={movement.id}>
              <strong>{movement.type}</strong>
              {movement.productName}<br />
              <span className="muted">{movement.date} · {movement.quantity > 0 ? "+" : ""}{movement.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SalesPage({ products, clients, sales, onRegister }) {
  const [sale, setSale] = useState({
    items: [{ productId: products[0]?.id || "", quantity: 1 }],
    method: "Efectivo",
    client: ""
  });
  const total = sale.items.reduce((sum, item) => {
    const selected = products.find((product) => product.id === item.productId);
    return sum + (selected ? selected.price * Number(item.quantity || 0) : 0);
  }, 0);

  const updateItem = (index, key, value) => {
    setSale((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addItem = () => {
    setSale((current) => ({
      ...current,
      items: [...current.items, { productId: products[0]?.id || "", quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    setSale((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  return (
    <section className="page-grid">
      <div className="form-card">
        <PanelHeader title="Registrar venta" />
        <div className="sale-items">
          {sale.items.map((item, index) => (
            <div className="sale-item-row" key={`${item.productId}-${index}`}>
              <Field label="Producto">
                <select value={item.productId} onChange={(event) => updateItem(index, "productId", event.target.value)}>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} · Stock {product.stock}</option>)}
                </select>
              </Field>
              <Field label="Cantidad">
                <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
              </Field>
              {sale.items.length > 1 && (
                <button className="icon-danger sale-remove" onClick={() => removeItem(index)} aria-label="Quitar producto">
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="btn-outline add-line" onClick={addItem}>Agregar otro producto</button>
        <div className="form-grid sale-details">
          <Field label="Método de pago"><select value={sale.method} onChange={(event) => setSale({ ...sale, method: event.target.value })}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></Field>
          <Field label="Cliente opcional" full><select value={sale.client} onChange={(event) => setSale({ ...sale, client: event.target.value })}><option value="">Sin cliente</option>{clients.map((client) => <option key={client.id}>{client.name}</option>)}</select></Field>
        </div>
        <div className="total-bar"><span>Total automático</span><strong>{formatCurrency(total)}</strong></div>
        <button
          className="btn-save"
          onClick={() => {
            const ok = onRegister(sale);
            if (ok) setSale({ items: [{ productId: products[0]?.id || "", quantity: 1 }], method: "Efectivo", client: "" });
          }}
        >
          Registrar venta
        </button>
      </div>
      <div className="list-card">
        <PanelHeader title="Historial de ventas" />
        {sales.map((item) => <MiniRow key={item.id} title={`${item.client} · ${item.method}`} meta={`${item.date} · ${formatCurrency(item.total)}`} />)}
      </div>
    </section>
  );
}

function OrdersPage({ products, orders, onAdd, onStatusChange }) {
  const [form, setForm] = useState({ client: "", whatsapp: "", productId: products[0]?.id || "", quantity: 1, status: "Nuevo", notes: "" });
  return (
    <section className="page-grid">
      <div className="form-card">
        <PanelHeader title="Nuevo pedido" />
        <div className="form-grid">
          <Field label="Cliente"><input value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} /></Field>
          <Field label="WhatsApp"><input value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></Field>
          <Field label="Producto" full><select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
          <Field label="Cantidad"><input type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></Field>
          <Field label="Estado"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
          <Field label="Observaciones" full><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
        </div>
        <button className="btn-save" onClick={() => onAdd(form)}>Guardar pedido</button>
      </div>
      <div className="list-card">
        <PanelHeader title="Pedidos" />
        {orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div><strong>{order.client}</strong><span>{order.whatsapp} · {order.date}</span><p>{order.items.map((item) => `${item.quantity} x ${item.name}`).join(", ")}</p><p>{order.notes}</p></div>
            <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select>
            <strong>{formatCurrency(order.total)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClientsPage({ clients, onSave, onDelete }) {
  const [form, setForm] = useState({ name: "", whatsapp: "", instagram: "", notes: "" });
  const [editingId, setEditingId] = useState("");

  const editClient = (client) => {
    setEditingId(client.id);
    setForm({
      id: client.id,
      name: client.name,
      whatsapp: client.whatsapp,
      instagram: client.instagram,
      notes: client.notes,
      purchases: client.purchases
    });
  };

  const resetClientForm = () => {
    setEditingId("");
    setForm({ name: "", whatsapp: "", instagram: "", notes: "" });
  };

  return (
    <section className="page-grid">
      <div className="form-card">
        <PanelHeader title={editingId ? "Editar cliente" : "Agregar cliente"} />
        <div className="form-grid">
          <Field label="Nombre"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="WhatsApp"><input value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></Field>
          <Field label="Instagram opcional" full><input value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} /></Field>
          <Field label="Observaciones" full><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
        </div>
        <div className="save-wrap">
          {editingId && <button className="btn-outline" onClick={resetClientForm}>Cancelar</button>}
          <button className="btn-save" onClick={() => { onSave(form); resetClientForm(); }}>Guardar cliente</button>
        </div>
      </div>
      <div className="client-grid">
        {clients.map((client) => (
          <article className="client-card" key={client.id}>
            <div className="avatar">{client.name.slice(0, 2).toUpperCase()}</div>
            <h3>{client.name}</h3>
            <p>{client.whatsapp} {client.instagram ? `· ${client.instagram}` : ""}</p>
            <span>{client.purchases?.length || 0} compras registradas</span>
            <small>{client.notes}</small>
            <div className="client-actions">
              <button className="btn-outline small" onClick={() => editClient(client)}>Editar</button>
              <button className="icon-danger" onClick={() => onDelete(client.id)}><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CatalogPage({ products }) {
  const [category, setCategory] = useState("Todos");
  const [selectedIds, setSelectedIds] = useState(products.filter((product) => product.active && product.stock > 0).map((product) => product.id));
  const available = products.filter((product) => product.active && product.stock > 0 && (category === "Todos" || product.category === category));
  const selected = products.filter((product) => selectedIds.includes(product.id));
  const message = `Hola, te compartimos el catálogo actualizado de Cagna Junín. Tenemos mates, yerbas, termos, bombillas, materas y accesorios. Consultanos disponibilidad antes de comprar.\n\n${selected.map((product) => `${product.name} - ${formatCurrency(product.price)}`).join("\n")}`;
  const link = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <section className="page-grid">
      <div className="products-panel">
        <PanelHeader title="Catálogo para WhatsApp" />
        <CategoryFilters value={category} onChange={setCategory} />
        <div className="catalog-select-list">
          {available.map((product) => (
            <label key={product.id} className="select-row">
              <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} />
              <span>{product.name}</span>
              <strong>{formatCurrency(product.price)}</strong>
            </label>
          ))}
        </div>
      </div>
      <aside className="catalog-preview">
        <PanelHeader title="Vista previa" />
        <div className="preview-brand">Cagna Junín</div>
        <p>Catálogo actualizado</p>
        {selected.map((product) => (
          <MiniRow key={product.id} title={product.name} meta={`${product.category} · ${formatCurrency(product.price)}`} />
        ))}
        <a className="btn-save link-button" href={link} target="_blank" rel="noreferrer">Compartir por WhatsApp</a>
      </aside>
    </section>
  );
}

function ReportsPage({ products, sales, orders, stats }) {
  const soldItems = sales.flatMap((sale) => sale.items);
  const topProducts = [...soldItems].sort((a, b) => b.quantity - a.quantity).slice(0, 4);
  const categorySales = categories.map((category) => ({
    category,
    total: soldItems
      .filter((item) => products.find((product) => product.id === item.productId)?.category === category)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  })).filter((item) => item.total > 0);

  return (
    <>
      <section className="kpi-grid">
        <KpiCard icon={WalletCards} title="Ventas totales" value={formatCurrency(stats.todaySales)} note={`${sales.length} operaciones`} />
        <KpiCard icon={ClipboardList} title="Pedidos activos" value={orders.length} note="En seguimiento" gold />
        <KpiCard icon={Warehouse} title="Inventario" value={formatCurrency(stats.inventoryValue)} note="Valor estimado" />
        <KpiCard icon={Bell} title="Stock bajo" value={products.filter((product) => product.stock <= 7).length} note="Revisar reposición" gold />
      </section>
      <section className="page-grid">
        <div className="list-card"><PanelHeader title="Productos más vendidos" />{topProducts.map((item) => <MiniRow key={`${item.productId}-${item.name}`} title={item.name} meta={`${item.quantity} unidades · ${formatCurrency(item.price * item.quantity)}`} />)}</div>
        <div className="list-card"><PanelHeader title="Categorías con más ventas" />{categorySales.map((item) => <MiniRow key={item.category} title={item.category} meta={formatCurrency(item.total)} />)}</div>
      </section>
    </>
  );
}

function SettingsPage() {
  return (
    <section className="form-card">
      <PanelHeader title="Configuración" />
      <div className="settings-grid">
        <MiniRow title="Marca" meta="Cagna Junín" />
        <MiniRow title="Canales" meta="WhatsApp, Instagram y showroom" />
        <MiniRow title="Base de datos" meta="Preparado para conectar Supabase, Firebase o API propia" />
        <MiniRow title="Estado" meta="Modo local con datos mock" />
      </div>
    </section>
  );
}

function MiniRow({ title, meta }) {
  return (
    <div className="mini-row">
      <span>{title}</span>
      <strong>{meta}</strong>
    </div>
  );
}
