import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Loader2, Check, RotateCcw } from 'lucide-react'
import { enhanceDescriptionWithAI, correctGrammarWithAI } from '@/lib/ai-actions'

interface AiAssistButtonProps {
  /** Dados do formulário que já foram preenchidos */
  formData: Record<string, any>
  /** Callback para aplicar as sugestões recebidas */
  onApply: (suggestions: Record<string, any>) => void
  /** Função que determina se o assistente pode ser ativado */
  canActivate: (data: Record<string, any>) => boolean
  /** Callback para desfazer a última alteração */
  onUndo?: () => void
  /** Indica se existe algo para desfazer */
  canUndo?: boolean
}

export const AiAssistButton: React.FC<AiAssistButtonProps> = ({ 
  formData, onApply, canActivate, onUndo, canUndo 
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasContent = !!(formData.description && formData.description.replace(/<[^>]*>/g, '').trim().length > 0)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEnhance = async () => {
    if (!canActivate(formData)) return
    setLoading(true)
    setError(null)
    setShowDropdown(false)
    try {
      const result = await enhanceDescriptionWithAI({
        name: formData.name,
        currentDescription: formData.description,
        price: formData.price
      })
      if (result.success && result.data) {
        onApply({ description: result.data })
      } else {
        setError(result.error || 'Erro ao melhorar texto')
      }
    } catch (e) {
      setError('Falha na comunicação com a IA')
    } finally {
      setLoading(false)
    }
  }

  const handleGrammarFix = async () => {
    if (!hasContent) return
    setLoading(true)
    setError(null)
    setShowDropdown(false)
    try {
      const result = await correctGrammarWithAI(formData.description)
      if (result.success && result.data) {
        onApply({ description: result.data })
      } else {
        setError(result.error || 'Erro ao corrigir gramática')
      }
    } catch (e) {
      setError('Falha ao processar gramática')
    } finally {
      setLoading(false)
    }
  }

  const handleUndo = () => {
    if (onUndo) {
      onUndo()
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="flex items-center shadow-lg shadow-emerald-500/10 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={handleEnhance}
          disabled={loading || !canActivate(formData)}
          className={`flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest`}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles size={14} className="text-white" />
          )}
          {hasContent ? 'Melhorar com IA' : 'Escrever com IA'}
        </button>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading || (!canActivate(formData) && !hasContent && !canUndo)}
          className="px-2 py-2 bg-emerald-600 text-white border-l border-white/10 hover:bg-emerald-700 disabled:opacity-50"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl z-[100] overflow-hidden border"
            style={{ 
              background: "var(--dash-surface)", 
              borderColor: "var(--dash-border)" 
            }}
          >
            <div className="p-2 space-y-1">
              <button
                onClick={handleEnhance}
                disabled={!canActivate(formData)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide rounded-xl transition-colors disabled:opacity-40"
                style={{ color: "var(--dash-text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--dash-hover-bg)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--dash-text-primary)";
                }}
              >
                <span>Melhorar Descrição</span>
                <Sparkles size={12} className="text-emerald-500" />
              </button>
              
              <button
                onClick={handleGrammarFix}
                disabled={!hasContent}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide rounded-xl transition-colors disabled:opacity-40"
                style={{ color: "var(--dash-text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--dash-hover-bg)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--dash-text-primary)";
                }}
              >
                <span>Corrigir Gramática</span>
                <Check size={12} className="text-emerald-500" />
              </button>

              {canUndo && (
                <button
                  onClick={handleUndo}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-amber-600 rounded-xl transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span>Desfazer alteração</span>
                  <RotateCcw size={12} className="text-amber-600" />
                </button>
              )}
            </div>
            <div className="p-3 border-t" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
              <p className="text-[9px] font-medium leading-tight" style={{ color: "var(--dash-text-muted)" }}>
                A IA usará o nome e preço do produto para criar um texto de alta conversão.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-full left-0 mt-2 w-max bg-red-50 text-red-600 text-[10px] font-bold p-2 rounded-lg border border-red-100 shadow-sm z-[110]">
          {error}
        </div>
      )}
    </div>
  )
}
