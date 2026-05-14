import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResourceManagementClient from "@/components/admin/ResourceManagementClient";

export const metadata: Metadata = {
  title: "Gestão de Recursos | Super Admin",
  description: "Monitoramento de capacidade e saúde do SaaS",
};

export default async function RecursosPage() {
  return (
    <ResourceManagementClient />
  );
}
