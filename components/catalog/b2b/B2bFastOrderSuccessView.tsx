import React from "react";
import { CheckCircle2, MessageCircle, CheckCheck } from "lucide-react";
import { formatPrice } from "../utils";
import { OrderSuccessState } from "../hooks/useB2bFastOrder";

interface B2bFastOrderSuccessViewProps {
  orderSuccess: OrderSuccessState;
  whatsappFormattedText: string;
  whatsappNumber?: string | null;
  onSendToWhatsApp: () => void;
  onResetAndClose: () => void;
}

export const B2bFastOrderSuccessView: React.FC<B2bFastOrderSuccessViewProps> = ({
  orderSuccess,
  whatsappFormattedText,
  whatsappNumber,
  onSendToWhatsApp,
  onResetAndClose,
}) => {
  return (
    <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg shrink-0">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <div className="text-center space-y-1.5 max-w-md">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--public-text-main)]">
          Pedido B2B Concluído com Sucesso!
        </h3>
        <p className="text-xs sm:text-sm text-[var(--public-text-dim)] leading-relaxed">
          Seu pedido de{" "}
          <strong className="text-emerald-500 font-extrabold">
            {formatPrice(orderSuccess.totalAmount)}
          </strong>{" "}
          foi registrado no sistema e integrado com a central de pedidos.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--public-bg)] border border-[var(--public-card-border)] text-xs font-mono text-[var(--public-text-dim)] mt-2">
          <span>ID:</span>
          <strong className="text-[var(--public-text-main)]">{orderSuccess.orderId}</strong>
        </div>
      </div>

      {/* Mockup Visual de Mensagem do WhatsApp */}
      <div className="w-full max-w-md bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-2xl border border-[var(--public-card-border)] shadow-inner space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Comprovante WhatsApp (Pré-visualização)</span>
          </span>
          <span>Agora</span>
        </div>

        <div className="bg-white dark:bg-[#202c33] p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-xs font-sans space-y-2 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
          <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed select-text">
            {whatsappFormattedText}
          </pre>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
            <span>Enviado</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Ações de Finalização */}
      <div className="w-full max-w-md space-y-2.5 pt-2">
        {whatsappNumber && (
          <button
            onClick={onSendToWhatsApp}
            className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Comprovante no WhatsApp Comercial</span>
          </button>
        )}

        <button
          onClick={onResetAndClose}
          className="w-full py-3 px-6 rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card-bg)] text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
        >
          Voltar ao Catálogo
        </button>
      </div>
    </div>
  );
};
