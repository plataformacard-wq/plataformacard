"use client";

import { useState, useCallback, useMemo } from "react";
import { Product, Spec } from "../types";
import { CartItem, CheckoutData } from "../types/cart";
import { trackLeadAction } from "@/app/actions/leads";

export function useShoppingCart(
  whatsappNumber: string | null,
  catalogName?: string | null,
  organizationId?: string | null,
  profileId?: string | null,
  fullName?: string | null
) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState<Product | null>(null);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [items]);

  const handleAddItem = useCallback(
    (product: Product, selectedColor?: string | null, selectedSpec?: Spec | null) => {
      // Create unique item id based on product and variations
      const colorKey = selectedColor || "";
      const specKey = selectedSpec ? `${selectedSpec.chave}:${selectedSpec.valor}` : "";
      const itemId = `${product.id}_${colorKey}_${specKey}`;

      const price = product.price || 0;

      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === itemId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: itemId,
              product,
              quantity: 1,
              selectedColor: selectedColor || null,
              selectedSpec: selectedSpec || null,
              unitPrice: price,
            },
          ];
        }
      });
    },
    []
  );

  const handleProductAddToCartClick = useCallback(
    (product: Product) => {
      handleAddItem(product);
    },
    [handleAddItem]
  );

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setItems([]);
  }, []);

  const handleSendOrder = useCallback(
    async (checkoutData: CheckoutData) => {
      if (!whatsappNumber || items.length === 0) return;
      const cleanNumber = whatsappNumber.replace(/\D/g, "");

      let message = `🛒 *NOVO PEDIDO - ${catalogName || "Catálogo Virtual"}*\n`;
      message += `------------------------------------\n`;

      items.forEach((item, idx) => {
        let line = `${idx + 1}. *${item.quantity}x* ${item.product.name}`;
        if (item.selectedColor) line += ` (${item.selectedColor})`;
        if (item.selectedSpec) line += ` [${item.selectedSpec.chave}: ${item.selectedSpec.valor}]`;
        line += ` - R$ ${(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}`;
        message += `${line}\n`;
      });

      message += `------------------------------------\n`;
      message += `💰 *Total dos Produtos:* R$ ${totalPrice.toFixed(2).replace(".", ",")}\n\n`;

      if (checkoutData.customerName) {
        message += `👤 *Cliente:* ${checkoutData.customerName}\n`;
      }
      message += `🚚 *Entrega:* ${
        checkoutData.deliveryMethod === "entrega" ? "Entrega em Casa" : "Retirada no Local"
      }\n`;
      if (checkoutData.deliveryMethod === "entrega" && checkoutData.address) {
        message += `📍 *Endereço:* ${checkoutData.address}\n`;
      }
      message += `💳 *Forma de Pagamento:* ${checkoutData.paymentMethod.toUpperCase()}\n`;
      if (checkoutData.notes) {
        message += `📝 *Observações:* ${checkoutData.notes}\n`;
      }

      // Track lead in Supabase/analytics
      try {
        if (profileId) {
          void trackLeadAction({
            organizationId: organizationId || undefined,
            profileId,
            productName: `Comanda Multi-produtos (${items.length} itens)`,
            sellerName: fullName || "Vendedor",
          });
        }
      } catch (err) {
        console.error("Erro ao registrar lead do carrinho:", err);
      }

      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    },
    [whatsappNumber, catalogName, items, totalPrice, organizationId, profileId, fullName]
  );

  return {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    variationProduct,
    setVariationProduct,
    handleAddItem,
    handleProductAddToCartClick,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    handleSendOrder,
  };
}
