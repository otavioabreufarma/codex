# Rust VIP Platform (Backend + Discord Bot + uMod Plugin)

Projeto completo para fluxo de VIP em servidores Rust com **Steam OpenID**, **InfinitePay**, painel via **Discord bot** e sincronização com **plugin Oxide/uMod**.

## Arquitetura

1. Usuário usa `/vip` no Discord.
2. Bot envia ações para Backend (gerar link Steam/OpenID e checkout InfinitePay).
3. Backend recebe callback OpenID e webhook InfinitePay.
4. Backend ativa VIP em JSON do servidor correto (`server1` ou `server2`).
5. Backend notifica Bot sobre pagamento aprovado/expiração.
6. Bot envia DM e adiciona/remove cargos.
7. Plugin consulta Backend periodicamente e aplica/remove grupos VIP no Rust.

## Estrutura

- `backend/` API REST em TypeScript
- `bot/` UI Discord em TypeScript (discord.js v14)
- `plugin/` Plugin C# para Oxide/uMod

## Backend

### Variáveis
Copie `backend/.env.example` para `.env` e configure.

### Rodar
```bash
cd backend
npm install
npm run dev
```

### Endpoints principais

#### 1) Gerar link Steam
`POST /auth/steam/link`

Payload:
```json
{
  "discordId": "1234567890",
  "serverId": "server1"
}
```
Resposta:
```json
{
  "authUrl": "https://steamcommunity.com/openid/login?..."
}
```

#### 2) Callback Steam
`GET /auth/steam/callback?state=...&openid.claimed_id=...`

Salva `discordId + steamId + serverId` no JSON do servidor.

#### 3) Checkout InfinitePay
`POST /payments/checkout`

Payload:
```json
{
  "discordId": "1234567890",
  "serverId": "server1",
  "type": "vip+"
}
```
Resposta:
```json
{
  "orderNsu": "server1-1234567890-vip+-...",
  "checkoutUrl": "https://checkout.infinitepay..."
}
```

#### 4) Webhook InfinitePay
`POST /webhooks/infinitepay`

Headers esperados:
- `x-infinitepay-signature: <INFINITEPAY_WEBHOOK_SECRET>`

Quando aprovado, backend ativa VIP, define expiração e notifica bot.

#### 5) API plugin (segura por token)
- `POST /plugin/vip/apply`
- `POST /plugin/vip/remove`
- `GET /plugin/vip/:serverId/:discordId`

Header:
- `x-api-token: <SERVER1_API_TOKEN|SERVER2_API_TOKEN>`

## Bot

### Variáveis
Copie `bot/.env.example` para `.env`.

### Rodar
```bash
cd bot
npm install
npm run dev
```

### Fluxo no Discord
- `/vip` abre painel com:
  - select `Servidor 1/2`
  - botão `Vincular Steam`
  - botão `Comprar VIP`
  - botão `Comprar VIP+`
- Backend aprova pagamento -> chama `POST /internal/payment-status` no bot.
- Bot adiciona cargo VIP/VIP+ e envia DM.
- Em expiração, remove cargos.

## Plugin Oxide/uMod

Arquivo: `plugin/VipIntegration.cs`

### Instalação
1. Copie para `oxide/plugins/VipIntegration.cs`.
2. Reinicie plugin (`oxide.reload VipIntegration`).
3. Edite `oxide/config/VipIntegration.json`.

Config esperada:
```json
{
  "ServerId": "server1",
  "BackendUrl": "https://api.seudominio.com",
  "ApiToken": "token_do_servidor",
  "CheckInterval": 60.0,
  "TrackedPlayers": ["1234567890"]
}
```

### Comandos
- `vip.track <discordId>`: adiciona usuário para monitoramento.
- `vip.sync`: força sincronização manual.

## Deploy na Discloud

### Backend e Bot
- Ambos são Node.js TS com `build` e `start`.
- Defina variáveis de ambiente no painel Discloud.
- Use domínio/subdomínio externo para `BASE_URL` e `BACKEND_URL`.
- Nunca use `localhost` em produção.

## Dados JSON por servidor

Arquivos separados (multi-servidor):
- `backend/data/server1.json`
- `backend/data/server2.json`

Cada arquivo mantém:
- jogadores vinculados
- pagamentos
- estado VIP (tipo/expiração)
