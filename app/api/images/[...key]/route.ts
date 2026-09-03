import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET(_:Request,{params}:{params:Promise<{key:string[]}>}){
  const {key}=await params;
  const object=await (env as unknown as {BUCKET:R2Bucket}).BUCKET.get(key.join("/"));
  if(!object) return new Response("Imagen no encontrada",{status:404});
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("cache-control","public, max-age=3600");
  return new Response(object.body,{headers});
}
