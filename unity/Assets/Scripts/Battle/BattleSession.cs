using System;
using System.Collections.Generic;
using System.Linq;
using Redhood.Data;
using Redhood.Dice;

namespace Redhood.Battle
{
    public sealed class BattleSession
    {
        private readonly Random _random;
        private readonly ScoringDefinition _scoring;
        private readonly List<DiceDefinition> _dice;
        private readonly List<RelicDefinition> _relics;
        private readonly bool[] _held;

        public int[] Faces { get; }
        public int RerollsLeft { get; private set; }
        public int EnemyHp { get; private set; }
        public int Whet { get; set; }
        public bool IsVictory => EnemyHp <= 0;

        public BattleSession(ScoringDefinition scoring, IEnumerable<DiceDefinition> dice,
            int enemyHp, IEnumerable<RelicDefinition> relics = null, int? seed = null)
        {
            _scoring = scoring ?? throw new ArgumentNullException(nameof(scoring));
            _dice = dice?.ToList() ?? throw new ArgumentNullException(nameof(dice));
            if (_dice.Count != 5) throw new ArgumentException("The prototype requires exactly five dice.");
            _relics = relics?.ToList() ?? new List<RelicDefinition>();
            _random = seed.HasValue ? new Random(seed.Value) : new Random();
            _held = new bool[_dice.Count];
            Faces = new int[_dice.Count];
            EnemyHp = Math.Max(1, enemyHp);
            BeginTurn();
        }

        public void BeginTurn()
        {
            Array.Clear(_held, 0, _held.Length);
            RerollsLeft = _scoring.RerollsPerTurn;
            RollUnheld();
        }

        public void SetHeld(int index, bool held)
        {
            if (index < 0 || index >= _held.Length) throw new ArgumentOutOfRangeException(nameof(index));
            _held[index] = held;
        }

        public void Reroll()
        {
            if (RerollsLeft <= 0) throw new InvalidOperationException("No rerolls remain.");
            RollUnheld();
            RerollsLeft--;
        }

        public DamageResult Confirm(CategoryDefinition category)
        {
            if (IsVictory) throw new InvalidOperationException("The battle is already over.");
            DamageResult result = YahtzeeCalculator.ComputeDamage(category, Faces, _dice, _relics, _scoring,
                whet: Whet);
            if (!result.Valid || result.IsZero) return result;

            EnemyHp = Math.Max(0, EnemyHp - result.Total);
            Whet = 0;
            return result;
        }

        private void RollUnheld()
        {
            for (int i = 0; i < _dice.Count; i++)
            {
                if (_held[i]) continue;
                int[] sides = _dice[i].Faces;
                if (sides == null || sides.Length == 0)
                    throw new InvalidOperationException($"Die '{_dice[i].Id}' has no faces.");
                Faces[i] = sides[_random.Next(sides.Length)];
            }
        }
    }
}
