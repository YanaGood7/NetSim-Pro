import { useState, useCallback, useRef } from "react";
import { DeviceType } from "@/types/network";
import { useNetworkSimulator } from "@/hooks/useNetworkSimulator";
import { useI18n } from "@/hooks/useI18n";
import DevicePanel from "@/components/DevicePanel";
import NetworkCanvas from "@/components/NetworkCanvas";
import DeviceConfig from "@/components/DeviceConfig";
import LogPanel from "@/components/LogPanel";
import TableDialog from "@/components/TableDialog";
import WelcomeDialog from "@/components/WelcomeDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, Network, HelpCircle } from "lucide-react";

export default function Index() {
  const { t } = useI18n();
  const sim = useNetworkSimulator();
  const [dragType, setDragType] = useState<DeviceType | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("netsim-welcomed");
  });
  const [tableDialog, setTableDialog] = useState<{
    open: boolean;
    deviceId: string;
    type: "mac" | "routing";
  }>({ open: false, deviceId: "", type: "mac" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDev = sim.devices.find(d => d.id === sim.selectedDevice);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("netsim-welcomed", "true");
  };

  const handleDropDevice = useCallback(
    (x: number, y: number) => {
      if (dragType) {
        sim.addDevice(dragType, x, y);
        setDragType(null);
      }
    },
    [dragType, sim]
  );

  const handleConnectTo = useCallback(
    (id: string) => {
      if (sim.connectingFrom && sim.connectingFrom !== id) {
        sim.connectDevices(sim.connectingFrom, id);
        sim.setConnectingFrom(null);
      }
    },
    [sim]
  );

  const handleShowTable = (deviceId: string) => {
    const dev = sim.devices.find(d => d.id === deviceId);
    if (!dev) return;
    setTableDialog({
      open: true,
      deviceId,
      type: dev.type === "switch" ? "mac" : "routing",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 glass-strong relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 neon-glow">
            <Network className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xs font-display font-bold text-foreground tracking-wider uppercase neon-text">
            {t("app.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowWelcome(true)}
            className="gap-1.5 neon-border hover:bg-primary/10"
          >
            <HelpCircle className="w-3.5 h-3.5" /> {t("app.info")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={sim.saveTopology}
            className="gap-1.5 neon-border hover:bg-primary/10"
          >
            <Save className="w-3.5 h-3.5" /> {t("app.save")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 neon-border hover:bg-primary/10"
          >
            <Upload className="w-3.5 h-3.5" /> {t("app.load")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) sim.loadTopology(file);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={sim.clearAll}
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t("app.clear")}
          </Button>
          <div className="w-px h-5 bg-border/50 mx-1" />
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-56 border-r border-border/50 glass flex-shrink-0 overflow-y-auto">
          <DevicePanel onDragStart={setDragType} />
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative">
          <NetworkCanvas
            devices={sim.devices}
            cables={sim.cables}
            packets={sim.packets}
            selectedDevice={sim.selectedDevice}
            connectingFrom={sim.connectingFrom}
            onDropDevice={handleDropDevice}
            onMoveDevice={sim.moveDevice}
            onSelectDevice={sim.setSelectedDevice}
            onConnectTo={handleConnectTo}
          />
        </main>

        {/* Right sidebar */}
        <aside className="w-72 border-l border-border/50 glass flex-shrink-0 flex flex-col">
          <div className="flex-1 overflow-y-auto border-b border-border/30">
            {selectedDev ? (
              <DeviceConfig
                device={selectedDev}
                allDevices={sim.devices}
                onUpdate={sim.updateDevice}
                onDelete={sim.deleteDevice}
                onConnect={sim.startConnect}
                onPing={sim.simulatePing}
                onShowTable={handleShowTable}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-6 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-3 border border-border/30">
                    <Network className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p>{t("config.select_device")}</p>
                </div>
              </div>
            )}
          </div>
          <div className="h-52 flex-shrink-0">
            <LogPanel logs={sim.logs} />
          </div>
        </aside>
      </div>

      {/* Welcome */}
      <WelcomeDialog open={showWelcome} onClose={handleCloseWelcome} />

      {/* Table Dialog */}
      <TableDialog
        open={tableDialog.open}
        onClose={() => setTableDialog(prev => ({ ...prev, open: false }))}
        title={
          tableDialog.type === "mac"
            ? t("config.mac_table")
            : t("config.routing_table")
        }
        type={tableDialog.type}
        macEntries={
          tableDialog.type === "mac" ? sim.getMacTable(tableDialog.deviceId) : undefined
        }
        routingEntries={
          tableDialog.type === "routing"
            ? sim.getRoutingTable(tableDialog.deviceId)
            : undefined
        }
      />
    </div>
  );
}
