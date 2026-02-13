using Newtonsoft.Json;
using Oxide.Core.Libraries.Covalence;
using System;
using System.Collections.Generic;

namespace Oxide.Plugins
{
    [Info("VipIntegration", "Codex", "2.0.0")]
    [Description("Integra VIP com backend HTTP externo para múltiplos servidores Rust.")]
    public class VipIntegration : CovalencePlugin
    {
        private PluginConfig _config;

        private class PluginConfig
        {
            [JsonProperty("ServerId")]
            public string ServerId = "server1";

            [JsonProperty("BackendUrl")]
            public string BackendUrl = "https://backend.seudominio.com";

            [JsonProperty("ApiToken")]
            public string ApiToken = "troque_este_token";

            [JsonProperty("CheckInterval")]
            public float CheckInterval = 60f;
        }

        private class VipData
        {
            public bool active;
            public string type;
            public string expiresAt;
        }

        private class VipStatusResponse
        {
            public string discordId;
            public string steamId;
            public string serverId;
            public VipData vip;
        }

        protected override void LoadDefaultConfig()
        {
            _config = new PluginConfig();
            SaveConfig();
        }

        protected override void LoadConfig()
        {
            base.LoadConfig();
            try
            {
                _config = Config.ReadObject<PluginConfig>();
                if (_config == null) throw new Exception("Config null");
            }
            catch
            {
                PrintWarning("Config inválida. Gerando novo arquivo em config/VipIntegration.json");
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void Init()
        {
            timer.Every(_config.CheckInterval, () =>
            {
                Puts($"VipIntegration heartbeat: server={_config.ServerId}");
            });
        }

        [Command("vip.apply")]
        private void CmdApply(IPlayer player, string command, string[] args)
        {
            if (!IsAllowed(player)) return;
            if (args.Length != 2)
            {
                player?.Reply("Uso: vip.apply <steamId> <vip|vip+>");
                return;
            }

            ApplyVip(args[0], args[1]);
            player?.Reply("VIP aplicado localmente.");
        }

        [Command("vip.remove")]
        private void CmdRemove(IPlayer player, string command, string[] args)
        {
            if (!IsAllowed(player)) return;
            if (args.Length != 1)
            {
                player?.Reply("Uso: vip.remove <steamId>");
                return;
            }

            RemoveVip(args[0]);
            player?.Reply("VIP removido localmente.");
        }

        [Command("vip.check")]
        private void CmdCheck(IPlayer player, string command, string[] args)
        {
            if (!IsAllowed(player)) return;
            if (args.Length != 1)
            {
                player?.Reply("Uso: vip.check <discordId>");
                return;
            }

            SyncDiscordId(args[0], player);
        }

        private bool IsAllowed(IPlayer player)
        {
            if (player != null && !player.IsAdmin)
            {
                player.Reply("Sem permissão.");
                return false;
            }
            return true;
        }

        private void SyncDiscordId(string discordId, IPlayer replyTarget = null)
        {
            var url = $"{_config.BackendUrl}/plugin/vip/{_config.ServerId}/{discordId}";
            var headers = new Dictionary<string, string> { ["x-api-token"] = _config.ApiToken };

            webrequest.Enqueue(url, null, (code, response) =>
            {
                if (code != 200 || string.IsNullOrEmpty(response))
                {
                    var msg = $"Falha ao consultar backend. HTTP {code}";
                    PrintWarning(msg);
                    replyTarget?.Reply(msg);
                    return;
                }

                try
                {
                    var status = JsonConvert.DeserializeObject<VipStatusResponse>(response);
                    if (status == null || string.IsNullOrEmpty(status.steamId))
                    {
                        replyTarget?.Reply("Usuário sem vinculação Steam no backend.");
                        return;
                    }

                    if (status.vip != null && status.vip.active)
                    {
                        ApplyVip(status.steamId, status.vip.type);
                        replyTarget?.Reply($"VIP {status.vip.type} ativo aplicado para {status.steamId}.");
                    }
                    else
                    {
                        RemoveVip(status.steamId);
                        replyTarget?.Reply($"Usuário {status.steamId} sem VIP ativo.");
                    }
                }
                catch (Exception ex)
                {
                    PrintWarning($"Erro parse status: {ex.Message}");
                    replyTarget?.Reply("Erro ao processar resposta do backend.");
                }
            }, this, RequestMethod.GET, headers);
        }

        private void ApplyVip(string steamId, string type)
        {
            var group = type == "vip+" ? "vipplus" : "vip";
            server.Command($"oxide.usergroup add {steamId} {group}");
            Puts($"VIP aplicado: {steamId} -> {group}");
        }

        private void RemoveVip(string steamId)
        {
            server.Command($"oxide.usergroup remove {steamId} vip");
            server.Command($"oxide.usergroup remove {steamId} vipplus");
            Puts($"VIP removido: {steamId}");
        }
    }
}
