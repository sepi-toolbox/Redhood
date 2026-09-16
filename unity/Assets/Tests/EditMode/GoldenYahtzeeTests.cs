using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using NUnit.Framework;
using Redhood.Data;
using Redhood.Dice;
using UnityEngine;

namespace Redhood.Tests
{
    public sealed class GoldenYahtzeeTests
    {
        private GameDatabase _database;
        private GoldenVectors _vectors;

        [OneTimeSetUp]
        public void LoadSourceOfTruth()
        {
            _database = GameDatabase.Load();
            string path = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "godot",
                "tests", "golden_yahtzee.json"));
            _vectors = JsonConvert.DeserializeObject<GoldenVectors>(File.ReadAllText(path));
            Assert.That(_vectors, Is.Not.Null);
        }

        [Test]
        public void All300CategoryVectorsMatchWebClient()
        {
            var failures = new List<string>();
            foreach (EvalVector vector in _vectors.Eval)
            {
                CategoryResult actual = YahtzeeCalculator.Evaluate(_database.Category(vector.Category),
                    vector.Faces, new HashSet<int>(vector.Zeroed ?? Array.Empty<int>()));
                if (actual.Valid != vector.Valid || actual.Base != vector.Base ||
                    !actual.Contributing.SequenceEqual(vector.Contributing))
                {
                    failures.Add($"{vector.Category} [{string.Join(",", vector.Faces)}]: " +
                        $"expected {vector.Valid}/{vector.Base}/[{string.Join(",", vector.Contributing)}], " +
                        $"got {actual.Valid}/{actual.Base}/[{string.Join(",", actual.Contributing)}]");
                }
            }

            Assert.That(failures, Is.Empty, string.Join("\n", failures.Take(20)));
        }

        [Test]
        public void All150DamageVectorsMatchWebClient()
        {
            var failures = new List<string>();
            foreach (DamageVector vector in _vectors.Damage)
            {
                DiceDefinition[] dice = vector.Gold.Select(isGold => new DiceDefinition { Gold = isGold }).ToArray();
                RelicDefinition[] relics = vector.Relics.Select(_database.Relic).ToArray();
                DamageResult actual = YahtzeeCalculator.ComputeDamage(_database.Category(vector.Category),
                    vector.Faces, dice, relics, _database.Scoring, whet: vector.Whet, hpRatio: vector.HpRatio);
                if (actual.Valid != vector.Valid || actual.Total != vector.Total)
                {
                    failures.Add($"{vector.Category} [{string.Join(",", vector.Faces)}]: " +
                        $"expected {vector.Valid}/{vector.Total}, got {actual.Valid}/{actual.Total}");
                }
            }

            Assert.That(failures, Is.Empty, string.Join("\n", failures.Take(20)));
        }

        private sealed class GoldenVectors
        {
            [JsonProperty("eval")] public List<EvalVector> Eval = new();
            [JsonProperty("damage")] public List<DamageVector> Damage = new();
        }

        private sealed class EvalVector
        {
            [JsonProperty("cat")] public string Category;
            [JsonProperty("faces")] public int[] Faces;
            [JsonProperty("zeroed")] public int[] Zeroed;
            [JsonProperty("valid")] public bool Valid;
            [JsonProperty("base")] public int Base;
            [JsonProperty("contributing")] public int[] Contributing;
        }

        private sealed class DamageVector
        {
            [JsonProperty("cat")] public string Category;
            [JsonProperty("faces")] public int[] Faces;
            [JsonProperty("gold")] public bool[] Gold;
            [JsonProperty("relics")] public string[] Relics;
            [JsonProperty("whet")] public int Whet;
            [JsonProperty("hpRatio")] public double HpRatio;
            [JsonProperty("total")] public int Total;
            [JsonProperty("valid")] public bool Valid;
        }
    }
}
