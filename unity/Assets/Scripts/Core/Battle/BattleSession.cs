using System;
using System.Collections.Generic;
using System.Linq;
using Redhood.Data;
using Redhood.Dice;

namespace Redhood.Battle
{
    public enum BattlePhase { AwaitingRoll, Choosing, EnemyTurn, Victory, Defeat }

    // One wolf, act/floor 1, enlightenment 0, base categories, no relics/variants.
    public sealed class BattleSession
    {
        private readonly Func<double> _random;
        private readonly ScoringDefinition _scoring;
        private readonly DiceDefinition[] _dice;
        private readonly EnemyBrain _brain;
        private readonly int _bleedDuration;
        private readonly int[] _bleedLeft = new int[5];
        private readonly int[] _faces = new int[5];
        private readonly bool[] _held = new bool[5];
        public IReadOnlyList<int> Faces { get; }
        public IReadOnlyList<bool> Held { get; }
        public IReadOnlyList<int> BleedLeft { get; }
        public int PlayerHp { get; private set; }
        public int PlayerMaxHp { get; }
        public int EnemyStrength { get; private set; }
        public int EnemyBlock { get; private set; }
        public EnemyMove Intent => _brain.Move;
        public string IntentId => _brain.MoveId;
        public int EnemyPhaseIndex => _brain.PhaseIndex;
        public int RollTax { get; private set; }
        public int RollTaxTurns { get; private set; }
        public int LastPlayerHpLoss { get; private set; }
        public string LastEnemyAction { get; private set; }
        public int RerollsLeft { get; private set; }
        public int EnemyHp { get; private set; }
        public int EnemyMaxHp { get; }
        public string EnemyId { get; }
        public string EnemyName { get; }
        public int Turn { get; private set; } = 1;
        public BattlePhase Phase { get; private set; } = BattlePhase.AwaitingRoll;
        public bool IsVictory => Phase == BattlePhase.Victory;
        public bool IsDefeat => Phase == BattlePhase.Defeat;
        public bool CanReroll => Phase == BattlePhase.Choosing && RerollsLeft > 0 && _held.Any(h => !h);

        public BattleSession(GameDatabase database, string enemyId, Func<double> random = null)
        {
            if (database == null) throw new ArgumentNullException(nameof(database));
            _scoring = database.Scoring;
            _dice = database.Player.StartDice.Select(database.Die).ToArray();
            // Do not silently present unsupported special dice as normal dice.
            if (_dice.Any(d => d.Effect != null && d.Effect.Op != "split"))
                throw new NotSupportedException("Practice currently supports normal/gold/split dice only.");
            _random = random ?? new Random().NextDouble;
            EnemyDefinition enemy = database.Enemy(enemyId);
            // Refuse incomplete encounters instead of silently dropping their effects.
            if (enemyId != "wolf") throw new NotSupportedException("Only the wolf encounter is currently ported.");
            if (enemy.Start != null && enemy.Start.Properties().Any())
                throw new NotSupportedException("Enemy starting buffs are not yet supported.");
            foreach (var move in enemy.Moves.Values.Concat(enemy.UniqueMoves.Values))
                foreach (var effect in move.Effects)
                    if (!(new[] { "damage", "strength", "block", "heal", "rest", "selfDamage", "rollTax" }.Contains(effect.Op)
                        || effect.Op == "status" && effect.Kind == "bleed"))
                        throw new NotSupportedException($"Unsupported enemy effect: {effect.Op}/{effect.Kind}");
            StatusDefinition bleed = database.Statuses.First(s => s.Id == "bleed");
            if (bleed.Rule != "onUseFaceDamage" || bleed.Turns <= 0)
                throw new NotSupportedException("Unexpected bleed rule in statuses.json.");
            _bleedDuration = bleed.Turns;
            PlayerHp = PlayerMaxHp = database.Player.MaxHp;
            EnemyId = enemy.Id;
            EnemyName = enemy.Name;
            EnemyMaxHp = enemy.Hp[0] + Next(enemy.Hp[1] - enemy.Hp[0] + 1);
            EnemyHp = EnemyMaxHp;
            Faces = Array.AsReadOnly(_faces);
            Held = Array.AsReadOnly(_held);
            BleedLeft = Array.AsReadOnly(_bleedLeft);
            RerollsLeft = _scoring.RerollsPerTurn;
            _brain = new EnemyBrain(enemy, Sample);
            _brain.Choose(Turn, EnemyHp, EnemyMaxHp);
        }

        public void InitialRoll()
        {
            Require(BattlePhase.AwaitingRoll);
            for (int i = 0; i < 5; i++) Roll(i);
            LastPlayerHpLoss = 0;
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
            LastPlayerHpLoss = Math.Min(PlayerHp, RollTax);
            HurtPlayer(RollTax);
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
            int absorbed = Math.Min(EnemyBlock, result.Total);
            EnemyBlock -= absorbed;
            int dealt = result.Total - absorbed;
            EnemyHp = Math.Max(0, EnemyHp - dealt);
            if (EnemyHp > 0 && dealt > 0) _brain.Interrupt(EnemyHp, EnemyMaxHp, dealt);
            int cost = BleedCost(result);
            LastPlayerHpLoss = Math.Min(PlayerHp, cost);
            HurtPlayer(cost); // The web client resolves bleed even on a killing blow.
            if (IsDefeat) return result;
            if (EnemyHp == 0) { Phase = BattlePhase.Victory; return result; }
            for (int i = 0; i < 5; i++) if (_bleedLeft[i] > 0) _bleedLeft[i]--;
            Phase = BattlePhase.EnemyTurn;
            return result;
        }

        public int PreviewBleedCost(string categoryId) => BleedCost(Preview(categoryId));
        private int BleedCost(DamageResult result) => result.Contributing.Distinct()
            .Where(i => _bleedLeft[i] > 0).Sum(i => _faces[i]);

        // Player confirmation and enemy resolution are separate UI steps, as in JS.
        public void NextTurn()
        {
            Require(BattlePhase.EnemyTurn);
            EnemyBlock = 0;
            LastEnemyAction = Intent.Name;
            int before = PlayerHp;
            foreach (EnemyEffect effect in Intent.Effects)
            {
                if (EnemyHp <= 0) break;
                switch (effect.Op)
                {
                    case "damage":
                        for (int hit = 0; hit < Math.Max(1, effect.Hits); hit++)
                        {
                            HurtPlayer(Math.Max(0, effect.Amount + EnemyStrength));
                            if (IsDefeat) { LastPlayerHpLoss = before - PlayerHp; return; }
                        }
                        break;
                    case "strength": EnemyStrength += effect.Amount; break;
                    case "block": EnemyBlock += effect.Amount; break;
                    case "heal": EnemyHp = Math.Min(EnemyMaxHp, EnemyHp + effect.Amount); break;
                    case "selfDamage": EnemyHp = Math.Max(0, EnemyHp - effect.Amount); break;
                    case "status": ApplyBleed(Math.Max(1, effect.Amount)); break;
                    case "rollTax":
                        RollTax = effect.Amount == 0 ? 1 : effect.Amount;
                        RollTaxTurns = (effect.Turns == 0 ? 1 : effect.Turns) + 1;
                        break;
                    case "rest": break;
                }
            }
            LastPlayerHpLoss = before - PlayerHp;
            _brain.Choose(Turn + 1, EnemyHp, EnemyMaxHp);
            if (EnemyHp == 0) { Phase = BattlePhase.Victory; return; }
            Turn++;
            Array.Clear(_faces, 0, 5);
            Array.Clear(_held, 0, 5);
            RerollsLeft = _scoring.RerollsPerTurn;
            if (RollTaxTurns > 0 && --RollTaxTurns == 0) RollTax = 0;
            Phase = BattlePhase.AwaitingRoll;
        }

        private void ApplyBleed(int count)
        {
            var touched = new HashSet<int>();
            for (int k = 0; k < count; k++)
            {
                int[] free = Enumerable.Range(0, 5).Where(i => _bleedLeft[i] == 0 && !touched.Contains(i)).ToArray();
                int[] rest = Enumerable.Range(0, 5).Where(i => !touched.Contains(i)).ToArray();
                int[] pool = free.Length > 0 ? free : rest.Length > 0 ? rest : Enumerable.Range(0, 5).ToArray();
                int index = pool[Next(pool.Length)];
                touched.Add(index);
                _bleedLeft[index] = _bleedDuration;
            }
        }

        private void HurtPlayer(int amount)
        {
            PlayerHp = Math.Max(0, PlayerHp - amount);
            if (PlayerHp == 0) Phase = BattlePhase.Defeat;
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
            return (int)Math.Floor(Sample() * upperBound);
        }

        private double Sample()
        {
            double value = _random();
            if (double.IsNaN(value) || value < 0 || value >= 1)
                throw new InvalidOperationException("Random source must return a value in [0, 1).");
            return value;
        }

        private void Require(BattlePhase expected)
        {
            if (Phase != expected)
                throw new InvalidOperationException($"Expected {expected}, got {Phase}.");
        }
    }
}
