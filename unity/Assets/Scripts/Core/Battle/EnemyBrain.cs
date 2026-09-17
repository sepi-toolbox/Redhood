using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using Redhood.Data;

namespace Redhood.Battle
{
    // js/engine.js chooseMove/interrupt, at enlightenment 0.
    public sealed class EnemyBrain
    {
        private readonly EnemyDefinition _definition;
        private readonly Func<double> _random;
        private readonly Dictionary<string, int> _cooldown = new();
        private readonly List<string> _recent = new();
        private int _breakTaken, _chainDepth;
        private bool _phaseShift, _broken;
        public string MoveId { get; private set; }
        public EnemyMove Move { get; private set; }
        public int PhaseIndex { get; private set; }

        public EnemyBrain(EnemyDefinition definition, Func<double> random)
        {
            _definition = definition ?? throw new ArgumentNullException(nameof(definition));
            _random = random ?? throw new ArgumentNullException(nameof(random));
        }

        public void Choose(int turn, int hp, int maxHp)
        {
            if (Move?.FollowUp != null && _chainDepth < 8)
            {
                var follow = Move.FollowUp is JArray array ? array.ToArray() : new[] { Move.FollowUp };
                foreach (JToken candidate in follow)
                {
                    string id = candidate.Value<string>("move");
                    if (Definition(id) == null || !Usable(id, turn) || Cooling(id, turn)) continue;
                    if (_random() >= (candidate.Value<double?>("chance") ?? 1d)) continue;
                    int depth = _chainDepth + 1;
                    Stamp(id, turn);
                    SetMove(id);
                    _chainDepth = depth;
                    return;
                }
            }
            int index = PhaseFor(hp, maxHp);
            if (index != PhaseIndex) { PhaseIndex = index; _recent.Clear(); }
            EnemyPattern pattern = _definition.Phases == null
                ? _definition.Pattern : _definition.Phases[PhaseIndex].Pattern;
            if (pattern == null || pattern.Weights.Count == 0)
                throw new InvalidDataException($"Missing enemy pattern: {_definition.Id}");
            var entries = pattern.Weights.Where(p => p.Value > 0 && Usable(p.Key, turn)
                && !Cooling(p.Key, turn) && !Repeated(p.Key, pattern.NoRepeat)).ToList();
            if (entries.Count == 0 && Definition(_definition.DefaultMove) != null)
            {
                SetMove(_definition.DefaultMove); // Forced fallback bypasses cooldown stamping.
                return;
            }
            if (entries.Count == 0) entries = pattern.Weights.Where(p => p.Value > 0 && Usable(p.Key, turn)).ToList();
            if (entries.Count == 0) entries = pattern.Weights.Where(p => p.Value > 0).ToList();
            if (entries.Count == 0) entries = pattern.Weights.ToList();
            double roll = _random() * entries.Sum(p => p.Value);
            string selected = entries[entries.Count - 1].Key;
            foreach (var entry in entries)
            {
                roll -= entry.Value;
                if (roll <= 0) { selected = entry.Key; break; }
            }
            _recent.Add(selected);
            Stamp(selected, turn);
            SetMove(selected);
        }

        public void Interrupt(int hp, int maxHp, int hpDamage)
        {
            int index = PhaseFor(hp, maxHp);
            if (index != PhaseIndex)
            {
                int previous = PhaseIndex;
                PhaseIndex = index;
                _recent.Clear();
                string enter = _definition.Phases[index].Enter;
                if (index > previous && Definition(enter) != null)
                {
                    SetMove(enter);
                    _phaseShift = true;
                    return;
                }
            }
            if (Move == null || _phaseShift || _broken || !_definition.Moves.ContainsKey(MoveId)) return;
            EnemyBreak condition = Move.Break;
            if (condition == null || condition.Damage <= 0) return;
            _breakTaken += hpDamage;
            if (_breakTaken >= condition.Damage && Definition(condition.Move) != null)
            {
                SetMove(condition.Move);
                _broken = true;
            }
        }

        private int PhaseFor(int hp, int maxHp)
        {
            if (_definition.Phases == null) return 0;
            for (int i = 0; i < _definition.Phases.Count; i++)
                if ((double)hp / maxHp > _definition.Phases[i].UntilHpRatio) return i;
            return _definition.Phases.Count - 1;
        }

        private bool Repeated(string id, int noRepeat)
        {
            if (noRepeat <= 0) return false;
            int n = noRepeat - 1;
            var recent = n == 0 ? _recent : _recent.Skip(Math.Max(0, _recent.Count - n));
            return recent.Count() == n && recent.All(x => x == id);
        }

        private EnemyMove Definition(string id)
        {
            if (id == null) return null;
            if (_definition.Moves.TryGetValue(id, out EnemyMove normal)) return normal;
            return _definition.UniqueMoves.TryGetValue(id, out EnemyMove unique) ? unique : null;
        }

        private bool Usable(string id, int turn)
        {
            EnemyMove move = Definition(id);
            return move != null && (move.MinTurn <= 0 || turn >= move.MinTurn)
                && (move.LockTurn <= 0 || turn < move.LockTurn);
        }

        private bool Cooling(string id, int turn) => _cooldown.TryGetValue(id, out int until) && until >= turn;
        private void Stamp(string id, int turn)
        {
            if (_definition.Moves.TryGetValue(id, out EnemyMove move) && move.Cooldown > 0)
                _cooldown[id] = turn + move.Cooldown;
        }

        private void SetMove(string id)
        {
            Move = Definition(id) ?? throw new InvalidDataException($"Unknown enemy move: {id}");
            MoveId = id;
            _breakTaken = _chainDepth = 0;
            _phaseShift = _broken = false;
        }
    }
}
