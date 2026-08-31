import { useState, useMemo } from "react";
import { formatPrice } from "../utils";

export interface CatalogProductItem {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  image_url?: string | null;
}

export interface UseB2bFastOrderProps {
  products: CatalogProductItem[];
  b2bPrices: Record<string, number>;
  clientToken: string;
  companyName: string;
  whatsappNumber?: string | null;
  onClose: () => void;
}

export interface OrderSuccessState {
  orderId: string;
  blingOrderId?: string | null;
  totalAmount: number;
  savedItems: any[];
  savedNotes: string;
}

export function useB2bFastOrder({
  products,
  b2bPrices,
  clientToken,
  companyName,
  whatsappNumber,
  onClose,
}: UseB2bFastOrderProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessState | null>(null);

  const handleQuantityChange = (productId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const selectedItems = useMemo(() => {
    return products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => {
        const price = b2bPrices[p.sku || ""] ?? p.price ?? 0;
        const qty = quantities[p.id];
        return {
          id: p.id,
          sku: p.sku || p.id,
          name: p.name,
          price,
          quantity: qty,
          subtotal: qty * price,
        };
      });
  }, [products, quantities, b2bPrices]);

  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  }, [quantities]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [selectedItems]);

  const totalMarketAmount = useMemo(() => {
    return products.reduce((acc, p) => {
      const qty = quantities[p.id] || 0;
      const anchor = p.compare_at_price && p.compare_at_price > (p.price || 0) ? p.compare_at_price : (p.price || 0);
      return acc + (anchor * qty);
    }, 0);
  }, [products, quantities]);

  const totalEconomy = useMemo(() => {
    return Math.max(0, totalMarketAmount - totalAmount);
  }, [totalMarketAmount, totalAmount]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Mensagem formatada do WhatsApp Mockup
  const whatsappFormattedText = useMemo(() => {
    const itemsToFormat = orderSuccess ? orderSuccess.savedItems : selectedItems;
    const currentNotes = orderSuccess ? orderSuccess.savedNotes : notes;
    const total = orderSuccess ? orderSuccess.totalAmount : totalAmount;

    let msg = `🏢 *NOVO PEDIDO ATACADO B2B*\n`;
    msg += `*Empresa:* ${companyName}\n`;
    if (orderSuccess?.orderId) {
      msg += `*ID do Pedido:* ${orderSuccess.orderId}\n`;
    }
    msg += `------------------------------------\n`;

    itemsToFormat.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.quantity}x* ${item.name} (${item.sku || "N/A"})\n`;
      msg += `   └ Valor: ${formatPrice(item.price)} un. | Subtotal: ${formatPrice(item.subtotal)}\n`;
    });

    msg += `------------------------------------\n`;
    msg += `📦 *Total de Itens:* ${itemsToFormat.reduce((acc, it) => acc + it.quantity, 0)} unidades\n`;
    msg += `💰 *Valor Total do Pedido:* ${formatPrice(total)}\n`;

    if (currentNotes.trim()) {
      msg += `📝 *Observações / Faturamento:* ${currentNotes.trim()}\n`;
    }

    return msg;
  }, [companyName, orderSuccess, selectedItems, notes, totalAmount]);

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      alert("Selecione a quantidade de pelo menos um produto para continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/b2b/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: clientToken,
          items: selectedItems,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({
          orderId: data.orderId,
          blingOrderId: data.blingOrderId,
          totalAmount: data.totalAmount,
          savedItems: [...selectedItems],
          savedNotes: notes,
        });
      } else {
        alert(data.error || "Erro ao processar pedido B2B.");
      }
    } catch (err) {
      alert("Erro de conexão ao enviar pedido B2B.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!whatsappNumber) {
      alert("Número do WhatsApp da empresa não cadastrado.");
      return;
    }
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(whatsappFormattedText)}`;
    window.open(url, "_blank");
  };

  const handleResetAndClose = () => {
    setQuantities({});
    setNotes("");
    setOrderSuccess(null);
    onClose();
  };

  return {
    quantities,
    notes,
    setNotes,
    searchQuery,
    setSearchQuery,
    loading,
    showNotes,
    setShowNotes,
    orderSuccess,
    handleQuantityChange,
    selectedItems,
    totalQuantity,
    totalAmount,
    totalMarketAmount,
    totalEconomy,
    filteredProducts,
    whatsappFormattedText,
    handleSubmitOrder,
    handleSendToWhatsApp,
    handleResetAndClose,
  };
}
