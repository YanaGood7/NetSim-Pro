import { useRef, useState, useCallback, useEffect } from "react";
import { Monitor, Waypoints, Router } from "lucide-react";
import { NetworkDevice, Cable, PacketAnimation } from "@/types/network";
import { useI18n } from "@/hooks/useI18n";

interface NetworkCanvasProps {
  devices: NetworkDevice[];
  cables: Cable[];
  packets: PacketAnimation[];
  selectedDevice: string | null;
  connectingFrom: string | null;
  onDropDevice: (x: number, y: number) => void;
  onMoveDevice: (id: string, x: number, y: number) => void;
  onSelectDevice: (id: string | null) => void;
  onConnectTo: (id: string) => void;
}

const DEVICE_SIZE = 64;

function DeviceIcon({ type }: { type: string }) {
  const iconClass = "w-6 h-6";
  if (type === "pc") return <Monitor className={iconClass} />;
  if (type === "switch") return <Waypoints className={iconClass} />;
  return <Router className={iconClass} />;
}

function getDeviceStyles(type: string) {
  if (type === "pc")
    return {
      border: "border-neon-cyan/40",
      bg: "bg-neon-cyan/10",
      text: "text-neon-cyan",
      glow: "shadow-[0_0_20px_hsl(var(--neon-cyan)/0.2)]",
      selectedGlow: "shadow-[0_0_30px_hsl(var(--neon-cyan)/0.4)]",
    };
  if (type === "switch")
    return {
      border: "border-neon-green/40",
      bg: "bg-neon-green/10",
      text: "text-neon-green",
      glow: "shadow-[0_0_20px_hsl(var(--neon-green)/0.2)]",
      selectedGlow: "shadow-[0_0_30px_hsl(var(--neon-green)/0.4)]",
    };
  return {
    border: "border-neon-orange/40",
    bg: "bg-neon-orange/10",
    text: "text-neon-orange",
    glow: "shadow-[0_0_20px_hsl(var(--neon-orange)/0.2)]",
    selectedGlow: "shadow-[0_0_30px_hsl(var(--neon-orange)/0.4)]",
  };
}

export default function NetworkCanvas({
  devices,
  cables,
  packets,
  selectedDevice,
  connectingFrom,
  onDropDevice,
  onMoveDevice,
  onSelectDevice,
  onConnectTo,
}: NetworkCanvasProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - DEVICE_SIZE / 2;
      const y = e.clientY - rect.top - DEVICE_SIZE / 2;
      onDropDevice(x, y);
    },
    [onDropDevice]
  );

  const handleMouseDown = (e: React.MouseEvent, device: NetworkDevice) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectingFrom) {
      onConnectTo(device.id);
      return;
    }
    draggingRef.current = {
      id: device.id,
      offsetX: e.clientX - device.x,
      offsetY: e.clientY - device.y,
    };
    setDraggingId(device.id);
  };

  // Use window-level mouse events for smooth, glitch-free dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { id, offsetX, offsetY } = draggingRef.current;
      onMoveDevice(id, e.clientX - offsetX, e.clientY - offsetY);
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        onSelectDevice(draggingRef.current.id);
        draggingRef.current = null;
        setDraggingId(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onMoveDevice, onSelectDevice]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectDevice(null);
    }
  };

  const getPacketPos = (p: PacketAnimation) => {
    const from = devices.find(d => d.id === p.fromId);
    const to = devices.find(d => d.id === p.toId);
    if (!from || !to) return null;
    return {
      x: from.x + DEVICE_SIZE / 2 + (to.x - from.x) * p.progress,
      y: from.y + DEVICE_SIZE / 2 + (to.y - from.y) * p.progress,
    };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-canvas overflow-hidden scanline select-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--canvas-grid)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onClick={handleCanvasClick}
    >
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Cables */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="cable-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="packet-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {cables.map((cable) => {
          const from = devices.find(d => d.id === cable.from);
          const to = devices.find(d => d.id === cable.to);
          if (!from || !to) return null;
          return (
            <g key={cable.id}>
              <line
                x1={from.x + DEVICE_SIZE / 2}
                y1={from.y + DEVICE_SIZE / 2}
                x2={to.x + DEVICE_SIZE / 2}
                y2={to.y + DEVICE_SIZE / 2}
                stroke="hsl(var(--cable))"
                strokeWidth={2}
                strokeDasharray="8 4"
                filter="url(#cable-glow)"
                className="animate-data-flow"
              />
            </g>
          );
        })}
        {/* Packets */}
        {packets.map((p) => {
          const pos = getPacketPos(p);
          if (!pos) return null;
          return (
            <g key={p.id} filter="url(#packet-glow)">
              <circle
                cx={pos.x}
                cy={pos.y}
                r={7}
                fill={p.type === "request" ? "hsl(var(--packet))" : "hsl(var(--neon-green))"}
                opacity={0.9}
              >
                <animate
                  attributeName="r"
                  values="5;9;5"
                  dur="0.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={pos.x} cy={pos.y} r={3} fill="white" opacity={0.8} />
            </g>
          );
        })}
      </svg>

      {/* Connecting mode indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/20 text-primary text-xs font-display tracking-wider uppercase px-5 py-2 rounded-full neon-glow border border-primary/30 z-20 animate-pulse-neon">
          {t("canvas.connecting")}
        </div>
      )}

      {/* Devices */}
      {devices.map((device) => {
        const styles = getDeviceStyles(device.type);
        const isSelected = selectedDevice === device.id;
        const isDragging = draggingId === device.id;
        return (
          <div
            key={device.id}
            className={`absolute flex flex-col items-center select-none ${
              isDragging ? "cursor-grabbing z-20" : "cursor-grab"
            } ${isSelected ? "z-10" : "z-0"}`}
            style={{
              left: device.x,
              top: device.y,
              width: DEVICE_SIZE,
              // No transition while dragging for instant response
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              transform: isSelected && !isDragging ? "scale(1.1)" : "scale(1)",
            }}
            onMouseDown={(e) => handleMouseDown(e, device)}
          >
            <div
              className={`flex items-center justify-center rounded-xl border-2 ${styles.border} ${styles.bg} ${styles.text} ${
                isSelected ? styles.selectedGlow : styles.glow
              } ${connectingFrom ? "hover:ring-2 hover:ring-primary" : ""}`}
              style={{
                width: DEVICE_SIZE,
                height: DEVICE_SIZE,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              }}
            >
              <DeviceIcon type={device.type} />
            </div>
            <span className="text-[10px] font-semibold text-foreground mt-1.5 whitespace-nowrap bg-card/90 px-1.5 py-0.5 rounded-md border border-border/50">
              {device.name}
            </span>
            {device.ipAddress && (
              <span className="text-[8px] font-mono text-primary/70 whitespace-nowrap mt-0.5">
                {device.ipAddress}
              </span>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {devices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-3 opacity-30">
              <Monitor className="w-8 h-8 text-neon-cyan" />
              <Waypoints className="w-8 h-8 text-neon-green" />
              <Router className="w-8 h-8 text-neon-orange" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              {t("canvas.empty")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
