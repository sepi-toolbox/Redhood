extends SceneTree
## 골든 벡터 대조 — JS(js/yahtzee.js)의 결과를 진실로 삼아 GDScript 포팅을 검증한다
## 실행: Godot --headless --path godot -s tests/run_tests.gd
func _init():
	var db := GameDB.load_all()
	var golden = GameDB.load_json("res://tests/golden_yahtzee.json")
	var cat_by_id := {}
	for c in db.scoring.categories:
		cat_by_id[c.id] = c
	var fails := 0
	var n := 0
	for tc in golden.eval:
		n += 1
		var zeroed := {}
		for z in tc.zeroed: zeroed[int(z)] = true
		var ev := Yahtzee.eval_category(cat_by_id[tc.cat], tc.faces, zeroed)
		var contrib: Array = ev.contributing.duplicate()
		contrib.sort()
		var want: Array = tc.contributing.map(func(x): return int(x))
		var got: Array = contrib.map(func(x): return int(x))
		if ev.valid != tc.valid or int(ev.base) != int(tc.base) or got != want:
			fails += 1
			if fails <= 5:
				print("EVAL FAIL #", n, " cat=", tc.cat, " faces=", tc.faces,
					" got=", ev, " want base=", tc.base, " valid=", tc.valid, " contrib=", want)
	for tc in golden.damage:
		n += 1
		var defs := []
		for g in tc.gold:
			defs.append(db.dice_by_id["gold"] if g else db.dice_by_id["normal"])
		var relics := []
		for rid in tc.relics:
			relics.append(db.relic_by_id[rid])
		var bd := Yahtzee.compute_damage(cat_by_id[tc.cat], tc.faces, defs, relics, db.scoring,
			null, { "whet": int(tc.whet), "hpRatio": float(tc.hpRatio) })
		if int(bd.total) != int(tc.total) or bd.valid != tc.valid:
			fails += 1
			if fails <= 5:
				print("DMG FAIL cat=", tc.cat, " faces=", tc.faces, " got=", bd.total, " want=", tc.total)
	print("골든 대조 ", n, "건 · 실패 ", fails)
	quit(0 if fails == 0 else 1)
