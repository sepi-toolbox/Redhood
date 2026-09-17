using System;
using System.IO;
using Redhood.Data;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Redhood.Editor
{
    // Generated Resources work in Editor AND Android/WebGL; no filesystem reads in the player.
    [InitializeOnLoad]
    public sealed class RedhoodSourceAssets : IPreprocessBuildWithReport
    {
        private const string Destination = "Assets/Resources/Redhood";
        private static readonly string[] Art =
        {
            "bg/bg_forest.jpg", "enemies/wolf.png", "ui/logo.png", "ui/paper_row.png",
            "ui/btn_primary.png", "ui/die_pad.png", "ui/tex_cloth.jpg",
            "dice/normal1.png", "dice/normal2.png", "dice/normal3.png",
            "dice/normal4.png", "dice/normal5.png", "dice/normal6.png"
        };

        static RedhoodSourceAssets()
        {
            EditorApplication.delayCall += () =>
            {
                if (!EditorApplication.isPlayingOrWillChangePlaymode)
                {
                    try { Sync(); }
                    catch (Exception exception) { Debug.LogException(exception); }
                }
            };
            EditorApplication.playModeStateChanged += state =>
            {
                if (state == PlayModeStateChange.ExitingEditMode)
                {
                    try { Sync(); }
                    catch (Exception exception)
                    {
                        EditorApplication.isPlaying = false;
                        Debug.LogException(exception);
                    }
                }
            };
        }

        public int callbackOrder => 0;
        public void OnPreprocessBuild(BuildReport report) => Sync();

        [MenuItem("REDHOOD/Sync source assets")]
        public static void Sync()
        {
            string repository = Path.GetFullPath(Path.Combine(Application.dataPath, "../.."));
            // Validate before copying; never leave a partially valid database silently.
            GameDatabase.FromJson(name => File.ReadAllText(Path.Combine(repository, "data", name)));
            foreach (string name in GameDatabase.RequiredFiles)
                Copy(Path.Combine(repository, "data", name), Destination + "/Data/" + name);
            foreach (string name in Art)
                Copy(Path.Combine(repository, "assets", name), Destination + "/Art/" + name);
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            foreach (string name in Art)
            {
                string path = Destination + "/Art/" + name;
                if (!(AssetImporter.GetAtPath(path) is TextureImporter importer)) continue;
                bool transparent = name.EndsWith(".png", StringComparison.OrdinalIgnoreCase);
                if (importer.textureType == TextureImporterType.Default && !importer.mipmapEnabled &&
                    importer.alphaIsTransparency == transparent && importer.wrapMode == TextureWrapMode.Clamp &&
                    importer.textureCompression == TextureImporterCompression.Uncompressed) continue;
                importer.textureType = TextureImporterType.Default;
                importer.mipmapEnabled = false;
                importer.alphaIsTransparency = transparent;
                importer.wrapMode = TextureWrapMode.Clamp;
                importer.textureCompression = TextureImporterCompression.Uncompressed;
                importer.SaveAndReimport();
            }
        }

        [MenuItem("REDHOOD/Open battle prototype")]
        public static void Open()
        {
            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            Sync();
            EditorSceneManager.OpenScene("Assets/Scenes/BattlePrototype.unity");
        }

        private static void Copy(string source, string destination)
        {
            if (!File.Exists(source)) throw new BuildFailedException("Missing REDHOOD source: " + source);
            byte[] data = File.ReadAllBytes(source);
            if (File.Exists(destination) && System.Linq.Enumerable.SequenceEqual(data, File.ReadAllBytes(destination)))
                return;
            Directory.CreateDirectory(Path.GetDirectoryName(destination));
            File.WriteAllBytes(destination, data);
        }
    }
}
