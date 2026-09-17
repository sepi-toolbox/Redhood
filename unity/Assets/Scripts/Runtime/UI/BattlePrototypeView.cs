using System;
using System.Collections.Generic;
using Redhood.Battle;
using Redhood.Data;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace Redhood.UI
{
    // Real uGUI controls, imported art and a bundled Korean font. Not final production layout.
    public sealed class BattlePrototypeView : MonoBehaviour
    {
        private readonly Color _ivory = new Color(0.96f, 0.89f, 0.74f);
        private readonly Color _ink = new Color(0.18f, 0.12f, 0.09f);
        private GameDatabase _database;
        private BattleSession _battle;
        private Font _font;
        private RectTransform _safeArea;
        private RectTransform _page;
        private Text _enemyLabel, _turnLabel, _message, _rollLabel, _playerLabel, _intentLabel;
        private Image _hpFill;
        private Button _roll, _next;
        private readonly Button[] _diceButtons = new Button[5];
        private readonly RawImage[] _diceImages = new RawImage[5];
        private readonly Text[] _diceLabels = new Text[5];
        private readonly List<Button> _categories = new List<Button>();
        private readonly List<Text> _categoryLabels = new List<Text>();
        private string _selected;
        private Button _confirm;
        private Text _confirmLabel;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Bootstrap()
        {
            if (SceneManager.GetActiveScene().name != "BattlePrototype" ||
                FindFirstObjectByType<BattlePrototypeView>() != null) return;
            new GameObject("REDHOOD battle prototype").AddComponent<BattlePrototypeView>();
        }

        private void Awake()
        {
            CreateCanvas();
            try
            {
                _font = Resources.Load<Font>("Fonts/RedhoodUI");
                if (_font == null) throw new InvalidOperationException("Bundled Korean font is missing.");
                _database = RuntimeGameDatabase.Load();
                BuildScreen();
                Restart();
            }
            catch (Exception error)
            {
                Debug.LogException(error);
                if (_font == null) _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                Panel(_page, "Error panel", 10, 10, 370, 824, new Color(0.13f, 0.07f, 0.07f));
                Label(_page, "Load error", "Could not load REDHOOD.\nRun REDHOOD > Sync source assets.\n\n" +
                    error.Message, 28, 90, 334, 600, 18, _ivory);
            }
        }

        private void CreateCanvas()
        {
            var cameraObject = new GameObject("Background camera", typeof(Camera));
            cameraObject.transform.SetParent(transform, false);
            Camera camera = cameraObject.GetComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.045f, 0.045f, 0.04f);
            camera.cullingMask = 0;
            var canvasObject = new GameObject("Battle Canvas", typeof(RectTransform), typeof(Canvas),
                typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasObject.transform.SetParent(transform, false);
            canvasObject.GetComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390, 844);
            scaler.matchWidthOrHeight = 0.5f;
            _safeArea = new GameObject("Safe area", typeof(RectTransform)).GetComponent<RectTransform>();
            _safeArea.SetParent(canvasObject.transform, false);
            _page = new GameObject("Portrait page", typeof(RectTransform)).GetComponent<RectTransform>();
            _page.SetParent(_safeArea, false);
            _page.anchorMin = _page.anchorMax = _page.pivot = new Vector2(0.5f, 0.5f);
            _page.sizeDelta = new Vector2(390, 844);
            if (EventSystem.current == null)
            {
                var events = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
                events.transform.SetParent(transform, false);
            }
        }

        private void LateUpdate()
        {
            if (_safeArea == null || Screen.width <= 0 || Screen.height <= 0) return;
            Rect safe = Screen.safeArea;
            _safeArea.anchorMin = new Vector2(safe.xMin / Screen.width, safe.yMin / Screen.height);
            _safeArea.anchorMax = new Vector2(safe.xMax / Screen.width, safe.yMax / Screen.height);
            _safeArea.offsetMin = _safeArea.offsetMax = Vector2.zero;
            float scale = Mathf.Min(_safeArea.rect.width / 390f, _safeArea.rect.height / 844f);
            _page.localScale = Vector3.one * Mathf.Max(0.01f, scale);
        }

        private void BuildScreen()
        {
            RawImage background = Art(_page, "Forest", "bg/bg_forest", 0, 0, 390, 844);
            float croppedWidth = (390f / 844f) / ((float)background.texture.width / background.texture.height);
            background.uvRect = new Rect((1f - croppedWidth) * 0.5f, 0, croppedWidth, 1);
            Panel(_page, "Forest shade", 0, 0, 390, 844, new Color(0.03f, 0.05f, 0.04f, 0.48f));
            Art(_page, "Logo", "ui/logo", 121, 12, 148, 44, true);
            Label(_page, "Battle badge", "붉은 숲 · 늑대전", 20, 58, 350, 20, 12, _ivory, TextAnchor.MiddleCenter);
            _turnLabel = Label(_page, "Turn", "", 20, 87, 350, 22, 14, _ivory, TextAnchor.MiddleCenter);
            _playerLabel = Label(_page, "Player HP", "", 20, 109, 350, 22, 13, _ivory, TextAnchor.MiddleCenter);
            Art(_page, "Wolf", "enemies/wolf", 116, 132, 158, 134, true);
            _enemyLabel = Label(_page, "Enemy name", "", 20, 266, 350, 24, 16, _ivory, TextAnchor.MiddleCenter);
            Panel(_page, "HP track", 52, 294, 286, 8, new Color(0.08f, 0.06f, 0.05f));
            _hpFill = Panel(_page, "HP", 52, 294, 286, 8, new Color(0.68f, 0.13f, 0.14f));
            _intentLabel = Label(_page, "Enemy intent", "", 20, 306, 350, 38, 12, _ivory, TextAnchor.MiddleCenter);
            Panel(_page, "Bottom shade", 0, 350, 390, 494, new Color(0.045f, 0.04f, 0.035f, 0.94f));
            Label(_page, "Dice help", "탭한 주사위만 다시 굴립니다", 20, 361, 350, 20, 13, _ivory, TextAnchor.MiddleCenter);
            for (int i = 0; i < 5; i++)
            {
                int index = i;
                _diceButtons[i] = Clickable(_page, "Die " + (i + 1), 17 + i * 72, 390, 68, 81,
                    () => { _battle.SetHeld(index, !_battle.Held[index]); _selected = null; Refresh(); });
                _diceImages[i] = Art(_diceButtons[i].transform, "Face", "dice/normal1", 4, 0, 60, 60, true);
                _diceLabels[i] = Label(_diceButtons[i].transform, "Selection", "", 0, 58, 68, 30,
                    10, _ivory, TextAnchor.MiddleCenter);
            }
            _roll = PaperButton(_page, "Roll", "", 20, 481, 350, 43, Roll, out _rollLabel, true);
            Label(_page, "Categories heading", "족보 선택", 23, 536, 150, 20, 15, _ivory);
            Label(_page, "Damage heading", "예상 피해", 216, 536, 150, 20, 12, _ivory, TextAnchor.MiddleRight);
            for (int i = 0; i < _database.Scoring.Categories.Count; i++)
            {
                string id = _database.Scoring.Categories[i].Id;
                Button button = PaperButton(_page, id, "", 20 + (i % 2) * 179, 564 + (i / 2) * 38,
                    171, 33, () => { _selected = id; Refresh(); }, out Text label);
                _categories.Add(button);
                _categoryLabels.Add(label);
            }
            _confirm = PaperButton(_page, "Confirm", "", 20, 724, 350, 40, Confirm, out _confirmLabel, true);
            _next = PaperButton(_page, "Next", "적 행동 진행", 20, 724, 350, 40, NextTurn, out _, true);
            _message = Label(_page, "Feedback", "", 20, 772, 350, 27, 13, _ivory, TextAnchor.MiddleCenter);
            Label(_page, "Scope", "단일 전투 · 모든 기본 족보 개방 · 유물 / 변형 없음",
                12, 809, 366, 19, 10, new Color(0.64f, 0.61f, 0.53f), TextAnchor.MiddleCenter);
            PaperButton(_page, "Restart", "재시작", 298, 15, 76, 30, Restart, out _);
        }

        private void Restart()
        {
            _battle = new BattleSession(_database, "wolf");
            _selected = null;
            _message.text = "주사위를 굴려 시작하세요.";
            Refresh();
        }

        private void Roll()
        {
            if (_battle.Phase == BattlePhase.AwaitingRoll) _battle.InitialRoll();
            else if (!_battle.Reroll()) return;
            _selected = null;
            _message.text = _battle.IsDefeat ? "리롤 피해로 쓰러졌습니다." :
                _battle.LastPlayerHpLoss > 0 ? $"리롤 피해 -{_battle.LastPlayerHpLoss} HP" :
                "족보를 고르거나, 다시 굴릴 주사위를 탭하세요.";
            Refresh();
        }

        private void Confirm()
        {
            if (_selected == null || _battle.Phase != BattlePhase.Choosing) return;
            string name = _database.Category(_selected).Name;
            int damage = _battle.Confirm(_selected).Total;
            _message.text = _battle.IsDefeat ? "출혈로 쓰러졌습니다." :
                _battle.IsVictory ? $"승리! {name} · {damage} 피해" :
                $"{name} · {damage} 피해" + (_battle.LastPlayerHpLoss > 0 ? $" / 출혈 -{_battle.LastPlayerHpLoss} HP" : "");
            _selected = null;
            Refresh();
        }

        private void NextTurn()
        {
            _battle.NextTurn();
            _message.text = _battle.IsDefeat ? "늑대에게 쓰러졌습니다." :
                _battle.LastEnemyAction + (_battle.LastPlayerHpLoss > 0 ? $" · -{_battle.LastPlayerHpLoss} HP" : " · 행동 완료");
            Refresh();
        }

        private void Refresh()
        {
            bool choosing = _battle.Phase == BattlePhase.Choosing;
            _turnLabel.text = _battle.IsVictory ? "승리" : _battle.IsDefeat ? "패배" : $"TURN {_battle.Turn:00}";
            _playerLabel.text = $"내 체력 {_battle.PlayerHp} / {_battle.PlayerMaxHp}" +
                (_battle.RollTax > 0 ? $" · 리롤당 -{_battle.RollTax} HP ({_battle.RollTaxTurns}턴)" : "");
            _intentLabel.text = _battle.IsVictory || _battle.IsDefeat ? "전투 종료" : DescribeIntent();
            _enemyLabel.text = $"{_battle.EnemyName}    {_battle.EnemyHp} / {_battle.EnemyMaxHp}";
            _hpFill.rectTransform.sizeDelta = new Vector2(286f * _battle.EnemyHp / _battle.EnemyMaxHp, 8);
            for (int i = 0; i < 5; i++)
            {
                int face = _battle.Faces[i];
                _diceImages[i].texture = Texture("dice/normal" + Mathf.Max(1, face));
                _diceImages[i].color = new Color(1, 1, 1, face > 0 ? 1 : 0.2f);
                _diceButtons[i].interactable = choosing;
                _diceLabels[i].text = face == 0 ? "—" : _battle.Held[i] ? "유지" : "리롤 선택";
                if (_battle.BleedLeft[i] > 0) _diceLabels[i].text += $"\n출혈 {_battle.BleedLeft[i]}턴";
                _diceLabels[i].color = _battle.Held[i] ? _ivory : new Color(1f, 0.55f, 0.35f);
            }
            _roll.interactable = _battle.Phase == BattlePhase.AwaitingRoll || _battle.CanReroll;
            _rollLabel.text = _battle.Phase == BattlePhase.AwaitingRoll ? "주사위 굴리기" :
                $"선택한 주사위 다시 굴리기 · {_battle.RerollsLeft}회";
            for (int i = 0; i < _categories.Count; i++)
            {
                CategoryDefinition category = _database.Scoring.Categories[i];
                int damage = choosing ? _battle.Preview(category.Id).Total : 0;
                _categories[i].interactable = choosing && damage > 0;
                string marker = category.Id == _selected ? "› " : "";
                _categoryLabels[i].text = marker + category.Name + (damage > 0 ? $"   {damage}" : "   —");
            }
            _confirm.gameObject.SetActive(_battle.Phase != BattlePhase.EnemyTurn);
            _confirm.interactable = choosing && _selected != null;
            _confirmLabel.text = _battle.IsVictory ? "승리 · 우측 상단에서 재시작" :
                _battle.IsDefeat ? "패배 · 우측 상단에서 재시작" :
                _selected == null ? "족보를 선택하세요" : _database.Category(_selected).Name + " 확정";
            if (choosing && _selected != null && _battle.PreviewBleedCost(_selected) > 0)
                _confirmLabel.text += $" · 출혈 -{_battle.PreviewBleedCost(_selected)} HP";
            _next.gameObject.SetActive(_battle.Phase == BattlePhase.EnemyTurn);
        }

        private string DescribeIntent()
        {
            if (_battle.Intent.Hidden) return "예고 · 알 수 없는 행동";
            var parts = new List<string>();
            foreach (EnemyEffect effect in _battle.Intent.Effects)
            {
                switch (effect.Op)
                {
                    case "damage": parts.Add($"공격 {Math.Max(0, effect.Amount + _battle.EnemyStrength)} × {Math.Max(1, effect.Hits)}"); break;
                    case "strength": parts.Add($"힘 +{effect.Amount}"); break;
                    case "status": parts.Add($"주사위 {effect.Amount}개에 출혈"); break;
                    case "rollTax": parts.Add($"리롤당 {effect.Amount} 피해"); break;
                    case "block": parts.Add($"방어 {effect.Amount}"); break;
                    case "rest": parts.Add("휴식"); break;
                }
            }
            return $"예고 · {_battle.Intent.Name}\n{string.Join(" / ", parts)}";
        }

        private RectTransform RectAt(Transform parent, string name, float x, float y, float width, float height)
        {
            var rect = new GameObject(name, typeof(RectTransform)).GetComponent<RectTransform>();
            rect.SetParent(parent, false);
            rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0, 1);
            rect.anchoredPosition = new Vector2(x, -y);
            rect.sizeDelta = new Vector2(width, height);
            return rect;
        }

        private Image Panel(Transform parent, string name, float x, float y, float w, float h, Color color)
        {
            Image image = RectAt(parent, name, x, y, w, h).gameObject.AddComponent<Image>();
            image.color = color;
            image.raycastTarget = false;
            return image;
        }

        private Text Label(Transform parent, string name, string value, float x, float y, float w, float h,
            int size, Color color, TextAnchor alignment = TextAnchor.MiddleLeft)
        {
            Text label = RectAt(parent, name, x, y, w, h).gameObject.AddComponent<Text>();
            label.font = _font;
            label.fontSize = size;
            label.text = value;
            label.color = color;
            label.alignment = alignment;
            label.raycastTarget = false;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            return label;
        }

        private RawImage Art(Transform parent, string name, string path, float x, float y, float w, float h, bool fit = false)
        {
            Texture2D texture = Texture(path);
            if (fit)
            {
                float scale = Mathf.Min(w / texture.width, h / texture.height);
                float width = texture.width * scale, height = texture.height * scale;
                x += (w - width) / 2f; y += (h - height) / 2f; w = width; h = height;
            }
            RawImage image = RectAt(parent, name, x, y, w, h).gameObject.AddComponent<RawImage>();
            image.texture = texture;
            image.raycastTarget = false;
            return image;
        }

        private static Texture2D Texture(string path) =>
            Resources.Load<Texture2D>("Redhood/Art/" + path)
            ?? throw new InvalidOperationException("Missing art: " + path);

        private Button Clickable(Transform parent, string name, float x, float y, float w, float h, Action click)
        {
            Image target = Panel(parent, name, x, y, w, h, new Color(1, 1, 1, 0.025f));
            target.raycastTarget = true;
            Button button = target.gameObject.AddComponent<Button>();
            button.targetGraphic = target;
            button.onClick.AddListener(() => click());
            return button;
        }

        private Button PaperButton(Transform parent, string name, string caption, float x, float y,
            float w, float h, Action click, out Text label, bool primary = false)
        {
            RawImage art = Art(parent, name, primary ? "ui/btn_primary" : "ui/paper_row", x, y, w, h);
            art.raycastTarget = true;
            Button button = art.gameObject.AddComponent<Button>();
            button.targetGraphic = art;
            ColorBlock colors = button.colors;
            colors.disabledColor = new Color(0.38f, 0.38f, 0.38f, 0.8f);
            colors.pressedColor = new Color(0.8f, 0.7f, 0.55f);
            button.colors = colors;
            button.onClick.AddListener(() => click());
            label = Label(art.transform, "Label", caption, 5, 0, w - 10, h, 13,
                primary ? _ivory : _ink, TextAnchor.MiddleCenter);
            return button;
        }
    }
}
