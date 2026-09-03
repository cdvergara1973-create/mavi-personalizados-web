import { env } from "cloudflare:workers";
import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";
import { redirect } from "next/navigation";

function configuredAdminEmail(): string {
  return ((env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function isAdminRequest(): Promise<boolean> {
  const user = await getChatGPTUser();
  const allowed = configuredAdminEmail();
  return Boolean(user && allowed && user.email.toLowerCase() === allowed);
}

export async function requireAdminPage() {
  const user = await requireChatGPTUser("/admin");
  const allowed = configuredAdminEmail();
  if (!allowed || user.email.toLowerCase() !== allowed) redirect("/");
  return user;
}
