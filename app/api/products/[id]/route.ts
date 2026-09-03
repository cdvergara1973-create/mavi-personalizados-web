import { NextRequest, NextResponse } from "next/server";
import { getRawDb } from "@/db";
import { isAdminRequest } from "@/lib/admin";
import { normalizeProduct } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest())) return NextResponse.json({error:"No autorizado"},{status:401});
  try{
    const {id}=await params;
    const product=normalizeProduct({...await request.json(),id});
    if(!product.name||!product.shortName) return NextResponse.json({error:"Nombre requerido"},{status:400});
    const result=await getRawDb().prepare(`UPDATE products SET name = ?, short_name = ?, category = ?, description = ?, price = ?, image_url = ?, tag = ?, sizes = ?, colors = ?, active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(product.name,product.shortName,product.category,product.description,product.price,product.image,product.tag??null,JSON.stringify(product.sizes??[]),JSON.stringify(product.colors??[]),product.active===false?0:1,product.sortOrder??0,id).run();
    if(!result.meta.changes) return NextResponse.json({error:"Producto no encontrado"},{status:404});
    return NextResponse.json(product);
  }catch{return NextResponse.json({error:"No fue posible guardar los cambios"},{status:400})}
}

export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest())) return NextResponse.json({error:"No autorizado"},{status:401});
  const {id}=await params;
  const result=await getRawDb().prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  if(!result.meta.changes) return NextResponse.json({error:"Producto no encontrado"},{status:404});
  return new NextResponse(null,{status:204});
}
