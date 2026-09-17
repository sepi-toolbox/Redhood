using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Redhood.Battle;
using Redhood.Data;

namespace Redhood.Tests
{
    public sealed class BattleSessionTests
    {
        private static BattleSession Session() => new BattleSession(TestData.Load(), "wolf", _ => 0);

        [Test]
        public void StartsUnrolledAndUsesSourceEnemyHp()
        {
            BattleSession s = Session();
            Assert.That(s.EnemyHp, Is.EqualTo(TestData.Load().Enemy("wolf").Hp[0]));
            Assert.That(s.Phase, Is.EqualTo(BattlePhase.AwaitingRoll));
            Assert.That(s.Faces, Is.All.Zero);
            Assert.Throws<InvalidOperationException>(() => s.Confirm("chance"));
            Assert.Throws<InvalidOperationException>(() => s.NextTurn());
        }

        [Test]
        public void InitialRollKeepsAllDice_NoSelectionCostsNothing()
        {
            BattleSession s = Session();
            s.InitialRoll();
            Assert.That(s.Held, Is.All.True);
            Assert.That(s.Reroll(), Is.False);
            Assert.That(s.RerollsLeft, Is.EqualTo(2));
            Assert.Throws<InvalidOperationException>(() => s.InitialRoll());
        }

        [Test]
        public void RerollOnlyChangesSelectedDieAndResetsSelection()
        {
            int counter = 0;
            var s = new BattleSession(TestData.Load(), "wolf", n => counter++ % n);
            s.InitialRoll();
            int[] before = s.Faces.ToArray();
            s.SetHeld(2, false);
            Assert.That(s.Reroll(), Is.True);
            Assert.That(s.Faces[2], Is.Not.EqualTo(before[2]));
            for (int i = 0; i < 5; i++) if (i != 2) Assert.That(s.Faces[i], Is.EqualTo(before[i]));
            Assert.That(s.Held, Is.All.True);
            Assert.That(s.RerollsLeft, Is.EqualTo(1));
            s.SetHeld(2, false);
            s.Reroll();
            s.SetHeld(2, false);
            Assert.That(s.Reroll(), Is.False);
            Assert.That(s.RerollsLeft, Is.Zero);
        }

        [Test]
        public void PreviewEqualsConfirmedDamage_AndCannotConfirmTwice()
        {
            BattleSession s = Session();
            s.InitialRoll();
            int hp = s.EnemyHp;
            int preview = s.Preview("onePair").Total;
            var actual = s.Confirm("onePair");
            Assert.That(actual.Total, Is.EqualTo(preview));
            Assert.That(s.EnemyHp, Is.EqualTo(hp - preview));
            Assert.That(s.Phase, Is.EqualTo(BattlePhase.TurnComplete));
            Assert.Throws<InvalidOperationException>(() => s.Confirm("onePair"));
            Assert.Throws<InvalidOperationException>(() => s.SetHeld(0, false));
            Assert.That(s.Reroll(), Is.False);
            s.NextTurn();
            Assert.That(s.Turn, Is.EqualTo(2));
            Assert.That(s.Phase, Is.EqualTo(BattlePhase.AwaitingRoll));
            Assert.That(s.RerollsLeft, Is.EqualTo(2));
        }

        [Test]
        public void InvalidCategoryDoesNotSpendTurn()
        {
            BattleSession s = Session();
            s.InitialRoll();
            int hp = s.EnemyHp;
            Assert.That(s.Confirm("largeStraight").Total, Is.Zero);
            Assert.That(s.EnemyHp, Is.EqualTo(hp));
            Assert.That(s.Phase, Is.EqualTo(BattlePhase.Choosing));
            Assert.Throws<ArgumentException>(() => s.Confirm("unknown"));
        }

        [Test]
        public void VictoryClampsHpAndStopsFurtherCommands()
        {
            BattleSession s = Session();
            for (int i = 0; i < 100; i++)
            {
                s.InitialRoll();
                s.Confirm("yahtzee");
                if (s.IsVictory) break;
                s.NextTurn();
            }
            Assert.That(s.IsVictory, Is.True);
            Assert.That(s.EnemyHp, Is.Zero);
            Assert.Throws<InvalidOperationException>(() => s.NextTurn());
            Assert.Throws<InvalidOperationException>(() => s.InitialRoll());
            Assert.Throws<InvalidOperationException>(() => s.Confirm("chance"));
            Assert.That(s.Reroll(), Is.False);
        }

        [Test]
        public void RejectsInvalidRngOutput()
        {
            Assert.Throws<InvalidOperationException>(() => new BattleSession(TestData.Load(), "wolf", n => n));
        }

        [Test]
        public void RejectsMissingData()
        {
            Assert.Throws<InvalidDataException>(() => GameDatabase.FromJson(_ => "null"));
            Assert.Throws<ArgumentNullException>(() => GameDatabase.FromJson(null));
        }
    }
}
