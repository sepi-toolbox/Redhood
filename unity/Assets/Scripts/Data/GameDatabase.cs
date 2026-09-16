using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using UnityEngine;

namespace Redhood.Data
{
    public sealed class GameDatabase
    {
        public ScoringDefinition Scoring { get; private set; }
        public IReadOnlyList<DiceDefinition> Dice { get; private set; }
        public IReadOnlyList<RelicDefinition> Relics { get; private set; }

        public static GameDatabase Load(string dataDirectory = null)
        {
            string root = dataDirectory ?? ResolveDataDirectory();
            var database = new GameDatabase
            {
                Scoring = Read<ScoringDefinition>(root, "scoring.json"),
                Dice = Read<List<DiceDefinition>>(root, "dice.json"),
                Relics = Read<List<RelicDefinition>>(root, "relics.json")
            };

            if (database.Scoring?.Categories == null || database.Scoring.Categories.Count == 0)
                throw new InvalidDataException("scoring.json contains no categories.");
            if (database.Dice == null || database.Dice.Count == 0)
                throw new InvalidDataException("dice.json contains no dice.");

            return database;
        }

        public CategoryDefinition Category(string id) =>
            Scoring.Categories.First(category => category.Id == id);

        public DiceDefinition Die(string id) => Dice.First(die => die.Id == id);

        public RelicDefinition Relic(string id) => Relics.First(relic => relic.Id == id);

        private static T Read<T>(string root, string fileName)
        {
            string path = Path.Combine(root, fileName);
            if (!File.Exists(path))
                throw new FileNotFoundException($"REDHOOD data file not found: {path}", path);

            T value = JsonConvert.DeserializeObject<T>(File.ReadAllText(path));
            return value ?? throw new InvalidDataException($"Could not parse {path}");
        }

        private static string ResolveDataDirectory()
        {
#if UNITY_EDITOR
            return Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data"));
#else
            return Path.Combine(Application.streamingAssetsPath, "Data");
#endif
        }
    }
}
