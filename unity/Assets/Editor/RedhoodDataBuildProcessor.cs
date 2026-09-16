using System.IO;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Redhood.Editor
{
    public sealed class RedhoodDataBuildProcessor : IPreprocessBuildWithReport
    {
        public int callbackOrder => 0;

        public void OnPreprocessBuild(BuildReport report)
        {
            string source = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data"));
            string destination = Path.Combine(Application.streamingAssetsPath, "Data");
            if (!Directory.Exists(source))
                throw new BuildFailedException($"REDHOOD source data directory not found: {source}");

            Directory.CreateDirectory(destination);
            foreach (string sourceFile in Directory.GetFiles(source, "*.json", SearchOption.TopDirectoryOnly))
                File.Copy(sourceFile, Path.Combine(destination, Path.GetFileName(sourceFile)), true);
        }
    }
}
