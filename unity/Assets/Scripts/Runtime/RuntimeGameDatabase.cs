using System.IO;
using Redhood.Data;
using UnityEngine;

namespace Redhood
{
    public static class RuntimeGameDatabase
    {
        public static GameDatabase Load() => GameDatabase.FromJson(name =>
        {
            string path = "Redhood/Data/" + Path.GetFileNameWithoutExtension(name);
            TextAsset asset = Resources.Load<TextAsset>(path);
            if (asset == null)
                throw new FileNotFoundException("Run REDHOOD > Sync source assets. Missing: " + path);
            return asset.text;
        });
    }
}
