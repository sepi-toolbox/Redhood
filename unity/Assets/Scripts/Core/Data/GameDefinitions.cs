using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Redhood.Data
{
    [Serializable]
    public sealed class EnemyDefinition
    {
        [JsonProperty("id")] public string Id = string.Empty;
        [JsonProperty("name")] public string Name = string.Empty;
        [JsonProperty("hp")] public int[] Hp = Array.Empty<int>();
    }

    [Serializable]
    public sealed class ActDefinition
    {
        [JsonProperty("player")] public PlayerDefinition Player;
    }

    [Serializable]
    public sealed class PlayerDefinition
    {
        [JsonProperty("maxHp")] public int MaxHp;
        [JsonProperty("startDice")] public string[] StartDice = Array.Empty<string>();
    }

    [Serializable]
    public sealed class ScoringDefinition
    {
        [JsonProperty("rerollsPerTurn")] public int RerollsPerTurn = 2;
        [JsonProperty("whetStep")] public double WhetStep = 0.5d;
        [JsonProperty("whetCap")] public int WhetCap = 6;
        [JsonProperty("categories")] public List<CategoryDefinition> Categories = new();
    }

    [Serializable]
    public sealed class CategoryDefinition
    {
        [JsonProperty("id")] public string Id = string.Empty;
        [JsonProperty("name")] public string Name = string.Empty;
        [JsonProperty("kind")] public string Kind = string.Empty;
        [JsonProperty("face")] public int Face;
        [JsonProperty("count")] public int Count;
        [JsonProperty("length")] public int Length;
        [JsonProperty("score")] public JToken Score;
        [JsonProperty("mult")] public double Mult = 1d;
        [JsonProperty("target")] public string Target = string.Empty;
    }

    [Serializable]
    public sealed class DiceDefinition
    {
        [JsonProperty("id")] public string Id = string.Empty;
        [JsonProperty("name")] public string Name = string.Empty;
        [JsonProperty("faces")] public int[] Faces = Array.Empty<int>();
        [JsonProperty("gold")] public bool Gold;
        [JsonProperty("effect")] public DiceEffect Effect;
    }

    [Serializable]
    public sealed class DiceEffect
    {
        [JsonProperty("when")] public string When = string.Empty;
        [JsonProperty("op")] public string Op = string.Empty;
        [JsonProperty("amount")] public int Amount;
    }

    [Serializable]
    public sealed class RelicDefinition
    {
        [JsonProperty("id")] public string Id = string.Empty;
        [JsonProperty("hook")] public RelicHook Hook;
        [JsonProperty("hooks")] public List<RelicHook> Hooks;

        public IEnumerable<RelicHook> EnumerateHooks()
        {
            if (Hooks != null)
            {
                foreach (RelicHook hook in Hooks)
                    if (hook != null) yield return hook;
            }
            else if (Hook != null)
            {
                yield return Hook;
            }
        }
    }

    [Serializable]
    public sealed class RelicHook
    {
        [JsonProperty("type")] public string Type = string.Empty;
        [JsonProperty("category")] public string Category = string.Empty;
        [JsonProperty("kind")] public string Kind = string.Empty;
        [JsonProperty("mult")] public double Mult = 1d;
        [JsonProperty("bonus")] public int Bonus;
        [JsonProperty("amount")] public int Amount;
        [JsonProperty("ratio")] public double Ratio = 0.34d;
    }
}
