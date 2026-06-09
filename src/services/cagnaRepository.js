import { supabase } from "../lib/supabaseClient";

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase no está configurado. Revisá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

export async function getProducts() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveProduct(product) {
  const client = ensureSupabase();
  const payload = {
    name: product.name,
    category: product.category,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    unit: product.unit,
    description: product.description,
    image_path: product.image_path || product.imagePath || null,
    active: product.active
  };

  const query = product.id
    ? client.from("products").update(payload).eq("id", product.id).select().single()
    : client.from("products").insert(payload).select().single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const client = ensureSupabase();
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function getClients() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveClient(clientData) {
  const client = ensureSupabase();
  const payload = {
    name: clientData.name,
    whatsapp: clientData.whatsapp,
    instagram: clientData.instagram,
    notes: clientData.notes
  };

  const query = clientData.id
    ? client.from("clients").update(payload).eq("id", clientData.id).select().single()
    : client.from("clients").insert(payload).select().single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSales() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("sales")
    .select("*, sale_items(*)")
    .order("sold_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrders() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .order("ordered_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getStockMovements() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadProductImage(file) {
  const client = ensureSupabase();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;

  const { data } = client.storage.from("product-images").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
