export type VipType = "vip" | "vip+";
export type ServerId = "server1" | "server2";

export interface VipInfo {
  active: boolean;
  type?: VipType;
  expiresAt?: string;
  lastUpdatedAt?: string;
}

export interface PlayerRecord {
  discordId: string;
  steamId: string;
  serverId: ServerId;
  vip: VipInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  orderNsu: string;
  transactionNsu?: string;
  discordId: string;
  serverId: ServerId;
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
  serverId: ServerId;
  players: Record<string, PlayerRecord>;
  payments: Record<string, PaymentRecord>;
}

export type BotEventType = "PAYMENT_CONFIRMED" | "VIP_EXPIRED";

export interface BotEvent {
  eventId: string;
  type: BotEventType;
  discordId: string;
  serverId: ServerId;
  vipType?: VipType;
  createdAt: string;
  processed: boolean;
}
