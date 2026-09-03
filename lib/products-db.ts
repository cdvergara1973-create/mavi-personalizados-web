import { getRawDb } from "@/db";
import { defaultProducts, Product } from "@/lib/catalog";

type ProductRow = {
  id:string; name:string; short_name:string; category:string; description:string;
  price:number; image_url:string; tag:string|null; sizes:string; colors:string;
  active:number; sort_order:number;
};

const selectSql = `SELECT id, name, short_name, category, description, price, image_url, tag, sizes, colors, active, sort_order FROM products ORDER BY sort_order ASC, name ASC`;

function fromRow(row:ProductRow):Product {
  return { id:row.id, name:row.name, shortName:row.short_name, category:row.category, description:row.description, price:row.price, image:row.image_url, tag:row.tag??undefined, sizes:JSON.parse(row.sizes||"[]"), colors:JSON.parse(row.colors||"[]"), active:Boolean(row.active), sortOrder:row.sort_order };
}

export async function seedProductsIfEmpty() {
  const db=getRawDb();
  const count=await db.prepare("SELECT COUNT(*) AS count FROM products").first<{count:number}>();
  if(Number(count?.count??0)>0) return;
  const statements=defaultProducts.map(product=>db.prepare(`INSERT OR IGNORE INTO products (id, name, short_name, category, description, price, image_url, tag, sizes, colors, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(product.id,product.name,product.shortName,product.category,product.description,product.price,product.image,product.tag??null,JSON.stringify(product.sizes??[]),JSON.stringify(product.colors??[]),product.active===false?0:1,product.sortOrder??0));
  await db.batch(statements);
}

export async function listProducts(includeInactive=false):Promise<Product[]> {
  await seedProductsIfEmpty();
  const result=await getRawDb().prepare(includeInactive?selectSql:`${selectSql.replace(" ORDER BY", " WHERE active = 1 ORDER BY")}`).all<ProductRow>();
  return result.results.map(fromRow);
}

export function normalizeProduct(value:Partial<Product>):Product {
  const slug=String(value.id||value.shortName||value.name||crypto.randomUUID()).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return { id:slug||crypto.randomUUID(), name:String(value.name||"").trim(), shortName:String(value.shortName||value.name||"").trim(), category:String(value.category||"Otros").trim(), description:String(value.description||"").trim(), price:Math.max(0,Math.round(Number(value.price)||0)), image:String(value.image||"/products/taza.png"), tag:value.tag?String(value.tag).trim():undefined, sizes:Array.isArray(value.sizes)?value.sizes.map(String).filter(Boolean):[], colors:Array.isArray(value.colors)?value.colors.map(String).filter(Boolean):[], active:value.active!==false, sortOrder:Math.max(0,Math.round(Number(value.sortOrder)||0)) };
}
