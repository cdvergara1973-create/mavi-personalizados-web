"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Boxes, Check, Edit3, Eye, EyeOff, ImageUp, LogOut, Package, Plus, Search, Store, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/catalog";

type Props={adminName:string;signOutPath:string};
type ProductDraft=Product&{sizesText:string;colorsText:string};
const money=new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0});
const emptyDraft:ProductDraft={id:"",name:"",shortName:"",category:"Textil",description:"",price:0,image:"/products/taza.png",tag:"",sizes:[],colors:[],active:true,sortOrder:0,sizesText:"",colorsText:""};

function toDraft(product?:Product):ProductDraft{
  if(!product)return{...emptyDraft};
  return{...product,sizesText:(product.sizes??[]).join(", "),colorsText:(product.colors??[]).join(", ")};
}

export default function AdminClient({adminName,signOutPath}:Props){
 const [products,setProducts]=useState<Product[]>([]);
 const [loading,setLoading]=useState(true);
 const [query,setQuery]=useState("");
 const [draft,setDraft]=useState<ProductDraft|null>(null);
 const [saving,setSaving]=useState(false);
 const [uploading,setUploading]=useState(false);
 const [message,setMessage]=useState("");
 const [pendingDelete,setPendingDelete]=useState<Product|null>(null);

 async function loadProducts(){
  setLoading(true);
  try{const response=await fetch("/api/products?all=1",{cache:"no-store"});if(!response.ok)throw new Error();setProducts(await response.json())}
  catch{setMessage("No pudimos cargar los productos. Intenta nuevamente.")}
  finally{setLoading(false)}
 }
 useEffect(()=>{
  let active=true;
  fetch("/api/products?all=1",{cache:"no-store"}).then(response=>response.ok?response.json():Promise.reject()).then(data=>{if(active)setProducts(data)}).catch(()=>{if(active)setMessage("No pudimos cargar los productos. Intenta nuevamente.")}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);

 const filtered=useMemo(()=>products.filter(product=>`${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())),[products,query]);
 const activeCount=products.filter(product=>product.active!==false).length;
 const categoryCount=new Set(products.map(product=>product.category)).size;

 function change<K extends keyof ProductDraft>(key:K,value:ProductDraft[K]){setDraft(current=>current?{...current,[key]:value}:current)}

 async function uploadImage(file:File){
  setUploading(true);setMessage("");
  try{const body=new FormData();body.append("file",file);const response=await fetch("/api/uploads",{method:"POST",body});const result=await response.json();if(!response.ok)throw new Error(result.error);change("image",result.url)}
  catch(error){setMessage(error instanceof Error?error.message:"No fue posible subir la imagen")}
  finally{setUploading(false)}
 }

 async function saveProduct(event:FormEvent){
  event.preventDefault();if(!draft)return;setSaving(true);setMessage("");
  const payload={...draft,sizes:draft.sizesText.split(",").map(value=>value.trim()).filter(Boolean),colors:draft.colorsText.split(",").map(value=>value.trim()).filter(Boolean)};
  const editing=Boolean(draft.id);
  try{const response=await fetch(editing?`/api/products/${draft.id}`:"/api/products",{method:editing?"PUT":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error);setDraft(null);setMessage(editing?"Producto actualizado correctamente.":"Producto agregado correctamente.");await loadProducts()}
  catch(error){setMessage(error instanceof Error?error.message:"No fue posible guardar el producto")}
  finally{setSaving(false)}
 }

 async function toggleProduct(product:Product){
  const response=await fetch(`/api/products/${product.id}`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({...product,active:product.active===false})});
  if(response.ok){setMessage(product.active===false?"Producto publicado.":"Producto ocultado de la tienda.");await loadProducts()}else setMessage("No fue posible cambiar la visibilidad.")
 }

 async function deleteProduct(){
  if(!pendingDelete)return;
  const response=await fetch(`/api/products/${pendingDelete.id}`,{method:"DELETE"});
  if(response.ok){setMessage("Producto eliminado.");setPendingDelete(null);await loadProducts()}else setMessage("No fue posible eliminar el producto.")
 }

 return <main className="admin-shell">
  <aside className="admin-sidebar"><div className="admin-brand"><Image src="/brand/mavi-personalizados-logo.png" alt="MAVI Personalizados" width={180} height={180}/><span>ADMIN</span></div><nav><a className="active" href="#productos"><Boxes/>Productos</a><a href="/" target="_blank"><Store/>Ver tienda</a></nav><div className="admin-user"><div><b>{adminName}</b><small>Administrador</small></div><a href={signOutPath} target="_top" aria-label="Cerrar sesión"><LogOut/></a></div></aside>

  <section className="admin-main"><header><div><p>ADMINISTRACIÓN</p><h1>Productos</h1></div><button className="admin-primary" onClick={()=>setDraft(toDraft())}><Plus/>Agregar producto</button></header>
   {message&&<div className="admin-message"><Check/>{message}<button onClick={()=>setMessage("")}><X/></button></div>}
   <div className="admin-stats"><article><span><Package/></span><div><small>Productos totales</small><strong>{products.length}</strong></div></article><article><span><Eye/></span><div><small>Publicados</small><strong>{activeCount}</strong></div></article><article><span><Boxes/></span><div><small>Categorías</small><strong>{categoryCount}</strong></div></article></div>
   <div className="admin-toolbar"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por nombre o categoría"/></label><span>{filtered.length} productos</span></div>
   <div id="productos" className="product-table"><div className="table-head"><span>Producto</span><span>Categoría</span><span>Precio</span><span>Estado</span><span>Acciones</span></div>{loading?<div className="admin-empty">Cargando productos…</div>:filtered.map(product=><article key={product.id}><div className="admin-product"><Image unoptimized src={product.image} alt="" width={58} height={58}/><div><b>{product.name}</b><small>{product.shortName}</small></div></div><span>{product.category}</span><strong>{money.format(product.price)}</strong><button className={`status ${product.active===false?"hidden":""}`} onClick={()=>toggleProduct(product)}>{product.active===false?<><EyeOff/>Oculto</>:<><Eye/>Publicado</>}</button><div className="row-actions"><button onClick={()=>setDraft(toDraft(product))} aria-label={`Editar ${product.name}`}><Edit3/></button><button className="danger" onClick={()=>setPendingDelete(product)} aria-label={`Eliminar ${product.name}`}><Trash2/></button></div></article>)}{!loading&&!filtered.length&&<div className="admin-empty">No hay productos que coincidan con la búsqueda.</div>}</div>
  </section>

  {draft&&<div className="admin-overlay" onMouseDown={()=>setDraft(null)}><form className="product-editor" onSubmit={saveProduct} onMouseDown={event=>event.stopPropagation()}><div className="editor-head"><div><p>{draft.id?"EDITAR PRODUCTO":"NUEVO PRODUCTO"}</p><h2>{draft.id?draft.name:"Agregar al catálogo"}</h2></div><button type="button" onClick={()=>setDraft(null)}><X/></button></div><div className="editor-body"><div className="image-editor"><div className="image-preview"><Image unoptimized src={draft.image} alt="Vista previa del producto" width={220} height={220}/></div><label className="upload-button"><ImageUp/>{uploading?"Subiendo imagen…":"Cambiar imagen"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event=>{const file=event.target.files?.[0];if(file)void uploadImage(file)}}/></label><small>PNG, JPG o WebP. Máximo 5 MB.</small></div><div className="fields"><div className="field-grid"><label>Nombre del producto<input required value={draft.name} onChange={event=>change("name",event.target.value)} placeholder="Ej. Taza personalizada"/></label><label>Nombre corto<input required value={draft.shortName} onChange={event=>change("shortName",event.target.value)} placeholder="Ej. Tazas"/></label></div><label>Categoría<input required value={draft.category} onChange={event=>change("category",event.target.value)} list="category-list"/><datalist id="category-list"><option value="Textil"/><option value="Accesorios"/><option value="Tazas y vasos"/><option value="Detalles"/><option value="Celebraciones"/></datalist></label><label>Descripción<textarea required rows={4} value={draft.description} onChange={event=>change("description",event.target.value)}/></label><div className="field-grid"><label>Precio desde ($)<input required min="0" type="number" value={draft.price} onChange={event=>change("price",Number(event.target.value))}/></label><label>Orden de aparición<input min="0" type="number" value={draft.sortOrder??0} onChange={event=>change("sortOrder",Number(event.target.value))}/></label></div><div className="field-grid"><label>Tallas <small>Separadas por coma</small><input value={draft.sizesText} onChange={event=>change("sizesText",event.target.value)} placeholder="S, M, L, XL"/></label><label>Colores <small>Separados por coma</small><input value={draft.colorsText} onChange={event=>change("colorsText",event.target.value)} placeholder="Blanco, Negro, Rojo"/></label></div><label>Etiqueta promocional<input value={draft.tag??""} onChange={event=>change("tag",event.target.value)} placeholder="Ej. Nuevo o Más vendido"/></label><label className="switch-row"><input type="checkbox" checked={draft.active!==false} onChange={event=>change("active",event.target.checked)}/><span><b>Publicar producto</b><small>Será visible inmediatamente en la tienda.</small></span></label></div></div><div className="editor-actions"><button type="button" onClick={()=>setDraft(null)}>Cancelar</button><button className="admin-primary" type="submit" disabled={saving||uploading}>{saving?"Guardando…":"Guardar producto"}</button></div></form></div>}

  {pendingDelete&&<div className="admin-overlay"><section className="confirm-dialog"><span><Trash2/></span><h2>¿Eliminar este producto?</h2><p><b>{pendingDelete.name}</b> desaparecerá de la administración y de la tienda. Esta acción no se puede deshacer.</p><div><button onClick={()=>setPendingDelete(null)}>Cancelar</button><button className="delete-confirm" onClick={deleteProduct}>Sí, eliminar</button></div></section></div>}
 </main>
}
