using System;
using System.IO;
using Redhood.Data;

namespace Redhood.Tests
{
    internal static class TestData
    {
        public static string Root
        {
            get
            {
#if UNITY_EDITOR
                return Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath, "../.."));
#else
                return Environment.GetEnvironmentVariable("REDHOOD_REPOSITORY")
                    ?? throw new InvalidOperationException("Set REDHOOD_REPOSITORY to the repo root.");
#endif
            }
        }
        public static GameDatabase Load() => GameDatabase.FromJson(
            name => File.ReadAllText(Path.Combine(Root, "data", name)));
    }
}
