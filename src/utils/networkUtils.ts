// Network utility functions for the simulator

/**
 * Generate a random MAC address
 */
export function generateMacAddress(): string {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

/**
 * Parse an IP address string to an array of numbers
 */
export function parseIp(ip: string): number[] {
  return ip.split(".").map(Number);
}

/**
 * Check if an IP address is valid
 */
export function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = Number(p);
    return !isNaN(n) && n >= 0 && n <= 255 && p === String(n);
  });
}

/**
 * Check if a subnet mask is valid
 */
export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIp(mask)) return false;
  const binary = parseIp(mask)
    .map(o => o.toString(2).padStart(8, "0"))
    .join("");
  // Must be contiguous 1s followed by 0s
  return /^1*0*$/.test(binary);
}

/**
 * Get the network address from IP and subnet mask
 */
export function getNetworkAddress(ip: string, mask: string): string {
  const ipParts = parseIp(ip);
  const maskParts = parseIp(mask);
  return ipParts.map((p, i) => p & maskParts[i]).join(".");
}

/**
 * Check if two devices are on the same subnet
 */
export function areOnSameSubnet(
  ip1: string, mask1: string,
  ip2: string, mask2: string
): boolean {
  if (!isValidIp(ip1) || !isValidIp(ip2) || !isValidSubnetMask(mask1) || !isValidSubnetMask(mask2)) {
    return false;
  }
  // Use the same mask for comparison (use mask1)
  const net1 = getNetworkAddress(ip1, mask1);
  const net2 = getNetworkAddress(ip2, mask1);
  return net1 === net2 && mask1 === mask2;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Find path between two devices using BFS (through cables)
 */
export function findPath(
  fromId: string,
  toId: string,
  cables: { from: string; to: string }[]
): string[] | null {
  const adjacency: Record<string, string[]> = {};
  cables.forEach(c => {
    if (!adjacency[c.from]) adjacency[c.from] = [];
    if (!adjacency[c.to]) adjacency[c.to] = [];
    adjacency[c.from].push(c.to);
    adjacency[c.to].push(c.from);
  });

  const visited = new Set<string>();
  const queue: string[][] = [[fromId]];
  visited.add(fromId);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (current === toId) return path;

    const neighbors = adjacency[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}
