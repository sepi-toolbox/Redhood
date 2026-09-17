using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace Redhood.Data
{
    // No engine or filesystem dependency: Editor, player and headless tests supply JSON text.
    public sealed class GameDatabase
    {
        public static readonly string[] RequiredFiles =
            { "scoring.json", "dice.json", "relics.json", "enemies.json", "act1.json" };

        public ScoringDefinition Scoring { get; private set; }
        public IReadOnlyList<DiceDefinition> Dice { get; private set; }
        public IReadOnlyList<RelicDefinition> Relics { get; private set; }
        public IReadOnlyList<EnemyDefinition> Enemies { get; private set; }
        public PlayerDefinition Player { get; private set; }

        public static GameDatabase FromJson(Func<string, string> read)
        {
            if (read == null) throw new ArgumentNullException(nameof(read));
            var db = new GameDatabase
            {
                Scoring = Parse<ScoringDefinition>(read, "scoring.json"),
                Dice = Parse<List<DiceDefinition>>(read, "dice.json"),
                Relics = Parse<List<RelicDefinition>>(read, "relics.json"),
                Enemies = Parse<List<EnemyDefinition>>(read, "enemies.json"),
                Player = Parse<ActDefinition>(read, "act1.json").Player
            };
            if (db.Scoring.Categories == null || db.Scoring.Categories.Count == 0)
                throw new InvalidDataException("scoring.json: categories are empty.");
            if (db.Scoring.RerollsPerTurn < 0 || db.Dice.Count == 0 || db.Enemies.Count == 0)
                throw new InvalidDataException("Invalid scoring, dice or enemy data.");
            if (db.Player == null || db.Player.MaxHp <= 0 || db.Player.StartDice.Length != 5)
                throw new InvalidDataException("act1.json: expected five starting dice and positive HP.");
            CheckIds(db.Scoring.Categories.Select(c => c.Id), "categories");
            CheckIds(db.Dice.Select(d => d.Id), "dice");
            CheckIds(db.Relics.Select(r => r.Id), "relics");
            CheckIds(db.Enemies.Select(e => e.Id), "enemies");
            foreach (DiceDefinition die in db.Dice)
                if (die.Faces == null || die.Faces.Length == 0 || die.Faces.Any(f => f <= 0))
                    throw new InvalidDataException($"dice.json: invalid faces on {die.Id}.");
            foreach (EnemyDefinition enemy in db.Enemies)
                if (enemy.Hp == null || enemy.Hp.Length != 2 || enemy.Hp[0] <= 0 || enemy.Hp[1] < enemy.Hp[0])
                    throw new InvalidDataException($"enemies.json: invalid HP on {enemy.Id}.");
            foreach (string id in db.Player.StartDice) db.Die(id);
            return db;
        }

        public CategoryDefinition Category(string id) => Scoring.Categories.First(c => c.Id == id);
        public DiceDefinition Die(string id) => Dice.First(d => d.Id == id);
        public RelicDefinition Relic(string id) => Relics.First(r => r.Id == id);
        public EnemyDefinition Enemy(string id) => Enemies.First(e => e.Id == id);

        private static T Parse<T>(Func<string, string> read, string name) where T : class =>
            JsonConvert.DeserializeObject<T>(read(name))
            ?? throw new InvalidDataException($"Could not parse {name}.");

        private static void CheckIds(IEnumerable<string> values, string name)
        {
            var ids = new HashSet<string>();
            foreach (string id in values)
                if (string.IsNullOrWhiteSpace(id) || !ids.Add(id))
                    throw new InvalidDataException($"{name}: missing or duplicate id '{id}'.");
        }
    }
}
