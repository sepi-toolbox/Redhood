# REDHOOD 배경음 프롬프트 — v2 (복사용)

Suno · Udio · ElevenLabs Music · Stable Audio 같은 생성 도구에 그대로 넣는 프롬프트입니다.

**v2 변경**: 정예 전투를 막별 3곡으로 나누고, 보스는 9마리 + 최종 보스까지 **각자 전용 테마**를 갖도록 했습니다.

---

## 먼저 알아둘 것

**가사 없는 연주곡만 씁니다.** 모든 프롬프트에 `instrumental, no vocals` 를 넣었습니다. 게임 중에 사람 목소리가 나오면 대사와 싸웁니다. 예외는 안개의 어머니와 거짓 성인인데, 이 둘도 **가사 없는 모음 발성**으로만 지정했습니다.

**끊김 없이 도는 게 생명입니다.** 프롬프트마다 `seamless loop, no fade in, no fade out` 을 넣었지만 생성 도구가 완벽히 지키지는 못합니다. 받으신 뒤 저에게 주시면 앞뒤를 잘라 이음매를 맞춰드리겠습니다.

**용량을 반드시 계산하고 가야 합니다.** 곡이 21개로 늘었습니다. 곡당 500KB면 10MB가 넘어서 지금 게임 전체(6.5MB)보다 무거워집니다. 그래서 두 가지를 권합니다.

첫째, **보스곡은 60초로 짧게** 뽑으세요. 보스전은 어차피 긴장 상태라 반복이 덜 거슬립니다.

둘째, **음악은 나중에 따로 받아오게** 만들겠습니다. 게임은 먼저 뜨고 음악은 뒤에서 조용히 채워지는 방식입니다. 그러면 첫 로딩이 안 느려집니다. 보스곡은 그 보스를 만나기 직전에만 받아오면 되고요.

**게임 톤은 다크 페어리테일입니다.** 웅장한 오케스트라가 아니라 낡은 악기 몇 개가 조심스럽게 연주하는 느낌입니다. 그래서 전부 **소편성**으로 잡았습니다. 보스곡만 예외적으로 크게 가도 됩니다.

---

## 만드는 순서 제안

21곡을 한 번에 뽑으면 지칩니다. 세 단계로 나누시길 권합니다.

**1단계 — 이것만 있어도 게임이 굴러갑니다 (4곡)**
`bgm_title` · `bgm_map` · `bgm_battle1` · `bgm_boss_wolf`

전투는 막 구분 없이 하나로 돌리고, 보스는 전부 늑대 테마를 쓰고, 만남·상점·휴식은 지도 음악으로 때웁니다.

**2단계 — 판이 확실히 살아납니다 (+7곡)**
`bgm_battle2` `bgm_battle3` `bgm_elite1` `bgm_rest` `bgm_shop` `bgm_event` + 스팅어 3종

**3단계 — 보스마다 얼굴이 생깁니다 (+10곡)**
나머지 보스 테마 9곡 + `bgm_final`

코드는 단계마다 안 바뀝니다. 파일이 없으면 자동으로 윗단계 곡으로 대체됩니다.

---

# 공용 곡

## 타이틀 — `bgm_title`

*로비. 게임을 켜자마자 나오는 첫인상. 최종전에서 이 선율이 부서진 형태로 다시 나옵니다.*

```
Dark fairytale music box lullaby, instrumental, no vocals. Sparse and haunting: a slightly out-of-tune music box carrying a simple minor melody, answered by a lone cello and a distant creaking wooden sound. Slow, around 62 BPM, minor key, lots of silence between phrases. Old and lonely, like a nursery rhyme remembered wrong. Low fidelity, close and intimate, no big orchestra, no percussion. Seamless loop, no fade in, no fade out. 75 seconds.
```

## 지도 — `bgm_map`

*양피지 지도를 보며 다음 길을 고르는 순간.*

```
Dark fairytale exploration ambience, instrumental, no vocals. A slow fingerpicked nylon guitar figure over a low sustained drone, a few soft hammered dulcimer notes, faint wind and distant crows. Around 70 BPM, minor key, gentle and unresolved, never arriving. Calm but watchful, the feeling of standing at a crossroads in a dark wood. Small ensemble, no drums, no brass. Seamless loop, no fade in, no fade out. 80 seconds.
```

## 만남 — `bgm_event`

```
Dark fairytale encounter music, instrumental, no vocals. A single hurdy-gurdy drone with a slow simple melody on a wooden flute, occasional plucked lute notes, very sparse. Around 66 BPM, minor key, curious and slightly wary. Quiet enough to read dialogue over — nothing sudden, nothing loud. Small acoustic ensemble, no drums. Seamless loop, no fade in, no fade out. 60 seconds.
```

## 상점 — `bgm_shop`

*잿빛 방물장수의 가게. 유일하게 조금 익살스러워도 되는 곳.*

```
Dark fairytale merchant shop music, instrumental, no vocals. A lopsided waltz on a wheezy accordion and pizzicato strings, small bells and coin-like metallic clinks on the offbeats, a bassoon walking underneath. Around 96 BPM in 3/4, minor key with a mischievous lilt. Shabby, crooked and a little funny — this merchant is not to be trusted. Small acoustic ensemble, no drums. Seamless loop, no fade in, no fade out. 60 seconds.
```

## 휴식 — `bgm_rest`

*모닥불. 숨 돌리는 유일한 순간.*

```
Dark fairytale campfire music, instrumental, no vocals. A warm slow melody on solo nylon guitar with a soft cello holding long notes underneath, gentle crackling fire in the background, very few notes. Around 58 BPM, minor key resolving briefly to major, the only warm moment in the score. Intimate and tired. No drums, no build. Seamless loop, no fade in, no fade out. 60 seconds.
```

---

# 일반 전투 — 막별 3곡

## 1막 — `bgm_battle1`

*깊은 숲·개울·오두막. 아직은 감당할 만한 위협.*

```
Dark fairytale battle music, instrumental, no vocals. A driving low cello ostinato with a hand drum keeping a steady pulse, a sharp fiddle motif cutting in every few bars, tambourine accents. Around 108 BPM, minor key, tense and rhythmic but not epic. Folk instruments only — no synths, no orchestral brass, no choir. Menacing and small-scale, like a chase through trees. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 2막 — `bgm_battle2`

*늪·안개숲·무덤가. 더 축축하고 더 무겁게.*

```
Dark fairytale battle music, instrumental, no vocals. A heavy detuned double bass ostinato, a low frame drum on a dragging beat, a bowed musical saw wailing thinly over the top, dry bone-like wooden clicks. Around 100 BPM, minor key, swampy and oppressive, slightly out of tune on purpose. Folk and acoustic only, no synths, no brass. Heavier and sicker than an ordinary fight. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 3막 — `bgm_battle3`

*꿈·언덕·교회. 현실이 어긋나기 시작한다.*

```
Dark fairytale battle music, instrumental, no vocals. An unstable ostinato in an odd meter played on prepared piano and plucked strings, a bowed glass harmonica shimmer drifting slightly out of pitch, irregular hand percussion. Around 116 BPM, minor key, dissonant and dreamlike, the pulse never quite settling. Acoustic and unsettling, no synths, no brass, no choir. Like a fight inside a dream that keeps changing. Seamless loop, no fade in, no fade out. 70 seconds.
```

---

# 정예 전투 — 막별 3곡

일반 전투와 같은 악기 계열을 쓰되 **한 단계씩 더 조입니다.** 같은 막의 일반 전투곡과 나란히 들었을 때 "아, 이건 다르다"가 즉시 와야 합니다.

## 1막 정예 — `bgm_elite1`

*우두머리 들개·늙은 강꼬치·지하실의 무언가. 사냥당하는 쪽이 바뀐 순간.*

```
Dark fairytale elite battle music, instrumental, no vocals. A relentless low cello ostinato with a war drum pounding in half time, a solo fiddle playing a sharp angular motif over it, iron chain rattles and anvil hits on the accents. Around 124 BPM, minor key, driving and dangerous, building pressure without ever releasing. Folk instruments only, no synths, no orchestral brass. Same instrument family as an ordinary forest fight but faster, harder and more predatory. Seamless loop, no fade in, no fade out. 65 seconds.
```

## 2막 정예 — `bgm_elite2`

*진흙 골렘·목 없는 기사·무덤지기. 도망칠 수 없게 조여드는.*

```
Dark fairytale elite battle music, instrumental, no vocals. A grinding detuned double bass ostinato under a heavy frame drum on an off-kilter beat, a bowed musical saw sliding upward in long menacing swells, dull iron clanks and dragging chain sounds. Around 112 BPM, minor key, thick and suffocating, the tempo feeling slightly too slow to escape. Acoustic and folk only, no synths, no brass. Heavier and more inevitable than an ordinary swamp fight. Seamless loop, no fade in, no fade out. 65 seconds.
```

## 3막 정예 — `bgm_elite3`

*모래 사나이·언덕의 촉수·종지기. 규칙이 무너진 싸움.*

```
Dark fairytale elite battle music, instrumental, no vocals. A jittery ostinato in a shifting odd meter on prepared piano and hammered strings, a glass harmonica shrieking in dissonant clusters, irregular scattered percussion that keeps losing the beat. Around 128 BPM, minor key, nervous and hostile, never letting the listener settle into the rhythm. Acoustic and unsettling, no synths, no brass. More frantic and more broken than an ordinary dream fight. Seamless loop, no fade in, no fade out. 65 seconds.
```

---

# 보스 테마 — 9마리 + 최종

각 보스의 성격을 악기로 씁니다. **공통 규칙은 60~70초, 몰아치기보다 무게**입니다.

## 1막

### 늑대 — `bgm_boss_wolf`

*깊은 숲. 짐승의 추격. 순수한 속도와 이빨.*

```
Dark fairytale boss battle music, instrumental, no vocals. A galloping low string ostinato at a relentless pace, a big war drum in a running double pulse, a shrill fiddle screaming a hunting motif, distant wolf-like howls made by bowed strings sliding upward. Around 132 BPM, minor key, a pure predatory chase — fast, lean and merciless, no grandeur. Folk instruments only, no synths, no choir. Seamless loop, no fade in, no fade out. 65 seconds.
```

### 다리 밑 트롤 — `bgm_boss_river_hag`

*차가운 개울. 바위처럼 느리고 무겁게.*

```
Dark fairytale boss battle music, instrumental, no vocals. A very slow crushing ostinato on the lowest strings, a huge deep drum landing like a boulder every two bars, dripping water sounds and hollow wooden knocks from a bridge, a low bowed drone underneath. Around 76 BPM, minor key, enormously heavy and slow — the sound of something that does not need to hurry. Acoustic only, no synths. Seamless loop, no fade in, no fade out. 65 seconds.
```

### 낡은 곰인형 — `bgm_boss_old_teddy`

*빈 오두막. 자장가가 잘못 감긴 소리.*

```
Dark fairytale boss battle music, instrumental, no vocals. A children's lullaby played on a broken music box that keeps slipping out of tempo, joined by a groaning cello and a wind-up toy mechanism clicking irregularly, a hand drum entering late and heavy. Around 88 BPM, minor key, sweet melody turned wrong and menacing. Small acoustic ensemble, no synths, no choir. Nursery innocence rotting from the inside. Seamless loop, no fade in, no fade out. 65 seconds.
```

## 2막

### 늪의 왕 — `bgm_boss_swamp_king`

*가라앉는 늪지. 진창 위에 앉은 왕좌.*

```
Dark fairytale boss battle music, instrumental, no vocals. A slow regal ostinato on low strings with a heavy processional drum, a solo bassoon carrying a lumbering royal motif, thick bubbling swamp sounds and reed rattles underneath. Around 84 BPM, minor key, majestic and filthy at the same time — a crowned thing dragging itself through mud. Acoustic folk and low woodwinds, no synths, no choir. Seamless loop, no fade in, no fade out. 65 seconds.
```

### 안개의 어머니 — `bgm_boss_fog_mother`

*안개 낀 숲. 부드러워서 더 무서운.*

```
Dark fairytale boss battle music, instrumental, no lyrics. A slow drifting lullaby on bowed strings with no clear beat, wordless breathy female vowel tones layered far in the background like fog, a soft heartbeat drum barely audible, occasional glass harmonica shimmer. Around 68 BPM, minor key, tender and utterly wrong — comfort that means to smother. No words, only open vowel sounds. Quiet and enveloping rather than loud. Seamless loop, no fade in, no fade out. 70 seconds.
```

### 파묻힌 자 — `bgm_boss_the_buried`

*이름 없는 무덤가. 흙 밑에서 올라오는 것.*

```
Dark fairytale boss battle music, instrumental, no vocals. A low earthen drone with a slow shovel-like scraping rhythm, a deep drum striking like packed soil, a single cracked funeral bell tolling every four bars, dry root-snapping wooden sounds. Around 80 BPM, minor key, buried and rising — the sound of something pushing up through the ground. Acoustic only, no synths, no choir. Seamless loop, no fade in, no fade out. 65 seconds.
```

## 3막

### 자각몽의 왕 — `bgm_boss_lucid_king`

*꿈속. 규칙이 매번 바뀌는 왈츠.*

```
Dark fairytale boss battle music, instrumental, no vocals. A grand waltz on strings and prepared piano that keeps changing key and meter without warning, melting between 3/4 and 5/4, a stately drum trying to hold it together and failing. Around 104 BPM, minor key, regal and impossible — a coronation dream that rewrites itself as it plays. Acoustic and dreamlike, no synths, no choir. Seamless loop, no fade in, no fade out. 70 seconds.
```

### 벌어진 아가리 — `bgm_boss_the_maw`

*비명 지르는 언덕. 아래에서 들리는 것.*

```
Dark fairytale boss battle music, instrumental, no vocals. A vast subsonic drone under slow dissonant string clusters, an enormous slow drum like something chewing, groaning stone and deep hollow wind rising out of a pit, no melody at all for long stretches. Around 72 BPM, atonal and abyssal, pure dread and pressure. Acoustic textures and deep low end, no synths, no choir. Seamless loop, no fade in, no fade out. 70 seconds.
```

### 거짓 성인 — `bgm_boss_false_saint`

*사람 없는 교회. 성스러운 척하는 것.*

```
Dark fairytale boss battle music, instrumental, no lyrics. A church pipe organ playing a slow hymn that is subtly out of tune, wordless distant vowel voices holding chords behind it like a choir heard through a wall, a cracked bell on the downbeats, low strings swelling underneath. Around 90 BPM, minor key, sacred and false — holy music that has gone rotten. No words, only open vowel sounds. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 최종전

### 이름 없는 공포 — `bgm_final`

*이길 수 없는 싸움. 타이틀 선율이 부서진 채 돌아온다.*

```
Dark fairytale final battle music, instrumental, no vocals. A vast low drone that slowly rises in pitch, a war drum in a slow inevitable pulse, dissonant string clusters swelling and receding, and underneath it all a simple music box melody from the title theme playing broken, slowed and out of tune. Around 84 BPM, minor key, dread rather than excitement, endless and unresolved. No release, no triumphant section. Seamless loop, no fade in, no fade out. 90 seconds.
```

> 최종전 곡을 만들 때 **타이틀 곡을 참조 오디오로 같이 넣으면** 선율이 실제로 이어집니다. 도구가 참조 업로드를 지원하면 꼭 쓰세요. 이 한 수가 엔딩의 무게를 크게 바꿉니다.

---

# 짧은 효과음 (스팅어) — 루프 아님

### 승리 — `sting_victory`
```
Short dark fairytale victory sting, instrumental, no vocals. Three rising notes on a music box answered by a single warm cello note and a soft bell. Minor key resolving to major. Relieved rather than triumphant. Dry, close, no reverb tail beyond one second. 3 seconds, no loop.
```

### 패배 — `sting_defeat`
```
Short dark fairytale defeat sting, instrumental, no vocals. A music box winding down and stopping mid-phrase, one low detuned cello note fading, a single distant bell. Minor key, unresolved. Quiet and final, not dramatic. 4 seconds, no loop.
```

### 유물 획득 — `sting_relic`
```
Short dark fairytale treasure sting, instrumental, no vocals. A soft golden shimmer of small bells and a plucked harp arpeggio rising, one warm sustained string note underneath. Bright but muted, old gold rather than sparkle. 2 seconds, no loop.
```

---

## 전체 목록 (21곡 + 스팅어 3)

| 구분 | 파일 |
|---|---|
| 공용 5 | `bgm_title` `bgm_map` `bgm_event` `bgm_shop` `bgm_rest` |
| 일반 전투 3 | `bgm_battle1` `bgm_battle2` `bgm_battle3` |
| 정예 3 | `bgm_elite1` `bgm_elite2` `bgm_elite3` |
| 1막 보스 3 | `bgm_boss_wolf` `bgm_boss_river_hag` `bgm_boss_old_teddy` |
| 2막 보스 3 | `bgm_boss_swamp_king` `bgm_boss_fog_mother` `bgm_boss_the_buried` |
| 3막 보스 3 | `bgm_boss_lucid_king` `bgm_boss_the_maw` `bgm_boss_false_saint` |
| 최종 1 | `bgm_final` |
| 스팅어 3 | `sting_victory` `sting_defeat` `sting_relic` |

---

## 연동 계획 (아직 코드 없음)

받으신 파일을 주시면 이렇게 붙이겠습니다.

파일은 `assets/bgm/{id}.ogg` 와 `.mp3` 두 벌로 둡니다. iOS 사파리가 OGG를 못 읽는 경우가 있어서 MP3 폴백이 필요합니다.

**없는 곡은 자동으로 대체됩니다.** 보스 전용 곡이 없으면 그 막의 일반 전투곡을, 그것도 없으면 1막 전투곡을 씁니다. 그래서 한 곡씩 올려도 게임이 안 깨집니다.

화면이 바뀔 때 곡이 **1초에 걸쳐 크로스페이드**됩니다. 뚝 끊기면 싸구려로 들립니다. 전투에서 전리품, 지도로 넘어갈 때 같은 곡이면 끊지 않고 이어갑니다.

**음악은 게임과 따로 받아옵니다.** 곡이 21개라 한꺼번에 받으면 첫 로딩이 느려집니다. 게임은 먼저 뜨고 음악은 뒤에서 채워지며, 보스곡은 지도에서 보스 노드로 향할 때 미리 받아둡니다.

**음소거 버튼을 로비와 지도 헤더에 답니다.** 설정은 저장됩니다. 모바일 브라우저는 사용자가 화면을 한 번 터치하기 전에는 소리를 못 냅니다. 그래서 첫 곡은 "숲으로 들어간다"를 누르는 순간 시작합니다.
