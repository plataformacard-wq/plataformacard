import { PanelLayout } from "@/components/dashboard/PanelLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelLayout>{children}</PanelLayout>;
}