class_name Yahtzee
## yahtzee.gd — 족보 판정·점수 계산 (js/yahtzee.js 의 GDScript 포팅 · 순수 함수)
## 데이터(scoring.json)는 원본 JSON 그대로 쓴다 — 진실은 언제나 data/*.json 하나.
## 검증: godot --headless -s tests/run_tests.gd  (JS 골든 벡터 450건 대조)

## faces: 현재 눈 배열(5), zeroed: 합산에서 0으로 치는 슬롯(기절·굳음)
## faces[i] == 0 인 슬롯(봉인)은 아예 없는 것으로 친다.
## 반환: { "valid": bool, "base": int, "contributing": Array[int] }
static func eval_category(cat: Dictionary, faces: Array, zeroed = null) -> Dictionary:
	var n := faces.size()
	var all: Array[int] = []
	for i in n:
		if int(faces[i]) > 0:
			all.append(i)
	var counts := {}
	for i in all:
		var f := int(faces[i])
		counts[f] = int(counts.get(f, 0)) + 1

	var kind: String = cat.get("kind", "")
	match kind:
		"upper":
			var idx: Array[int] = []
			var base := 0
			for i in all:
				if int(faces[i]) == int(cat.get("face", 0)):
					idx.append(i)
					base += _val(faces, zeroed, i)
			return { "valid": true, "base": base, "contributing": idx }

		"ofKind":
			var need := int(cat.get("count", 0))
			var ok := false
			for c in counts.values():
				if int(c) >= need:
					ok = true
			if not ok:
				return _fail()
			var score = cat.get("score", 0)
			if score is String and (score == "matchedSumX2" or score == "matchedSum"):
				var mult: float = 2.0 if score == "matchedSumX2" else float(cat.get("mult", 1))
				var face := -1
				for f in counts.keys():
					if int(counts[f]) >= need and int(f) > face:
						face = int(f)
				var idx: Array[int] = []
				var s := 0
				for i in all:
					if int(faces[i]) == face:
						idx.append(i)
						s += _val(faces, zeroed, i)
				return { "valid": true, "base": int(floor(s * mult)), "contributing": idx }
			var base := 0
			if score is String and score == "sumAll":
				for i in all:
					base += _val(faces, zeroed, i)
			else:
				base = int(score)
			return { "valid": true, "base": base, "contributing": all }

		"twoPair":
			var pair_faces: Array[int] = []
			for f in counts.keys():
				if int(counts[f]) >= 2:
					pair_faces.append(int(f))
			pair_faces.sort()
			pair_faces.reverse()
			if pair_faces.size() < 2:
				return _fail()
			pair_faces = pair_faces.slice(0, 2)
			var idx: Array[int] = []
			var s := 0
			for f in pair_faces:
				var need2 := 2
				for i in all:
					if int(faces[i]) == f and need2 > 0:
						idx.append(i)
						s += _val(faces, zeroed, i)
						need2 -= 1
			var mult: float = float(cat.get("mult", 1))
			return { "valid": true, "base": int(floor(s * mult)), "contributing": idx }

		"fullHouse":
			var cs: Array[int] = []
			for c in counts.values():
				cs.append(int(c))
			cs.sort()
			var ok := (cs.size() == 2 and cs[0] == 2 and cs[1] == 3) or (cs.size() >= 1 and cs[0] == 5)
			if not ok:
				return _fail()
			# v3.23: 고정 점수 대신 눈의 합 × 배수 (js/yahtzee.js 와 동일)
			var fscore = cat.get("score", 0)
			if fscore is String and fscore == "sumAll":
				var fs := 0
				for i in all:
					fs += _val(faces, zeroed, i)
				return { "valid": true, "base": int(floor(fs * float(cat.get("mult", 1)))), "contributing": all }
			return { "valid": true, "base": int(fscore), "contributing": all }

		"straight":
			var uniq_d := {}
			for f in faces:
				uniq_d[int(f)] = true
			var uniq: Array[int] = []
			for f in uniq_d.keys():
				uniq.append(int(f))
			uniq.sort()
			var run := 1
			var best := 1
			for i in range(1, uniq.size()):
				run = run + 1 if uniq[i] == uniq[i - 1] + 1 else 1
				best = max(best, run)
			if best >= int(cat.get("length", 5)):
				return { "valid": true, "base": int(cat.get("score", 0)), "contributing": all }
			return _fail()

		"chance":
			var score = cat.get("score", 0)
			if score is String and score == "highestDie":
				# 노페어: 가장 높은 눈 하나 — 언제나 성립하는 순수 보험
				var best_i := 0
				for i in all:
					if int(faces[i]) > int(faces[best_i]):
						best_i = i
				return { "valid": true, "base": int(faces[best_i]), "contributing": [best_i] }
			if score is String and score == "sumTop3Distinct":
				# 서로 다른 눈 중 높은 3개의 합 — 뭉칠수록 약해진다
				var order := all.duplicate()
				order.sort_custom(func(a, b): return int(faces[a]) > int(faces[b]) if int(faces[a]) != int(faces[b]) else a < b)
				var seen := {}
				var pick: Array[int] = []
				var s := 0
				for i in order:
					if seen.has(int(faces[i])):
						continue
					seen[int(faces[i])] = true
					pick.append(i)
					s += int(faces[i])
					if pick.size() == 3:
						break
				return { "valid": true, "base": s, "contributing": pick }
			if score is String and score == "sumTop3":
				var order := all.duplicate()
				order.sort_custom(func(a, b): return int(faces[a]) > int(faces[b]) if int(faces[a]) != int(faces[b]) else a < b)
				order = order.slice(0, 3)
				var s := 0
				for i in order:
					s += int(faces[i])
				return { "valid": true, "base": s, "contributing": order }
			var s := 0
			for f in faces:
				s += int(f)
			return { "valid": true, "base": s, "contributing": all }

	return _fail()

static func _val(faces: Array, zeroed, i: int) -> int:
	if zeroed != null and zeroed.has(i):
		return 0
	return int(faces[i])

static func _fail() -> Dictionary:
	return { "valid": false, "base": 0, "contributing": [] }

## ---------- 벼름 ----------
static func whet_step(scoring: Dictionary) -> float:
	return float(scoring.get("whetStep", 0.5))

static func whet_cap(scoring: Dictionary) -> int:
	return int(scoring.get("whetCap", 6))

static func whet_mult_of(whet: int, scoring: Dictionary) -> float:
	return 1.0 + min(whet, whet_cap(scoring)) * whet_step(scoring)

## 최종 피해 = floor((기본+금박+쪼개기) × Π배수 × 벼름배수) + Σ보너스 + Σ고정
## dice_defs: 각 슬롯의 dice.json 항목 / relics: relics.json 항목 배열
## opts: { "whet": int, "hpRatio": float }
static func compute_damage(cat: Dictionary, faces: Array, dice_defs: Array, relics: Array,
		scoring: Dictionary, zeroed = null, opts: Dictionary = {}) -> Dictionary:
	var ev := eval_category(cat, faces, zeroed)
	var gold := 0
	var split := 0
	for i in ev.contributing:
		var def = dice_defs[i] if i < dice_defs.size() else null
		if def == null:
			continue
		if def.get("gold", false):
			gold += int(faces[i])
		var eff = def.get("effect")
		if eff != null and eff.get("op", "") == "split" and cat.get("kind", "") == "ofKind":
			split += int(faces[i])
	var core: int = int(ev.base) + gold + split
	if not ev.valid or core == 0:
		return { "valid": ev.valid, "base": ev.base, "gold": 0, "split": 0, "mult": 1.0,
			"whetMult": 1.0, "bonus": 0, "flat": 0, "total": 0, "isZero": true }
	var mult := 1.0
	var bonus := 0
	var flat := 0
	var hp_ratio: float = float(opts.get("hpRatio", 1.0))
	for r in relics:
		var h: Dictionary = r.get("hook", {})
		var t: String = h.get("type", "")
		if t == "categoryMult" and h.get("category", "") == cat.get("id", ""):
			mult *= float(h.get("mult", 1))
		if t == "categoryBonus" and h.get("category", "") == cat.get("id", ""):
			bonus += int(h.get("bonus", 0))
		if t == "kindBonus" and h.get("kind", "") == cat.get("kind", ""):
			bonus += int(h.get("bonus", 0))
		if t == "aoeBonus" and cat.get("target", "") == "allEnemies":
			bonus += int(h.get("bonus", 0))
		if t == "flatDamage":
			flat += int(h.get("amount", 0))
		if t == "lowHpMult" and hp_ratio <= float(h.get("ratio", 0.34)):
			mult *= float(h.get("mult", 1))
	var whet_mult := whet_mult_of(int(opts.get("whet", 0)), scoring)
	var total: int = int(floor(core * mult * whet_mult)) + bonus + flat
	return { "valid": true, "base": ev.base, "gold": gold, "split": split, "mult": mult,
		"whetMult": whet_mult, "bonus": bonus, "flat": flat, "total": total, "isZero": false,
		"contributing": ev.contributing }
