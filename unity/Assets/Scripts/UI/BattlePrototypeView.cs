using System;
using System.Linq;
using Redhood.Battle;
using Redhood.Data;
using Redhood.Dice;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Redhood.UI
{
    public sealed class BattlePrototypeView : MonoBehaviour
    {
        private const float ReferenceWidth = 390f;
        private const float ReferenceHeight = 844f;

        private GameDatabase _database;
        private BattleSession _battle;
        private string _message = "주사위를 굴렸다.";
        private string _loadError;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Bootstrap()
        {
            if (SceneManager.GetActiveScene().name != "BattlePrototype" ||
                FindFirstObjectByType<BattlePrototypeView>() != null) return;
            new GameObject("BattlePrototypeView").AddComponent<BattlePrototypeView>();
        }

        private void Awake()
        {
            try
            {
                _database = GameDatabase.Load();
                DiceDefinition normal = _database.Die("normal");
                _battle = new BattleSession(_database.Scoring,
                    Enumerable.Repeat(normal, 5), enemyHp: 30);
            }
            catch (Exception exception)
            {
                _loadError = exception.Message;
                Debug.LogException(exception);
            }
        }

        private void OnGUI()
        {
            Matrix4x4 previous = GUI.matrix;
            float scale = Mathf.Min(Screen.width / ReferenceWidth, Screen.height / ReferenceHeight);
            float offsetX = (Screen.width - ReferenceWidth * scale) * 0.5f;
            GUI.matrix = Matrix4x4.TRS(new Vector3(offsetX, 0f), Quaternion.identity,
                new Vector3(scale, scale, 1f));

            GUILayout.BeginArea(new Rect(20f, 24f, 350f, 796f));
            GUILayout.Label("REDHOOD — UNITY RULES PROTOTYPE");
            if (_loadError != null)
            {
                GUILayout.Label("DATA LOAD FAILED\n" + _loadError);
                GUILayout.EndArea();
                GUI.matrix = previous;
                return;
            }

            GUILayout.Space(24f);
            GUILayout.Label(_battle.IsVictory ? "늑대 — 처치" : $"늑대 HP  {_battle.EnemyHp} / 30");
            GUILayout.Space(36f);

            GUILayout.BeginHorizontal();
            for (int i = 0; i < _battle.Faces.Length; i++)
            {
                int index = i;
                bool held = GUILayout.Toggle(IsHeld(index), $"{_battle.Faces[index]}\n보관",
                    GUI.skin.button, GUILayout.Width(66f), GUILayout.Height(72f));
                _held[index] = held;
                _battle.SetHeld(index, held);
            }
            GUILayout.EndHorizontal();

            GUILayout.Space(12f);
            GUI.enabled = !_battle.IsVictory && _battle.RerollsLeft > 0;
            if (GUILayout.Button($"다시 굴리기  ({_battle.RerollsLeft})", GUILayout.Height(44f)))
            {
                _battle.Reroll();
                _message = "보관하지 않은 주사위를 다시 굴렸다.";
            }
            GUI.enabled = true;

            GUILayout.Space(24f);
            GUILayout.Label("족보 선택");
            foreach (CategoryDefinition category in _database.Scoring.Categories)
            {
                CategoryResult preview = YahtzeeCalculator.Evaluate(category, _battle.Faces);
                GUI.enabled = !_battle.IsVictory && preview.Valid && preview.Base > 0;
                if (GUILayout.Button($"{category.Name}    {preview.Base}", GUILayout.Height(38f)))
                {
                    DamageResult result = _battle.Confirm(category);
                    _message = $"{category.Name}: {result.Total} 피해";
                    if (!_battle.IsVictory) StartNextTurn();
                }
            }
            GUI.enabled = true;

            GUILayout.Space(18f);
            GUILayout.Label(_message);
            if (_battle.IsVictory && GUILayout.Button("다시 시작", GUILayout.Height(44f)))
                Restart();
            GUILayout.EndArea();
            GUI.matrix = previous;
        }

        private readonly bool[] _held = new bool[5];
        private bool IsHeld(int index) => _held[index];

        private void StartNextTurn()
        {
            Array.Clear(_held, 0, _held.Length);
            _battle.BeginTurn();
        }

        private void Restart()
        {
            Array.Clear(_held, 0, _held.Length);
            _battle = new BattleSession(_database.Scoring,
                Enumerable.Repeat(_database.Die("normal"), 5), enemyHp: 30);
            _message = "새 전투를 시작했다.";
        }
    }
}
