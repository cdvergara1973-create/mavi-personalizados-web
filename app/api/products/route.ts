import { NextRequest, NextResponse } from "next/server";
import { getRawDb } from "@/db";
import { isAdminRequest } from "@/lib/admin";
import { listProducts, normalizeProduct } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export async function GET(request:NextRequest){
  const wantsAll=request.nextUrl.searchParams.get("all")==="1";
  if(wantsAll && !(await isAdminRequest())) return NextResponse.json({error:"No autorizado"},{status:401});
  try{return NextResponse.json(await listProducts(wantsAll))}
  catch{return NextResponse.json({error:"No fue posible cargar los productos"},{status:500})}
}

export async function POST(request:NextRequest){
  if(!(await isAdminRequest())) return NextResponse.json({error:"No autorizado"},{status:401});
  try{
    const product=normalizeProduct(await request.json());
    if(!product.name||!product.shortName) return NextResponse.json({error:"Nombre requerido"},{status:400});
    await getRawDb().prepare(`INSERT INTO products (id, name, short_name, category, description, price, image_url, tag, sizes, colors, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(product.id,product.name,product.shortName,product.category,product.description,product.price,product.image,product.tag??null,JSON.stringify(product.sizes??[]),JSON.stringify(product.colors??[]),product.active===false?0:1,product.sortOrder??0).run();
    return NextResponse.json(product,{status:201});
  }catch(error){
    const message=error instanceof Error&&error.message.includes("UNIQUE")?"Ya existe un producto con ese identificador":"No fue posible crear el producto";
    return NextResponse.json({error:message},{status:400});
  }
}
