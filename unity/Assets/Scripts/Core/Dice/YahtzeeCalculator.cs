using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Redhood.Data;

namespace Redhood.Dice
{
    public readonly struct CategoryResult
    {
        public readonly bool Valid;
        public readonly int Base;
        public readonly int[] Contributing;

        public CategoryResult(bool valid, int baseDamage, IEnumerable<int> contributing)
        {
            Valid = valid;
            Base = baseDamage;
            Contributing = contributing.ToArray();
        }
    }

    public readonly struct DamageResult
    {
        public readonly bool Valid;
        public readonly int Base;
        public readonly int Gold;
        public readonly int Split;
        public readonly double Multiplier;
        public readonly double WhetMultiplier;
        public readonly int Bonus;
        public readonly int Flat;
        public readonly int Total;
        public readonly bool IsZero;
        public readonly int[] Contributing;

        public DamageResult(bool valid, int baseDamage, int gold, int split, double multiplier,
            double whetMultiplier, int bonus, int flat, int total, bool isZero, int[] contributing)
        {
            Valid = valid;
            Base = baseDamage;
            Gold = gold;
            Split = split;
            Multiplier = multiplier;
            WhetMultiplier = whetMultiplier;
            Bonus = bonus;
            Flat = flat;
            Total = total;
            IsZero = isZero;
            Contributing = contributing ?? Array.Empty<int>();
        }
    }

    public static class YahtzeeCalculator
    {
        public static CategoryResult Evaluate(CategoryDefinition category, IReadOnlyList<int> faces,
            ISet<int> zeroed = null)
        {
            var all = Enumerable.Range(0, faces.Count).Where(i => faces[i] > 0).ToList();
            int Value(int index) => zeroed != null && zeroed.Contains(index) ? 0 : faces[index];
            Dictionary<int, int> counts = all.GroupBy(i => faces[i])
                .ToDictionary(group => group.Key, group => group.Count());

            switch (category.Kind)
            {
                case "upper":
                {
                    int[] indices = all.Where(i => faces[i] == category.Face).ToArray();
                    return Pass(indices.Sum(Value), indices);
                }
                case "ofKind":
                {
                    int[] matchingFaces = counts.Where(pair => pair.Value >= category.Count)
                        .Select(pair => pair.Key).ToArray();
                    if (matchingFaces.Length == 0) return Fail();

                    string score = ScoreText(category.Score);
                    if (score is "matchedSum" or "matchedSumX2")
                    {
                        int face = matchingFaces.Max();
                        int[] indices = all.Where(i => faces[i] == face).ToArray();
                        double multiplier = score == "matchedSumX2" ? 2d : Multiplier(category);
                        return Pass(Floor(indices.Sum(Value) * multiplier), indices);
                    }

                    int baseDamage = score == "sumAll" ? all.Sum(Value) : ScoreNumber(category.Score);
                    return Pass(baseDamage, all);
                }
                case "twoPair":
                {
                    int[] pairFaces = counts.Where(pair => pair.Value >= 2)
                        .Select(pair => pair.Key).OrderByDescending(face => face).Take(2).ToArray();
                    if (pairFaces.Length < 2) return Fail();

                    var indices = new List<int>(4);
                    foreach (int face in pairFaces)
                        indices.AddRange(all.Where(i => faces[i] == face).Take(2));
                    return Pass(Floor(indices.Sum(Value) * Multiplier(category)), indices);
                }
                case "fullHouse":
                {
                    int[] groups = counts.Values.OrderBy(value => value).ToArray();
                    bool valid = groups.SequenceEqual(new[] { 2, 3 }) || (groups.Length > 0 && groups[0] == 5);
                    if (!valid) return Fail();
                    int baseDamage = ScoreText(category.Score) == "sumAll"
                        ? Floor(all.Sum(Value) * Multiplier(category))
                        : ScoreNumber(category.Score);
                    return Pass(baseDamage, all);
                }
                case "straight":
                    return EvaluateStraight(category, faces, all, Value);
                case "chance":
                    return EvaluateChance(category, faces, all, Value);
                default:
                    return Fail();
            }
        }

        public static DamageResult ComputeDamage(CategoryDefinition category, IReadOnlyList<int> faces,
            IReadOnlyList<DiceDefinition> dice, IReadOnlyList<RelicDefinition> relics,
            ScoringDefinition scoring, ISet<int> zeroed = null, int whet = 0, double hpRatio = 1d)
        {
            CategoryResult evaluation = Evaluate(category, faces, zeroed);
            int gold = 0;
            int split = 0;
            foreach (int index in evaluation.Contributing)
            {
                if (index >= dice.Count || dice[index] == null) continue;
                DiceDefinition die = dice[index];
                if (die.Gold) gold += faces[index];
                if (die.Effect?.Op == "split" && category.Kind == "ofKind") split += faces[index];
            }

            int core = evaluation.Base + gold + split;
            if (!evaluation.Valid || core == 0)
                return new DamageResult(evaluation.Valid, evaluation.Base, 0, 0, 1d, 1d,
                    0, 0, 0, true, evaluation.Contributing);

            double multiplier = 1d;
            int bonus = 0;
            int flat = 0;
            foreach (RelicDefinition relic in relics ?? Array.Empty<RelicDefinition>())
            foreach (RelicHook hook in relic.EnumerateHooks())
            {
                if (hook.Type == "categoryMult" && hook.Category == category.Id) multiplier *= hook.Mult;
                if (hook.Type == "categoryBonus" && hook.Category == category.Id) bonus += hook.Bonus;
                if (hook.Type == "kindBonus" && hook.Kind == category.Kind) bonus += hook.Bonus;
                if (hook.Type == "aoeBonus" && category.Target == "allEnemies") bonus += hook.Bonus;
                if (hook.Type == "flatDamage") flat += hook.Amount;
                if (hook.Type == "lowHpMult" && hpRatio <= hook.Ratio) multiplier *= hook.Mult;
            }

            double whetMultiplier = 1d + Math.Min(whet, scoring.WhetCap) * scoring.WhetStep;
            int total = Floor(core * multiplier * whetMultiplier) + bonus + flat;
            return new DamageResult(true, evaluation.Base, gold, split, multiplier, whetMultiplier,
                bonus, flat, total, false, evaluation.Contributing);
        }

        private static CategoryResult EvaluateStraight(CategoryDefinition category, IReadOnlyList<int> faces,
            List<int> all, Func<int, int> value)
        {
            int[] unique = all.Select(i => faces[i]).Distinct().OrderBy(face => face).ToArray();
            int run = 1;
            int best = unique.Length > 0 ? 1 : 0;
            int endAt = unique.Length > 0 ? unique[0] : 0;
            for (int i = 1; i < unique.Length; i++)
            {
                run = unique[i] == unique[i - 1] + 1 ? run + 1 : 1;
                if (run > best)
                {
                    best = run;
                    endAt = unique[i];
                }
            }
            if (best < category.Length) return Fail();

            var runFaces = new HashSet<int>(Enumerable.Range(endAt - category.Length + 1, category.Length));
            var used = new HashSet<int>();
            int[] indices = all.Where(i => runFaces.Contains(faces[i]) && used.Add(faces[i])).ToArray();
            int baseDamage = category.Score?.Type == JTokenType.Integer || category.Score?.Type == JTokenType.Float
                ? ScoreNumber(category.Score)
                : Floor(indices.Sum(value) * Multiplier(category));
            return Pass(baseDamage, indices);
        }

        private static CategoryResult EvaluateChance(CategoryDefinition category, IReadOnlyList<int> faces,
            List<int> all, Func<int, int> value)
        {
            string score = ScoreText(category.Score);
            if (score == "highestDie")
            {
                if (all.Count == 0) return Pass(0, Array.Empty<int>());
                int best = all[0];
                foreach (int index in all)
                    if (value(index) > value(best)) best = index;
                return Pass(value(best), new[] { best });
            }

            IEnumerable<int> ordered = all.OrderByDescending(value);
            if (score == "sumTop3Distinct")
            {
                var seen = new HashSet<int>();
                int[] indices = ordered.Where(i => seen.Add(value(i))).Take(3).ToArray();
                return Pass(indices.Sum(value), indices);
            }
            if (score == "sumTop3")
            {
                int[] indices = ordered.Take(3).ToArray();
                return Pass(indices.Sum(value), indices);
            }
            return Pass(all.Sum(value), all);
        }

        private static string ScoreText(JToken score) => score?.Type == JTokenType.String
            ? score.Value<string>() : string.Empty;

        private static int ScoreNumber(JToken score) => score != null && score.Type != JTokenType.Null
            ? score.Value<int>() : 0;

        private static int Floor(double value) => (int)Math.Floor(value);
        private static double Multiplier(CategoryDefinition category) => category.Mult == 0 ? 1d : category.Mult;
        private static CategoryResult Pass(int damage, IEnumerable<int> indices) => new(true, damage, indices);
        private static CategoryResult Fail() => new(false, 0, Array.Empty<int>());
    }
}
