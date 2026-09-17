using System;
using System.Collections.Generic;
using System.Linq;
using Redhood.Data;
using Redhood.Dice;

namespace Redhood.Battle
{
    public enum BattlePhase { AwaitingRoll, Choosing, TurnComplete, Victory }

    // Scoring practice only. Enemy AI, variants, status effects and run progression are not simulated.
    public sealed class BattleSession
    {
        private readonly Func<int, int> _next;
        private readonly ScoringDefinition _scoring;
        private readonly DiceDefinition[] _dice;
        private readonly int[] _faces = new int[5];
        private readonly bool[] _held = new bool[5];
        public IReadOnlyList<int> Faces { get; }
        public IReadOnlyList<bool> Held { get; }
        public int RerollsLeft { get; private set; }
        public int EnemyHp { get; private set; }
        public int EnemyMaxHp { get; }
        public string EnemyId { get; }
        public string EnemyName { get; }
        public int Turn { get; private set; } = 1;
        public BattlePhase Phase { get; private set; } = BattlePhase.AwaitingRoll;
        public bool IsVictory => Phase == BattlePhase.Victory;
        public bool CanReroll => Phase == BattlePhase.Choosing && RerollsLeft > 0 && _held.Any(h => !h);

        public BattleSession(GameDatabase database, string enemyId, Func<int, int> next = null)
        {
            if (database == null) throw new ArgumentNullException(nameof(database));
            _scoring = database.Scoring;
            _dice = database.Player.StartDice.Select(database.Die).ToArray();
            // Do not silently present unsupported special dice as normal dice.
            if (_dice.Any(d => d.Effect != null && d.Effect.Op != "split"))
                throw new NotSupportedException("Practice currently supports normal/gold/split dice only.");
            var random = new Random();
            _next = next ?? random.Next;
            EnemyDefinition enemy = database.Enemy(enemyId);
            EnemyId = enemy.Id;
            EnemyName = enemy.Name;
            EnemyMaxHp = enemy.Hp[0] + Next(enemy.Hp[1] - enemy.Hp[0] + 1);
            EnemyHp = EnemyMaxHp;
            Faces = Array.AsReadOnly(_faces);
            Held = Array.AsReadOnly(_held);
            RerollsLeft = _scoring.RerollsPerTurn;
        }

        public void InitialRoll()
        {
            Require(BattlePhase.AwaitingRoll);
            for (int i = 0; i < 5; i++) Roll(i);
            Phase = BattlePhase.Choosing;
        }

        public void SetHeld(int index, bool held)
        {
            Require(BattlePhase.Choosing);
            if (index < 0 || index >= 5) throw new ArgumentOutOfRangeException(nameof(index));
            _held[index] = held;
        }

        public bool Reroll()
        {
            if (!CanReroll) return false;
            for (int i = 0; i < 5; i++) if (!_held[i]) Roll(i);
            RerollsLeft--;
            return true;
        }

        public DamageResult Preview(string categoryId)
        {
            Require(BattlePhase.Choosing);
            return YahtzeeCalculator.ComputeDamage(Category(categoryId), _faces, _dice,
                Array.Empty<RelicDefinition>(), _scoring);
        }

        public DamageResult Confirm(string categoryId)
        {
            DamageResult result = Preview(categoryId);
            if (!result.Valid || result.IsZero) return result;
            EnemyHp = Math.Max(0, EnemyHp - result.Total);
            Phase = EnemyHp == 0 ? BattlePhase.Victory : BattlePhase.TurnComplete;
            return result;
        }

        public void NextTurn()
        {
            Require(BattlePhase.TurnComplete);
            Turn++;
            Array.Clear(_faces, 0, 5);
            Array.Clear(_held, 0, 5);
            RerollsLeft = _scoring.RerollsPerTurn;
            Phase = BattlePhase.AwaitingRoll;
        }

        private CategoryDefinition Category(string id) =>
            _scoring.Categories.FirstOrDefault(c => c.Id == id)
            ?? throw new ArgumentException($"Unknown category: {id}", nameof(id));

        private void Roll(int index)
        {
            _faces[index] = _dice[index].Faces[Next(_dice[index].Faces.Length)];
            _held[index] = true; // Web convention: keep all; tap dice to choose reroll.
        }

        private int Next(int upperBound)
        {
            int value = _next(upperBound);
            if (value < 0 || value >= upperBound)
                throw new InvalidOperationException("Random source returned an out-of-range index.");
            return value;
        }

        private void Require(BattlePhase expected)
        {
            if (Phase != expected)
                throw new InvalidOperationException($"Expected {expected}, got {Phase}.");
        }
    }
}
