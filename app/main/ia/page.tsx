import { getFullPlatformConfig } from "@/lib/admin-actions";
import IAManager from "./IAManager";

export const dynamic = "force-dynamic";

export default async function IAPage() {
  const configs = await getFullPlatformConfig();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
          Inteligência Artificial
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
          Cockpit de controle da IA: Prompts de sistema, modelos e temperatura.
        </p>
      </div>

      <IAManager configs={configs} />
    </div>
  );
}
