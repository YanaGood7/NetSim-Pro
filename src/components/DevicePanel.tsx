import { Monitor, Waypoints, Router } from "lucide-react";
import { DeviceType } from "@/types/network";
import { useI18n } from "@/hooks/useI18n";

interface DevicePanelProps {
  onDragStart: (type: DeviceType) => void;
}

const deviceTypes: { type: DeviceType; labelKey: string; icon: React.ReactNode }[] = [
  { type: "pc", labelKey: "device.pc", icon: <Monitor className="w-5 h-5" /> },
  { type: "switch", labelKey: "device.switch", icon: <Waypoints className="w-5 h-5" /> },
  { type: "router", labelKey: "device.router", icon: <Router className="w-5 h-5" /> },
];

export default function DevicePanel({ onDragStart }: DevicePanelProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-[10px] font-display font-semibold uppercase tracking-[0.2em] text-primary neon-text mb-2">
        {t("panel.devices")}
      </h3>
      {deviceTypes.map(({ type, labelKey, icon }) => (
        <div
          key={type}
          draggable
          onDragStart={() => onDragStart(type)}
          className={`group flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none ${
            type === "pc"
              ? "border-neon-cyan/20 hover:border-neon-cyan/40 hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)]"
              : type === "switch"
              ? "border-neon-green/20 hover:border-neon-green/40 hover:shadow-[0_0_15px_hsl(var(--neon-green)/0.15)]"
              : "border-neon-orange/20 hover:border-neon-orange/40 hover:shadow-[0_0_15px_hsl(var(--neon-orange)/0.15)]"
          } bg-secondary/30 hover:bg-secondary/50`}
        >
          <div
            className={`p-2 rounded-lg ${
              type === "pc"
                ? "bg-neon-cyan/10 text-neon-cyan"
                : type === "switch"
                ? "bg-neon-green/10 text-neon-green"
                : "bg-neon-orange/10 text-neon-orange"
            }`}
          >
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground">{t(labelKey)}</span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        {t("panel.drag_hint")}
      </p>
    </div>
  );
}
