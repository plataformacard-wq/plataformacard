import { Suspense } from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout Seguro | PlataformaShop",
  description: "Conclua a assinatura do seu plano com garantia incondicional de reembolso de 7 dias.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
          <div className="w-8 h-8 border-4 border-[#2CCB68]/20 border-t-[#2CCB68] rounded-full animate-spin" />
        </main>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
