import { getFullPlatformConfig } from "@/lib/admin-actions";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const configs = await getFullPlatformConfig();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
          Admin Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
          Cockpit de controle global: Gestão de acessos, segurança e parâmetros operacionais.
        </p>
      </div>

      <SettingsManager configs={configs} />
    </div>
  );
}
