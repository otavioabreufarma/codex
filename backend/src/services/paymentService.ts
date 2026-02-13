import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { VipType } from "../types/models";

export function buildOrderNsu(serverId: string, discordId: string, type: VipType): string {
  return `${serverId}-${discordId}-${type}-${Date.now()}-${uuidv4().slice(0, 8)}`;
}

export async function createInfinitePayCheckout(params: {
  orderNsu: string;
  type: VipType;
  discordId: string;
  serverId: string;
}): Promise<string> {
  const amount = params.type === "vip" ? env.vipPrice : env.vipPlusPrice;

  const payload = {
    handle: env.infinitepayHandle,
    amount,
    description: `VIP ${params.type.toUpperCase()} - ${params.serverId}`,
    order_nsu: params.orderNsu,
    redirect_url: env.checkoutRedirectUrl,
    webhook_url: env.checkoutWebhookUrl,
    metadata: {
      discordId: params.discordId,
      serverId: params.serverId,
      vipType: params.type
    }
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.infinitepayApiToken) {
    headers.Authorization = `Bearer ${env.infinitepayApiToken}`;
  }

  const response = await axios.post(
    "https://api.infinitepay.io/invoices/public/checkout/links",
    payload,
    { headers }
  );

  const checkoutUrl: string | undefined =
    response.data?.url || response.data?.checkout_url || response.data?.data?.url;

  if (!checkoutUrl) {
    throw new Error("InfinitePay API did not return checkout URL");
  }

  return checkoutUrl;
}
