"use client";
import React from "react";
import { Upload, X, Camera, Image as ImageIcon, Calendar, Info, Clock, Users, Phone, ExternalLink, ShieldCheck, ChevronDown, Package, Globe, Copy, Trash2, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Settings } from "lucide-react";
import { getPublicUrl } from "@/lib/utils/url";



const dayNamesMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

import { VendedorHeaderControls } from "./form-sections/VendedorHeaderControls";
import { VendedorIdentityCard } from "./form-sections/VendedorIdentityCard";
import { VendedorContactCard } from "./form-sections/VendedorContactCard";
import { VendedorAccessCard } from "./form-sections/VendedorAccessCard";
import { VendedorFooterActions } from "./form-sections/VendedorFooterActions";

export default function VendedoresForm(props: any) {

  return (
    <>
      <motion.div 
        key="form"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full space-y-6"
      >
        <VendedorHeaderControls {...props} />

        {/* Ficha Completa (Igual ao Perfil) */}
        <div className="space-y-6">
          <VendedorIdentityCard {...props} />
          
          <VendedorContactCard {...props} />

          <VendedorAccessCard {...props} />

          <VendedorFooterActions {...props} />
        </div>
      </motion.div>
    </>
  );
}
