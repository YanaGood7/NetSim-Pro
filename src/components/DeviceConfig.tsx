import { useState } from "react";
import { NetworkDevice } from "@/types/network";
import { isValidIp, isValidSubnetMask } from "@/utils/networkUtils";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Link, Send, Table, Monitor, Waypoints, Router } from "lucide-react";

interface DeviceConfigProps {
  device: NetworkDevice;
  allDevices: NetworkDevice[];
  onUpdate: (id: string, updates: Partial<NetworkDevice>) => void;
  onDelete: (id: string) => void;
  onConnect: (id: string) => void;
  onPing: (fromId: string, toId: string) => void;
  onShowTable: (id: string) => void;
}

function DeviceTypeIcon({ type }: { type: string }) {
  if (type === "pc") return <Monitor className="w-4 h-4" />;
  if (type === "switch") return <Waypoints className="w-4 h-4" />;
  return <Router className="w-4 h-4" />;
}

export default function DeviceConfig({
  device,
  allDevices,
  onUpdate,
  onDelete,
  onConnect,
  onPing,
  onShowTable,
}: DeviceConfigProps) {
  const { t } = useI18n();
  const [pingTarget, setPingTarget] = useState("");

  const otherDevices = allDevices.filter(d => d.id !== device.id && d.ipAddress);

  const typeColor =
    device.type === "pc"
      ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10"
      : device.type === "switch"
      ? "text-neon-green border-neon-green/30 bg-neon-green/10"
      : "text-neon-orange border-neon-orange/30 bg-neon-orange/10";

  return (
    <div className="p-4 space-y-4">
      {/* Device header */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${typeColor}`}>
          <DeviceTypeIcon type={device.type} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-bold text-foreground truncate">{device.name}</h3>
          <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            {t(`device.${device.type}`)}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("config.name")}</Label>
        <Input
          value={device.name}
          onChange={(e) => onUpdate(device.id, { name: e.target.value })}
          className="h-8 text-sm bg-secondary/30 border-border/50 focus:border-primary/50"
        />
      </div>

      {/* MAC */}
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("config.mac")}</Label>
        <Input value={device.macAddress} readOnly className="h-8 text-xs font-mono bg-muted/30 border-border/30 text-muted-foreground" />
      </div>

      {/* IP Config */}
      {(device.type === "pc" || device.type === "router") && (
        <div className="space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/30">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("config.ip")}</Label>
            <Input
              value={device.ipAddress}
              onChange={(e) => onUpdate(device.id, { ipAddress: e.target.value })}
              placeholder="192.168.1.1"
              className={`h-8 text-sm font-mono bg-background/50 ${
                device.ipAddress && !isValidIp(device.ipAddress)
                  ? "border-destructive focus:border-destructive"
                  : "border-border/50 focus:border-primary/50"
              }`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("config.subnet")}</Label>
            <Input
              value={device.subnetMask}
              onChange={(e) => onUpdate(device.id, { subnetMask: e.target.value })}
              placeholder="255.255.255.0"
              className={`h-8 text-sm font-mono bg-background/50 ${
                device.subnetMask && !isValidSubnetMask(device.subnetMask)
                  ? "border-destructive"
                  : "border-border/50"
              }`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("config.gateway")}</Label>
            <Input
              value={device.gateway}
              onChange={(e) => onUpdate(device.id, { gateway: e.target.value })}
              placeholder="192.168.1.1"
              className="h-8 text-sm font-mono bg-background/50 border-border/50"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Label className="text-[10px] font-display uppercase tracking-wider text-primary">{t("config.actions")}</Label>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onConnect(device.id)}
          className="w-full justify-start gap-2 neon-border hover:bg-primary/10 hover:text-primary"
        >
          <Link className="w-4 h-4" /> {t("config.connect")}
        </Button>

        {(device.type === "switch" || device.type === "router") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShowTable(device.id)}
            className="w-full justify-start gap-2 neon-border-accent hover:bg-accent/10 hover:text-accent"
          >
            <Table className="w-4 h-4" />
            {device.type === "switch" ? t("config.mac_table") : t("config.routing_table")}
          </Button>
        )}

        {/* Ping */}
        {device.type !== "switch" && otherDevices.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-xl bg-neon-green/5 border border-neon-green/20">
            <Label className="text-[10px] uppercase tracking-wider text-neon-green">{t("config.ping_target")}</Label>
            <div className="flex gap-1.5">
              <select
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                className="flex-1 h-8 text-xs rounded-lg border border-border/50 bg-background/50 px-2 text-foreground"
              >
                <option value="">{t("config.select_target")}</option>
                {otherDevices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ipAddress})
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => {
                  if (pingTarget) onPing(device.id, pingTarget);
                }}
                disabled={!pingTarget}
                className="h-8 bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(device.id)}
          className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 mt-2"
        >
          <Trash2 className="w-4 h-4" /> {t("config.delete")}
        </Button>
      </div>
    </div>
  );
}
