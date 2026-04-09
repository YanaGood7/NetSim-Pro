// Types for the Network Simulator

export type DeviceType = "pc" | "switch" | "router";

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  // Network config
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  macAddress: string;
  // Router can have multiple interfaces
  interfaces?: NetworkInterface[];
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  subnetMask: string;
  macAddress: string;
}

export interface Cable {
  id: string;
  from: string; // device id
  to: string;   // device id
}

export interface MacTableEntry {
  macAddress: string;
  port: string;
  deviceName: string;
}

export interface RoutingTableEntry {
  network: string;
  mask: string;
  nextHop: string;
  interface: string;
}

export interface PacketAnimation {
  id: string;
  fromId: string;
  toId: string;
  progress: number; // 0 to 1
  type: "request" | "reply";
  status: "in-progress" | "success" | "failed";
}

export interface SimulationLog {
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error";
}

export interface Topology {
  devices: NetworkDevice[];
  cables: Cable[];
}
