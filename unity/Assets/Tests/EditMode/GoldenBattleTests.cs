using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Redhood.Battle;

namespace Redhood.Tests
{
    public sealed class GoldenBattleTests
    {
        [Test]
        public void FullWolfBattlesMatchCurrentWebEngineAtEveryStep()
        {
            var fixture = JObject.Parse(File.ReadAllText(Path.Combine(TestData.Root, "unity/Tests/Fixtures/battle-golden.json")));
            foreach (JProperty source in ((JObject)fixture["sources"]).Properties())
            {
                using var hash = SHA256.Create();
                string actual = BitConverter.ToString(hash.ComputeHash(File.ReadAllBytes(Path.Combine(TestData.Root, source.Name))))
                    .Replace("-", "").ToLowerInvariant();
                Assert.That(actual, Is.EqualTo(source.Value.Value<string>()), "Stale battle fixture: " + source.Name);
            }
            int snapshots = 0;
            foreach (JToken scenario in fixture["scenarios"])
            {
                uint state = scenario.Value<uint>("seed");
                double Random() { state = unchecked(state * 1664525u + 1013904223u); return state / 4294967296d; }
                var db = TestData.Load();
                db.Player.MaxHp = scenario.Value<int>("playerHp");
                var battle = new BattleSession(db, "wolf", Random);
                foreach (JToken step in scenario["steps"])
                {
                    JToken command = step["command"];
                    switch (command.Value<string>("op"))
                    {
                        case "roll": battle.InitialRoll(); break;
                        case "reroll":
                            battle.SetHeld(command.Value<int>("index"), false);
                            Assert.That(battle.Reroll(), Is.True);
                            break;
                        case "confirm": battle.Confirm(command.Value<string>("category")); break;
                        case "enemy": battle.NextTurn(); break;
                    }
                    var actual = JObject.FromObject(new {
                        phase = battle.Phase.ToString(), turn = battle.Turn, playerHp = battle.PlayerHp,
                        enemyHp = battle.EnemyHp, enemyBlock = battle.EnemyBlock, enemyStrength = battle.EnemyStrength,
                        enemyPhaseIndex = battle.EnemyPhaseIndex, intentId = battle.IntentId,
                        faces = battle.Faces.ToArray(), held = battle.Held.ToArray(), bleedLeft = battle.BleedLeft.ToArray(),
                        rerollsLeft = battle.RerollsLeft, rollTax = battle.RollTax, rollTaxTurns = battle.RollTaxTurns
                    });
                    Assert.That(JToken.DeepEquals(actual, step["expected"]), Is.True,
                        $"Seed {scenario["seed"]}, command {command}\nExpected {step["expected"]}\nActual {actual}");
                    snapshots++;
                }
            }
            Assert.That(snapshots, Is.GreaterThan(200));
        }

        [Test]
        public void DefeatStopsAllFurtherCommands()
        {
            var db = TestData.Load();
            db.Player.MaxHp = 1;
            var battle = new BattleSession(db, "wolf", () => 0);
            for (int i = 0; i < 5 && !battle.IsDefeat; i++)
            {
                battle.InitialRoll();
                battle.Confirm("onePair");
                battle.NextTurn();
            }
            Assert.That(battle.IsDefeat, Is.True);
            Assert.That(battle.PlayerHp, Is.Zero);
            Assert.That(battle.Reroll(), Is.False);
            Assert.Throws<InvalidOperationException>(() => battle.InitialRoll());
            Assert.Throws<InvalidOperationException>(() => battle.Confirm("onePair"));
            Assert.Throws<InvalidOperationException>(() => battle.NextTurn());
        }

        [Test]
        public void RerollTaxCanDefeatOnlyOnActualReroll()
        {
            var db = TestData.Load();
            db.Player.MaxHp = 1;
            var move = db.Enemy("wolf").Moves["bite"];
            move.Effects.Clear();
            move.Effects.Add(new Redhood.Data.EnemyEffect { Op = "rollTax", Amount = 1, Turns = 2 });
            var battle = new BattleSession(db, "wolf", () => 0);
            battle.InitialRoll();
            battle.Confirm("onePair");
            battle.NextTurn();
            Assert.That(battle.RollTaxTurns, Is.EqualTo(2));
            battle.InitialRoll();
            Assert.That(battle.Reroll(), Is.False);
            Assert.That(battle.PlayerHp, Is.EqualTo(1));
            battle.SetHeld(0, false);
            Assert.That(battle.Reroll(), Is.True);
            Assert.That(battle.RerollsLeft, Is.EqualTo(1));
            Assert.That(battle.IsDefeat, Is.True);
            Assert.That(battle.PlayerHp, Is.Zero);
        }

        [Test]
        public void UnsupportedEncounterFailsBeforePlay()
        {
            Assert.Throws<NotSupportedException>(() => new BattleSession(TestData.Load(), "crow"));
        }
    }
}
