using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Libraries.Covalence;
using System;
using System.Collections.Generic;

namespace Oxide.Plugins
{
    [Info("VipIntegration", "Codex", "1.0.0")]
    [Description("Sincroniza VIP com backend externo (Steam/Discord/InfinitePay).")]
    public class VipIntegration : CovalencePlugin
    {
        private PluginConfig _config;

        private class PluginConfig
        {
            [JsonProperty("ServerId")]
            public string ServerId = "server1";

            [JsonProperty("BackendUrl")]
            public string BackendUrl = "https://api.seudominio.com";

            [JsonProperty("ApiToken")]
            public string ApiToken = "troque_este_token";

            [JsonProperty("CheckInterval")]
            public float CheckInterval = 60f;

            [JsonProperty("TrackedPlayers")]
            public List<string> TrackedPlayers = new List<string>();
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
                PrintWarning("Config inválida. Gerando nova config padrão.");
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void Init()
        {
            timer.Every(_config.CheckInterval, SyncTrackedPlayers);
        }

        [Command("vip.sync")]
        private void CmdSync(IPlayer player, string command, string[] args)
        {
            if (player != null && !player.IsAdmin)
            {
                player.Reply("Sem permissão.");
                return;
            }

            SyncTrackedPlayers();
            player?.Reply("Sincronização manual iniciada.");
        }

        [Command("vip.track")]
        private void CmdTrack(IPlayer player, string command, string[] args)
        {
            if (player == null || !player.IsAdmin)
            {
                player?.Reply("Sem permissão.");
                return;
            }

            if (args.Length != 1)
            {
                player.Reply("Uso: vip.track <discordId>");
                return;
            }

            var discordId = args[0];
            if (!_config.TrackedPlayers.Contains(discordId))
            {
                _config.TrackedPlayers.Add(discordId);
                SaveConfig();
            }

            player.Reply($"DiscordId {discordId} adicionado ao monitoramento.");
        }

        private void SyncTrackedPlayers()
        {
            foreach (var discordId in _config.TrackedPlayers)
            {
                CheckVipAndApply(discordId);
            }
        }

        private void CheckVipAndApply(string discordId)
        {
            var url = $"{_config.BackendUrl}/plugin/vip/{_config.ServerId}/{discordId}?serverId={_config.ServerId}";
            var headers = new Dictionary<string, string>
            {
                ["x-api-token"] = _config.ApiToken
            };

            webrequest.Enqueue(url, null, (code, response) =>
            {
                if (code != 200 || string.IsNullOrEmpty(response))
                {
                    PrintWarning($"Falha ao verificar VIP de {discordId}. HTTP {code}");
                    return;
                }

                try
                {
                    var vipStatus = JsonConvert.DeserializeObject<VipStatusResponse>(response);
                    if (vipStatus == null || string.IsNullOrEmpty(vipStatus.steamId)) return;

                    if (vipStatus.vip != null && vipStatus.vip.active)
                    {
                        ApplyVip(vipStatus.steamId, vipStatus.vip.type);
                    }
                    else
                    {
                        RemoveVip(vipStatus.steamId);
                    }
                }
                catch (Exception ex)
                {
                    PrintWarning($"Erro parse VIP status: {ex.Message}");
                }
            }, this, RequestMethod.GET, headers);
        }

        private void ApplyVip(string steamId, string type)
        {
            var group = type == "vip+" ? "vipplus" : "vip";
            server.Command($"oxide.usergroup add {steamId} {group}");
            Puts($"VIP aplicado para {steamId} ({group})");
        }

        private void RemoveVip(string steamId)
        {
            server.Command($"oxide.usergroup remove {steamId} vip");
            server.Command($"oxide.usergroup remove {steamId} vipplus");
            Puts($"VIP removido para {steamId}");
        }

        private class VipStatusResponse
        {
            public string discordId;
            public string steamId;
            public string serverId;
            public VipData vip;
        }

        private class VipData
        {
            public bool active;
            public string type;
            public string expiresAt;
        }
    }
}
