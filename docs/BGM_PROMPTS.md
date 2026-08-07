# REDHOOD 배경음 프롬프트 (복사용)

Suno · Udio · ElevenLabs Music · Stable Audio 같은 생성 도구에 그대로 넣는 프롬프트입니다.

---

## 먼저 알아둘 것

**가사 없는 연주곡만 씁니다.** 모든 프롬프트에 `instrumental, no vocals` 를 넣었습니다. 게임 중에 사람 목소리가 나오면 대사와 싸웁니다. 예외는 교회 테마의 아득한 합창 정도인데, 이것도 가사 없는 모음 발성으로만 지정했습니다.

**끊김 없이 도는 게 생명입니다.** 전투 한 판이 5턴이면 2분쯤 걸리니, 루프가 티 나게 이어지면 금방 거슬립니다. 프롬프트마다 `seamless loop, no fade in, no fade out` 을 넣었지만 생성 도구가 이걸 완벽히 지키지는 못합니다. **받으신 뒤 저에게 주시면 앞뒤를 잘라 이음매를 맞추고 루프 지점을 잡아드리겠습니다.**

**용량이 제약입니다.** 지금 게임 전체가 6.5MB인데 음악 한 곡이 2MB씩 되면 배포가 무거워집니다. 그래서 곡당 **60~90초**로 짧게 만들고 반복시키는 쪽이 낫습니다. 받으면 OGG/MP3로 압축해서 곡당 400~700KB로 맞추겠습니다.

**게임 톤은 다크 페어리테일입니다.** 웅장한 오케스트라가 아니라, 낡은 악기 몇 개가 조심스럽게 연주하는 느낌이 아트와 맞습니다. 그래서 프롬프트를 전부 **소편성**으로 잡았습니다.

---

## 1. 타이틀 — `bgm_title`

*로비. 게임을 켜자마자 나오는 첫인상.*

```
Dark fairytale music box lullaby, instrumental, no vocals. Sparse and haunting: a slightly out-of-tune music box carrying a simple minor melody, answered by a lone cello and a distant creaking wooden sound. Slow, around 62 BPM, minor key, lots of silence between phrases. Old and lonely, like a nursery rhyme remembered wrong. Low fidelity, close and intimate, no big orchestra, no percussion. Seamless loop, no fade in, no fade out. 75 seconds.
```

## 2. 지도 — `bgm_map`

*양피지 지도를 보며 다음 길을 고르는 순간. 긴장은 있되 쉬어가는 곳.*

```
Dark fairytale exploration ambience, instrumental, no vocals. A slow fingerpicked nylon guitar figure over a low sustained drone, a few soft hammered dulcimer notes, faint wind and distant crows. Around 70 BPM, minor key, gentle and unresolved, never arriving. Calm but watchful, the feeling of standing at a crossroads in a dark wood. Small ensemble, no drums, no brass. Seamless loop, no fade in, no fade out. 80 seconds.
```

## 3. 1막 전투 — `bgm_battle1`

*깊은 숲·개울·오두막. 첫 막이라 아직은 감당할 만한 위협.*

```
Dark fairytale battle music, instrumental, no vocals. A driving low cello ostinato with a hand drum keeping a steady pulse, a sharp fiddle motif cutting in every few bars, tambourine accents. Around 108 BPM, minor key, tense and rhythmic but not epic. Folk instruments only — no synths, no orchestral brass, no choir. Menacing and small-scale, like a chase through trees. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 4. 2막 전투 — `bgm_battle2`

*늪·안개숲·무덤가. 더 축축하고 더 무겁게.*

```
Dark fairytale battle music, instrumental, no vocals. A heavy detuned double bass ostinato, a low frame drum on a dragging beat, a bowed saw or musical saw wailing thinly over the top, dry bone-like wooden clicks. Around 100 BPM, minor key, swampy and oppressive, slightly out of tune on purpose. Folk and acoustic only, no synths, no brass. Heavier and sicker than an ordinary fight. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 5. 3막 전투 — `bgm_battle3`

*꿈·언덕·교회. 현실이 어긋나기 시작한다.*

```
Dark fairytale battle music, instrumental, no vocals. An unstable ostinato in an odd meter played on prepared piano and plucked strings, a bowed glass harmonica shimmer drifting slightly out of pitch, irregular hand percussion. Around 116 BPM, minor key, dissonant and dreamlike, the pulse never quite settling. Acoustic and unsettling, no synths, no brass, no choir. Like a fight inside a dream that keeps changing. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 6. 정예 — `bgm_elite`

*정예 전투. 일반보다 확실히 조여드는.*

```
Dark fairytale elite battle music, instrumental, no vocals. A relentless low string ostinato with a war drum pounding in half time, a solo violin playing a sharp angular motif, iron chain and anvil hits on the accents. Around 124 BPM, minor key, driving and dangerous, building pressure without ever releasing. Acoustic folk instruments, no synths, no orchestral brass. Seamless loop, no fade in, no fade out. 70 seconds.
```

## 7. 보스 — `bgm_boss`

*막 보스. 유일하게 크게 가도 되는 곡.*

```
Dark fairytale boss battle music, instrumental, no vocals. A huge slow ostinato on low strings and a deep war drum, a lone shrill fiddle screaming above it, a cracked church bell tolling on the downbeats, wordless breathy vowel pads far in the background. Around 92 BPM, minor key, monumental and grim, weight over speed. Acoustic and orchestral folk, no synths. Overwhelming but not heroic — this is something that should not be fought. Seamless loop, no fade in, no fade out. 85 seconds.
```

## 8. 최종전 — `bgm_final`

*이름 없는 공포. 이길 수 없는 싸움.*

```
Dark fairytale final battle music, instrumental, no vocals. A vast low drone that slowly rises in pitch, a war drum in a slow inevitable pulse, dissonant string clusters swelling and receding, a single music box melody from the title theme appearing broken and slowed down underneath. Around 84 BPM, minor key, dread rather than excitement, endless and unresolved. No release, no triumphant section. Seamless loop, no fade in, no fade out. 90 seconds.
```

## 9. 만남 — `bgm_event`

*NPC 대화. 방물장수, 이정표, 제단.*

```
Dark fairytale encounter music, instrumental, no vocals. A single hurdy-gurdy drone with a slow simple melody on a wooden flute, occasional plucked lute notes, very sparse. Around 66 BPM, minor key, curious and slightly wary. Quiet enough to read dialogue over — nothing sudden, nothing loud. Small acoustic ensemble, no drums. Seamless loop, no fade in, no fade out. 60 seconds.
```

## 10. 상점 — `bgm_shop`

*잿빛 방물장수의 가게. 유일하게 조금 익살스러워도 되는 곳.*

```
Dark fairytale merchant shop music, instrumental, no vocals. A lopsided waltz on a wheezy accordion and pizzicato strings, small bells and coin-like metallic clinks on the offbeats, a bassoon walking underneath. Around 96 BPM in 3/4, minor key with a mischievous lilt. Shabby, crooked and a little funny — this merchant is not to be trusted. Small acoustic ensemble, no drums. Seamless loop, no fade in, no fade out. 60 seconds.
```

## 11. 휴식 — `bgm_rest`

*모닥불. 숨 돌리는 유일한 순간.*

```
Dark fairytale campfire music, instrumental, no vocals. A warm slow melody on solo nylon guitar with a soft cello holding long notes underneath, gentle crackling fire in the background, very few notes. Around 58 BPM, minor key resolving briefly to major, the only warm moment in the score. Intimate and tired. No drums, no build. Seamless loop, no fade in, no fade out. 60 seconds.
```

---

## 짧은 효과음 (스팅어) — 루프 아님

승리·패배·유물 획득 순간에 한 번만 울리는 짧은 음입니다. 루프 문구를 빼고 길이를 짧게 지정합니다.

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

## 곡 수를 줄이고 싶다면

11곡이 부담스러우면 이 4곡만으로도 게임이 굴러갑니다.

`bgm_title` · `bgm_map` · `bgm_battle1` · `bgm_boss`

전투는 막 구분 없이 한 곡으로 돌리고, 만남·상점·휴식은 지도 음악을 그대로 쓰면 됩니다. 나중에 하나씩 늘려도 코드는 안 바뀝니다.

---

## 연동 계획 (아직 코드 없음)

받으신 파일을 주시면 이렇게 붙이겠습니다.

파일은 `assets/bgm/{id}.ogg` 와 `.mp3` 두 벌로 둡니다. iOS 사파리가 OGG를 못 읽는 경우가 있어서 MP3 폴백이 필요합니다.

화면이 바뀔 때 곡이 **1초에 걸쳐 크로스페이드**되게 만들 겁니다. 뚝 끊기면 싸구려로 들립니다. 전투 → 전리품 → 지도로 넘어갈 때 같은 곡이면 끊지 않고 이어갑니다.

**음소거 버튼을 로비와 지도 헤더에 답니다.** 설정은 저장되고요. 모바일 브라우저는 사용자가 화면을 한 번 터치하기 전에는 소리를 못 냅니다. 그래서 첫 곡은 "숲으로 들어간다"를 누르는 순간 시작합니다.

용량이 걱정되면 배경음만 따로 받아오게 할 수도 있습니다. 게임은 먼저 뜨고 음악은 뒤에서 조용히 채워지는 방식입니다.
