import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";
const MAX_FILE_SIZE=5*1024*1024;

export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:"No autorizado"},{status:401});
  const form=await request.formData();
  const file=form.get("file");
  if(!(file instanceof File)) return NextResponse.json({error:"Selecciona una imagen"},{status:400});
  if(!file.type.startsWith("image/")) return NextResponse.json({error:"El archivo debe ser una imagen"},{status:400});
  if(file.size>MAX_FILE_SIZE) return NextResponse.json({error:"La imagen no puede superar 5 MB"},{status:400});
  const extension=(file.name.split(".").pop()||"jpg").replace(/[^a-zA-Z0-9]/g,"").toLowerCase();
  const key=`products/${crypto.randomUUID()}.${extension}`;
  const bucket=(env as unknown as {BUCKET:R2Bucket}).BUCKET;
  await bucket.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type},customMetadata:{originalName:file.name}});
  return NextResponse.json({url:`/api/images/${key}`});
}
