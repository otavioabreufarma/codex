const serverSelection = new Map<string, "server1" | "server2">();

export function setUserServer(userId: string, serverId: "server1" | "server2"): void {
  serverSelection.set(userId, serverId);
}

export function getUserServer(userId: string): "server1" | "server2" {
  return serverSelection.get(userId) || "server1";
}
