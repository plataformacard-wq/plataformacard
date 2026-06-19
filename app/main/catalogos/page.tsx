import { redirect } from "next/navigation";

export default function CatalogosPage() {
  redirect("/main/caas?tab=analise");
}