using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Redhood.Data;
using Redhood.Dice;

namespace Redhood.Tests
{
    public sealed class YahtzeeCalculatorTests
    {
        [Test]
        public void Chance_UsesHighestNonStunnedValue()
        {
            CategoryDefinition category = Category("chance", "chance", "highestDie");
            CategoryResult result = YahtzeeCalculator.Evaluate(category, new[] { 6, 4, 3, 2, 1 },
                new HashSet<int> { 0 });
            Assert.That(result.Base, Is.EqualTo(4));
            Assert.That(result.Contributing, Is.EqualTo(new[] { 1 }));
        }

        [Test]
        public void TwoPair_TakesExactlyTwoDiceFromEachHighestPair()
        {
            CategoryDefinition category = Category("twoPair", "twoPair", "matchedSum", mult: 1.25d);
            CategoryResult result = YahtzeeCalculator.Evaluate(category, new[] { 5, 5, 5, 3, 3 });
            Assert.That(result.Valid, Is.True);
            Assert.That(result.Base, Is.EqualTo(20));
            Assert.That(result.Contributing, Is.EqualTo(new[] { 0, 1, 3, 4 }));
        }

        [Test]
        public void Straight_UsesSumTimesMultiplier_AndStunnedDieScoresZero()
        {
            CategoryDefinition category = Category("largeStraight", "straight", "sumRun", mult: 3.4d);
            category.Length = 5;
            CategoryResult result = YahtzeeCalculator.Evaluate(category, new[] { 2, 3, 4, 5, 6 },
                new HashSet<int> { 4 });
            Assert.That(result.Valid, Is.True);
            Assert.That(result.Base, Is.EqualTo(47));
        }

        [Test]
        public void FullHouse_AcceptsYahtzee_AsWebRulesDo()
        {
            CategoryDefinition category = Category("fullHouse", "fullHouse", "sumAll", mult: 1.8d);
            CategoryResult result = YahtzeeCalculator.Evaluate(category, new[] { 4, 4, 4, 4, 4 });
            Assert.That(result.Valid, Is.True);
            Assert.That(result.Base, Is.EqualTo(36));
        }

        [Test]
        public void Damage_AppliesGoldSplitRelicAndWhetInWebOrder()
        {
            CategoryDefinition category = Category("onePair", "ofKind", "matchedSum", count: 2);
            var dice = new[]
            {
                Die(gold: true), Die(effect: "split"), Die(), Die(), Die()
            };
            var relics = new[]
            {
                new RelicDefinition { Hooks = new List<RelicHook>
                {
                    new() { Type = "categoryMult", Category = "onePair", Mult = 2d },
                    new() { Type = "categoryBonus", Category = "onePair", Bonus = 3 },
                    new() { Type = "flatDamage", Amount = 1 }
                }}
            };
            var scoring = new ScoringDefinition { WhetStep = 0.25d, WhetCap = 6 };

            DamageResult result = YahtzeeCalculator.ComputeDamage(category, new[] { 5, 5, 2, 3, 4 },
                dice, relics, scoring, whet: 2);

            Assert.That(result.Base, Is.EqualTo(10));
            Assert.That(result.Gold, Is.EqualTo(5));
            Assert.That(result.Split, Is.EqualTo(5));
            Assert.That(result.Total, Is.EqualTo(64));
        }

        private static CategoryDefinition Category(string id, string kind, object score,
            int count = 0, double mult = 1d) => new()
        {
            Id = id,
            Kind = kind,
            Score = score is string text ? new JValue(text) : JToken.FromObject(score),
            Count = count,
            Mult = mult
        };

        private static DiceDefinition Die(bool gold = false, string effect = null) => new()
        {
            Id = "test",
            Faces = new[] { 1, 2, 3, 4, 5, 6 },
            Gold = gold,
            Effect = effect == null ? null : new DiceEffect { Op = effect }
        };
    }
}
