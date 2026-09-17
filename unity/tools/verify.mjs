import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = {...process.env, REDHOOD_REPOSITORY: root, DOTNET_CLI_TELEMETRY_OPTOUT: '1'};
const dotnet = process.env.REDHOOD_DOTNET || 'dotnet';
function run(command, args) {
  const result = spawnSync(command, args, {cwd:root, env, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, ['unity/tools/asset-metadata.mjs', '--check']);
run(process.execPath, ['unity/tools/generate-golden.mjs', '--check',
  ...(process.argv.includes('--exhaustive') ? ['--exhaustive'] : [])]);
run(dotnet, ['build', 'unity/Tests/Headless/Redhood.Tests.csproj', '-c', 'Release', '--nologo']);
run(dotnet, ['unity/Tests/Headless/bin/Release/net8.0/Redhood.Tests.dll', '--workers=0', '--noresult']);
