class_name GameDB
## game_db.gd — data/*.json 로더. 원본 JSON을 그대로 읽는다 (데이터 매니저 파이프라인 유지).
static func load_json(path: String):
	var f := FileAccess.open(path, FileAccess.READ)
	assert(f != null, "데이터 없음: " + path)
	var parsed = JSON.parse_string(f.get_as_text())
	assert(parsed != null, "JSON 파싱 실패: " + path)
	return parsed

static func load_all(base := "res://data/") -> Dictionary:
	var db := {}
	for name in ["dice", "relics", "scoring", "enemies", "act1", "events", "acts", "statuses", "cards", "layout"]:
		db[name] = load_json(base + name + ".json")
	db["dice_by_id"] = {}
	for d in db.dice: db.dice_by_id[d.id] = d
	db["relic_by_id"] = {}
	for r in db.relics: db.relic_by_id[r.id] = r
	db["enemy_by_id"] = {}
	for e in db.enemies: db.enemy_by_id[e.id] = e
	db["status_by_id"] = {}
	for s in db.statuses.list: db.status_by_id[s.id] = s
	return db
