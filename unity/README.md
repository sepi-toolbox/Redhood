# REDHOOD — Unity port

This folder contains the Unity client port. The web client remains untouched and
`../data/*.json` remains the authoritative game database.

## Baseline

- Unity 6 LTS (`6000.0`)
- Portrait reference resolution: `390 x 844`
- Newtonsoft Json for the existing polymorphic JSON data
- EditMode tests for the pure C# scoring and battle-domain code

## Open the project

1. In Unity Hub, add the `unity` folder as a project.
2. Open it with Unity 6 LTS.
3. Run EditMode tests from **Window > General > Test Runner**.

In the Editor, data is read directly from the repository's top-level `data`
folder. Before a player build, `RedhoodDataBuildProcessor` copies the same JSON
files into `Assets/StreamingAssets/Data`; generated copies are git-ignored.

## First milestone

The first milestone deliberately contains no final presentation layer. It ports
the deterministic rules first:

- five dice, hold/unhold, and two rerolls;
- all eight scoring categories;
- gold/split dice and relic damage hooks;
- whet multiplier;
- a minimal enemy HP loop;
- all 450 existing JS golden vectors, plus focused regression tests for the
  highest-risk scoring cases.

Next: connect `BattleSession` to the portrait battle UI and replace the fixed
prototype enemy with an entry loaded from `enemies.json`.
