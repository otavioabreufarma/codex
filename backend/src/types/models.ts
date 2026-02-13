export type VipType = "vip" | "vip+";

export interface VipInfo {
  active: boolean;
  type?: VipType;
  expiresAt?: string;
  lastUpdatedAt?: string;
}

export interface PlayerRecord {
  discordId: string;
  steamId: string;
  serverId: string;
  vip: VipInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  orderNsu: string;
  discordId: string;
  serverId: string;
  type: VipType;
  amount: number;
  checkoutUrl?: string;
  status: "pending" | "approved" | "failed";
  steamId?: string;
  expiresAt?: string;
  providerPayload?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ServerDb {
  serverId: string;
  players: Record<string, PlayerRecord>;
  payments: Record<string, PaymentRecord>;
}

export interface ExpirationEvent {
  discordId: string;
  steamId: string;
  serverId: string;
  previousType?: VipType;
}
