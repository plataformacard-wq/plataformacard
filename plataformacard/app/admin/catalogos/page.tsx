import { redirect } from "next/navigation";

export default function CatalogosPage() {
  redirect("/admin/caas?tab=analise");
}