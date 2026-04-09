import { useState, useCallback, useRef } from "react";
import {
  NetworkDevice,
  Cable,
  DeviceType,
  SimulationLog,
  PacketAnimation,
  Topology,
} from "@/types/network";
import {
  generateId,
  generateMacAddress,
  areOnSameSubnet,
  findPath,
  isValidIp,
} from "@/utils/networkUtils";

let deviceCounters = { pc: 1, switch: 1, router: 1 };

export function useNetworkSimulator() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [cables, setCables] = useState<Cable[]>([]);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [packets, setPackets] = useState<PacketAnimation[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);

  const addLog = useCallback((message: string, type: SimulationLog["type"] = "info") => {
    setLogs(prev => [{ timestamp: new Date(), message, type }, ...prev].slice(0, 100));
  }, []);

  // Add a new device to the canvas
  const addDevice = useCallback((type: DeviceType, x: number, y: number) => {
    const name = `${type.charAt(0).toUpperCase() + type.slice(1)}${deviceCounters[type]++}`;
    const device: NetworkDevice = {
      id: generateId(),
      type,
      name,
      x,
      y,
      ipAddress: "",
      subnetMask: "255.255.255.0",
      gateway: "",
      macAddress: generateMacAddress(),
    };
    setDevices(prev => [...prev, device]);
    addLog(`Added ${type} "${name}"`);
  }, [addLog]);

  // Move a device on the canvas
  const moveDevice = useCallback((id: string, x: number, y: number) => {
    setDevices(prev => prev.map(d => (d.id === id ? { ...d, x, y } : d)));
  }, []);

  // Update device configuration
  const updateDevice = useCallback((id: string, updates: Partial<NetworkDevice>) => {
    setDevices(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    addLog(`Updated device configuration`);
  }, [addLog]);

  // Delete a device and its connections
  const deleteDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setCables(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedDevice(null);
    addLog(`Deleted device`);
  }, [addLog]);

  // Connect two devices with a cable
  const connectDevices = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    // Check if already connected
    const exists = cables.some(
      c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );
    if (exists) {
      addLog("Devices are already connected", "error");
      return;
    }
    const cable: Cable = { id: generateId(), from: fromId, to: toId };
    setCables(prev => [...prev, cable]);
    const fromDev = devices.find(d => d.id === fromId);
    const toDev = devices.find(d => d.id === toId);
    addLog(`Connected ${fromDev?.name} ↔ ${toDev?.name}`);
  }, [cables, devices, addLog]);

  // Delete a cable
  const deleteCable = useCallback((id: string) => {
    setCables(prev => prev.filter(c => c.id !== id));
    addLog("Removed cable");
  }, [addLog]);

  // Start connecting mode
  const startConnect = useCallback((deviceId: string) => {
    setConnectingFrom(deviceId);
    addLog("Click another device to connect...");
  }, [addLog]);

  // Simulate ping between two devices
  const simulatePing = useCallback((fromId: string, toId: string) => {
    const fromDev = devices.find(d => d.id === fromId);
    const toDev = devices.find(d => d.id === toId);
    if (!fromDev || !toDev) return;

    // Validation checks
    if (!isValidIp(fromDev.ipAddress) || !isValidIp(toDev.ipAddress)) {
      addLog(`Ping failed: Invalid IP configuration`, "error");
      return;
    }

    // Find physical path
    const path = findPath(fromId, toId, cables);
    if (!path) {
      addLog(`Ping ${fromDev.ipAddress} → ${toDev.ipAddress}: No route (devices not connected)`, "error");
      return;
    }

    // Check subnet
    const sameSubnet = areOnSameSubnet(
      fromDev.ipAddress, fromDev.subnetMask,
      toDev.ipAddress, toDev.subnetMask
    );

    if (!sameSubnet) {
      // Check if there's a router in the path
      const hasRouter = path.some(id => {
        const dev = devices.find(d => d.id === id);
        return dev?.type === "router";
      });
      if (!hasRouter) {
        addLog(
          `Ping ${fromDev.ipAddress} → ${toDev.ipAddress}: Failed - different subnets, no router in path`,
          "error"
        );
        return;
      }
    }

    addLog(`Ping ${fromDev.ipAddress} → ${toDev.ipAddress}: Sending ICMP request...`);

    // Animate packet along each hop of the path
    const animateAlongPath = (pathSegments: string[], isReply: boolean) => {
      let currentSegment = 0;
      const packetId = generateId();

      const animateSegment = () => {
        if (currentSegment >= pathSegments.length - 1) {
          setPackets(prev => prev.filter(p => p.id !== packetId));
          if (isReply) {
            addLog(`Ping ${fromDev.ipAddress} → ${toDev.ipAddress}: Reply received! TTL=64`, "success");
          } else {
            // Start reply animation
            setTimeout(() => animateAlongPath([...pathSegments].reverse(), true), 200);
          }
          return;
        }

        const segFrom = pathSegments[currentSegment];
        const segTo = pathSegments[currentSegment + 1];

        setPackets(prev => [
          ...prev.filter(p => p.id !== packetId),
          {
            id: packetId,
            fromId: segFrom,
            toId: segTo,
            progress: 0,
            type: isReply ? "reply" : "request",
            status: "in-progress",
          },
        ]);

        let progress = 0;
        const step = () => {
          progress += 0.03;
          if (progress >= 1) {
            currentSegment++;
            animateSegment();
            return;
          }
          setPackets(prev =>
            prev.map(p => (p.id === packetId ? { ...p, progress } : p))
          );
          animFrameRef.current = requestAnimationFrame(step);
        };
        animFrameRef.current = requestAnimationFrame(step);
      };

      animateSegment();
    };

    animateAlongPath(path, false);
  }, [devices, cables, addLog]);

  // Get MAC address table for a switch
  const getMacTable = useCallback((deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device || device.type !== "switch") return [];

    const connectedCables = cables.filter(c => c.from === deviceId || c.to === deviceId);
    return connectedCables.map((cable, i) => {
      const otherId = cable.from === deviceId ? cable.to : cable.from;
      const otherDev = devices.find(d => d.id === otherId);
      return {
        macAddress: otherDev?.macAddress || "unknown",
        port: `Fa0/${i + 1}`,
        deviceName: otherDev?.name || "unknown",
      };
    });
  }, [devices, cables]);

  // Get routing table for a router
  const getRoutingTable = useCallback((deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device || device.type !== "router") return [];

    const connectedCables = cables.filter(c => c.from === deviceId || c.to === deviceId);
    const entries = connectedCables.map((cable, i) => {
      const otherId = cable.from === deviceId ? cable.to : cable.from;
      const otherDev = devices.find(d => d.id === otherId);
      if (!otherDev || !isValidIp(otherDev.ipAddress)) {
        return null;
      }
      const parts = otherDev.ipAddress.split(".");
      return {
        network: `${parts[0]}.${parts[1]}.${parts[2]}.0`,
        mask: otherDev.subnetMask || "255.255.255.0",
        nextHop: "directly connected",
        interface: `Gig0/${i}`,
      };
    });
    return entries.filter(Boolean);
  }, [devices, cables]);

  // Save topology to JSON
  const saveTopology = useCallback(() => {
    const topology: Topology = { devices, cables };
    const json = JSON.stringify(topology, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network-topology.json";
    a.click();
    URL.revokeObjectURL(url);
    addLog("Topology saved to file", "success");
  }, [devices, cables, addLog]);

  // Load topology from JSON file
  const loadTopology = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const topology: Topology = JSON.parse(e.target?.result as string);
        setDevices(topology.devices);
        setCables(topology.cables);
        setSelectedDevice(null);
        addLog("Topology loaded from file", "success");
      } catch {
        addLog("Failed to load topology: invalid file", "error");
      }
    };
    reader.readAsText(file);
  }, [addLog]);

  // Clear all
  const clearAll = useCallback(() => {
    setDevices([]);
    setCables([]);
    setSelectedDevice(null);
    setConnectingFrom(null);
    setPackets([]);
    deviceCounters = { pc: 1, switch: 1, router: 1 };
    addLog("Canvas cleared");
  }, [addLog]);

  return {
    devices,
    cables,
    logs,
    packets,
    selectedDevice,
    connectingFrom,
    setSelectedDevice,
    setConnectingFrom,
    addDevice,
    moveDevice,
    updateDevice,
    deleteDevice,
    connectDevices,
    deleteCable,
    startConnect,
    simulatePing,
    getMacTable,
    getRoutingTable,
    saveTopology,
    loadTopology,
    clearAll,
  };
}
