using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Redhood.Data;
using Redhood.Dice;

namespace Redhood.Tests
{
    public sealed class GoldenYahtzeeTests
    {
        private GameDatabase _db;
        private JObject _fixture;

        [OneTimeSetUp]
        public void Load()
        {
            _db = TestData.Load();
            _fixture = JObject.Parse(File.ReadAllText(Path.Combine(TestData.Root,
                "unity/Tests/Fixtures/current-golden.json")));
        }

        [Test]
        public void FixtureMatchesCurrentSourceHashes()
        {
            foreach (JProperty entry in ((JObject)_fixture["sources"]).Properties())
            {
                using var sha = SHA256.Create();
                string actual = BitConverter.ToString(sha.ComputeHash(
                    File.ReadAllBytes(Path.Combine(TestData.Root, entry.Name)))).Replace("-", "").ToLowerInvariant();
                Assert.That(actual, Is.EqualTo((string)entry.Value),
                    "Regenerate fixtures: node unity/tools/generate-golden.mjs");
            }
        }

        [Test]
        public void CurrentGoldenVectorsMatchJavaScript()
        {
            foreach (JObject vector in _fixture["vectors"]) Verify(vector);
            TestContext.WriteLine($"JS golden comparisons: {_fixture["vectors"].Count()}");
        }

        [Test]
        [Category("Exhaustive")]
        public void AllOrderedFiveDiceHandsMatchJavaScript()
        {
            string path = Path.Combine(TestData.Root, "unity/Tests/Generated/exhaustive.jsonl");
            if (!File.Exists(path))
                Assert.Ignore("Optional exhaustive suite: node unity/tools/generate-golden.mjs --exhaustive");
            int count = 0;
            foreach (string line in File.ReadLines(path))
            {
                Verify(JObject.Parse(line));
                count++;
            }
            Assert.That(count, Is.EqualTo(268912));
            TestContext.WriteLine($"Ordered-hand comparisons (0..6, normal + stunned): {count}");
        }

        private void Verify(JObject vector)
        {
            var faces = vector["faces"].ToObject<int[]>();
            var zeroed = new HashSet<int>(vector["zeroed"].ToObject<int[]>());
            CategoryDefinition cat = vector["definition"]?.ToObject<CategoryDefinition>()
                ?? _db.Category((string)vector["cat"]);
            JObject expected = (JObject)vector["expected"];
            string context = $"{cat.Id} [{string.Join(",", faces)}]";
            if ((string)vector["type"] == "eval")
            {
                CategoryResult result = YahtzeeCalculator.Evaluate(cat, faces, zeroed);
                if (result.Valid != (bool)expected["valid"] || result.Base != (int)expected["base"] ||
                    !result.Contributing.SequenceEqual(expected["contributing"].ToObject<int[]>()))
                    Assert.Fail(context + " category mismatch. JS=" + expected +
                        $" C#={result.Valid}/{result.Base}/[{string.Join(",", result.Contributing)}]");
            }
            else
            {
                var dice = vector["dice"].ToObject<string[]>().Select(_db.Die).ToArray();
                var relics = vector["definitions"] != null
                    ? vector["definitions"].ToObject<RelicDefinition[]>()
                    : vector["relics"].ToObject<string[]>().Select(_db.Relic).ToArray();
                DamageResult result = YahtzeeCalculator.ComputeDamage(cat, faces, dice, relics, _db.Scoring,
                    zeroed, (int)vector["whet"], (double)vector["hpRatio"]);
                Assert.That(result.Valid, Is.EqualTo((bool)expected["valid"]), context);
                Assert.That(result.Base, Is.EqualTo((int)expected["base"]), context);
                Assert.That(result.Total, Is.EqualTo((int)expected["total"]), context);
                Assert.That(result.Gold, Is.EqualTo((int)expected["gold"]), context);
                Assert.That(result.Split, Is.EqualTo((int)expected["split"]), context);
                Assert.That(result.Multiplier, Is.EqualTo((double)expected["mult"]), context);
                Assert.That(result.WhetMultiplier, Is.EqualTo((double)expected["whetMult"]), context);
                Assert.That(result.Bonus, Is.EqualTo((int)expected["bonus"]), context);
                Assert.That(result.Flat, Is.EqualTo((int)expected["flat"]), context);
                Assert.That(result.IsZero, Is.EqualTo((bool)expected["isZero"]), context);
                if (expected["contributing"] != null)
                    Assert.That(result.Contributing, Is.EqualTo(expected["contributing"].ToObject<int[]>()), context);
            }
        }
    }
}
