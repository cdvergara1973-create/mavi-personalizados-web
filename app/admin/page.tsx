import { requireAdminPage } from "@/lib/admin";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import AdminClient from "./AdminClient";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage(){
  const user=await requireAdminPage();
  return <AdminClient adminName={user.displayName} signOutPath={chatGPTSignOutPath("/")}/>;
}
