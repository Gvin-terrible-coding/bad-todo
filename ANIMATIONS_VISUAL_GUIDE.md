# 🎬 Animation Visual Guide

## Quick Visual Reference

### 1. Attack Animation 🏃

```
PLAYER ATTACKS:
┌──────────────────────────────────────────────────────┐
│ Frame 0ms                                            │
│ [Player]         [Enemy]                             │
│   at X=250        at X=710                           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Frame 100ms (CHARGE)                                 │
│ [Player→]        [Enemy]                             │
│  at X=300        at X=710                            │
│  (moves +50px right)                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Frame 200ms (RETURN)                                 │
│ [Player]         [Enemy]                             │
│  at X=250        at X=710                            │
│  (back to original)                                  │
└──────────────────────────────────────────────────────┘

Duration: 200ms (100ms out + 100ms back)
Effect: Charge forward, then return (yoyo)
```

---

```
ENEMY ATTACKS:
┌──────────────────────────────────────────────────────┐
│ Frame 0ms                                            │
│ [Player]         [Enemy]                             │
│  at X=250        at X=710                            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Frame 100ms (CHARGE)                                 │
│ [Player]        ←[Enemy]                             │
│  at X=250       at X=660                             │
│               (moves -50px left)                     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Frame 200ms (RETURN)                                 │
│ [Player]         [Enemy]                             │
│  at X=250        at X=710                            │
│               (back to original)                     │
└──────────────────────────────────────────────────────┘

Duration: 200ms (100ms out + 100ms back)
Effect: Charge forward (toward player), then return
```

---

### 2. Damage Flash Animation 💥

```
NORMAL STATE (before hit):
┌──────────────────────────────┐
│                              │
│       [Enemy Sprite]         │
│      (normal colors)         │
│      (100% opacity)          │
│                              │
└──────────────────────────────┘


IMPACT (0ms):
┌──────────────────────────────┐
│                              │
│    ⚪ [WHITE SPRITE] ⚪       │
│     (tinted white)           │
│     (70% opacity = dimmed)    │
│                              │
└──────────────────────────────┘
    ↓ 50ms
    
    
MID-FLASH (50ms):
┌──────────────────────────────┐
│                              │
│    ⚪ [LIGHTER WHITE] ⚪      │
│   (still white, dimming)     │
│   (still 70% opacity)        │
│                              │
└──────────────────────────────┘
    ↓ 50ms


RECOVERY (100ms):
┌──────────────────────────────┐
│                              │
│       [Enemy Sprite]         │
│    (colors restored)         │
│    (100% opacity)            │
│                              │
└──────────────────────────────┘

Timeline:
0ms ─────── 50ms ─────── 100ms
[WHITE]     [WHITE]      [NORMAL]
[DIMMED]    [DIMMED]     [BRIGHT]
```

---

### 3. Damage Popup Animation 🔢

```
SUPER EFFECTIVE HIT (Yellow Text):

0ms (START):
                [Enemy]
                
                ↑ 45 ↑
                Yellow
                28px bold
                (position: 710, 120)


250ms (HALFWAY):
                [Enemy]
                
              ↑ 22.5 ↑
              Semi-transparent yellow
              (position: 710, 90)


500ms (ALMOST DONE):
                [Enemy]
                
            ↑ 11.25 ↑
            Very faint yellow
            (position: 710, 60)


1000ms (COMPLETE):
                [Enemy]
                (popup destroyed)


Timeline:
0ms ────────── 500ms ────────── 1000ms
[45]           [22]            (gone)
BRIGHT         DIM             
YELLOW         YELLOW          
LOW                            
POSITION       HIGH            


Color Coding:
Super Effective: 🟡 YELLOW (28px) - Big damage
Normal Damage:   ⚪ WHITE (24px) - Standard
Not Very Effect: ⚫ GRAY (24px) - Reduced
```

---

### 4. Health Bar Animation 📊

```
START (Before taking damage):
Enemy: 80/100 HP
████████████████░░ (GREEN - healthy)
0%            50%           100%
░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ █ █ █ █ █ █ █ █ █ █


50ms (DURING ANIMATION):
Enemy: ~70/100 HP
███████████░░░░░░░░ (STILL GREEN)
Position 1/6 through 300ms animation


100ms (DURING ANIMATION):
Enemy: ~60/100 HP
██████████░░░░░░░░░░ (STILL GREEN)
Position 1/3 through 300ms animation


150ms (COLOR CHANGE):
Enemy: ~50/100 HP
█████████░░░░░░░░░░░░ (YELLOW - warning!)
Position 1/2 through 300ms animation
Color changed because <50% HP


200ms (DURING ANIMATION):
Enemy: ~40/100 HP
████░░░░░░░░░░░░░░░░░░░ (STILL YELLOW)
Position 2/3 through 300ms animation


250ms (MORE DAMAGE):
Enemy: ~35/100 HP
███░░░░░░░░░░░░░░░░░░░░░ (YELLOW)
Position 5/6 through 300ms animation


300ms (COMPLETE):
Enemy: 30/100 HP
████░░░░░░░░░░░░░░░░░░░░░░ (RED - critical!)
Position 6/6 through 300ms animation
Color changed because <25% HP


HP Bar Color Zones:
▓▓▓▓▓▓▓▓▓▓▓ = 100% = GREEN ✅
▓▓▓▓▓▓▓▓░░░░ = 80% = GREEN ✅
▓▓▓▓▓▓▓░░░░░░░░ = 50% = YELLOW ⚠️ (threshold)
▓▓▓▓░░░░░░░░░░░░░░ = 30% = RED 🔴
░░░░░░░░░░░░░░░░░░░░ = 0% = RED 🔴 (fainted)


Timeline:
0ms ─────── 75ms ─────── 150ms ─────── 225ms ─────── 300ms
80%         60%          50%           35%          30%
GREEN       GREEN        YELLOW        YELLOW       RED
```

---

### 5. Complete Battle Turn Visual

```
PLAYER ATTACKS WITH CORRECT ANSWER:

Timeline (Milliseconds):
0ms ─ 50ms ─ 100ms ─ 150ms ─ 200ms ─ 250ms ─ 300ms ─ 350ms ─ 400ms ─ 500ms ─ 1000ms
│     │      │       │       │       │       │       │       │       │       │
├─────┴──────┴───────┴───────┴───────┴───────┤
│         ATTACK ANIMATION (200ms)
│         [→→→←←←] Player moves out+back


                        ├──┤
                   DAMAGE FLASH (100ms)
                   [White flash] Enemy


                        ├────────────────────────────────────────────────────┤
                        DAMAGE POPUP (1000ms)
                        [45]↑ floats up + fades


                        ├───────────────────────┤
                        HEALTH BAR (300ms)
                        [Bar shrinks, color changes]


Event Sequence:
Player Attacks
    ↓
[Attack Animation: Player moves right, returns (200ms)]
    ↓
[Damage calculated: 45 damage]
    ↓
[Simultaneous for ~1 second:]
  ├─ Enemy flashes white (100ms)
  ├─ Damage number floats: 45↑ (1000ms)
  └─ HP bar decreases, color: Green → Yellow → Red (300ms)
    ↓
[Enemy's turn begins, or battle ends if fainted]


Visual Result for Player:
- Enemy sprite moves left (attacking motion)
- Enemy sprite flashes white (hit!)
- "45" appears in YELLOW (super effective!)
- Enemy HP bar smoothly shrinks
- Notification: "Charizard used Ember! It's super effective!"
- Game continues in ~1000ms


Timing Breakdown:
Attack animation:     0-200ms    (player recovers in time for effects)
Damage flash:         100-200ms  (overlaps with popup)
Damage popup:         100-1100ms (rises then fades)
Health bar:           100-400ms  (faster than popup)
All effects visible:  100-1000ms (1 second of visual feedback)
```

---

### 6. Color Reference Guide

```
HEALTH BAR COLORS:

█ GREEN (0x00cc00)
├─ Hex: 00cc00
├─ RGB: (0, 204, 0)
├─ Status: Healthy & Safe
├─ Threshold: > 50% HP
└─ Meaning: ✅ No danger

█ YELLOW (0xffaa00)
├─ Hex: ffaa00
├─ RGB: (255, 170, 0)
├─ Status: Caution
├─ Threshold: 25-50% HP
└─ Meaning: ⚠️ Getting hurt

█ RED (0xcc0000)
├─ Hex: cc0000
├─ RGB: (204, 0, 0)
├─ Status: Critical
├─ Threshold: < 25% HP
└─ Meaning: 🔴 One more hit?


DAMAGE POPUP COLORS:

🟡 YELLOW (#ffff00) - SUPER EFFECTIVE
├─ Font: 28px (larger)
├─ Multiplier: 2x damage
├─ Style: Bold
└─ Meaning: ✨ Major advantage!

⚪ WHITE (#ffffff) - NORMAL DAMAGE
├─ Font: 24px (standard)
├─ Multiplier: 1x damage
├─ Style: Bold
└─ Meaning: 🎯 Standard hit

⚫ GRAY (#888888) - NOT VERY EFFECTIVE
├─ Font: 24px (standard)
├─ Multiplier: 0.5x damage
├─ Style: Bold
└─ Meaning: ⚠️ Reduced damage
```

---

### 7. Complete Animation Flowchart

```
┌──────────────────────────────────────────┐
│    PLAYER SELECTS MOVE & ANSWERS QUIZ    │
└─────────────────┬──────────────────────┘
                  │
              200ms animation
                  │
        ┌─────────▼─────────┐
        │ ATTACK ANIMATION  │
        │ Sprite moves      │
        │ toward opponent   │
        └─────────┬─────────┘
                  │
        ┌─────────▼──────────────────────────┐
        │ CALCULATE DAMAGE & EFFECTIVENESS   │
        └─────────┬──────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    │(parallel)   │ (parallel)  │ (parallel)
    │             │             │
100ms          1000ms           300ms
    │             │             │
▼───┴─▼          ▼───────┬──▼  ▼──────┬─▼
FLASH    POPUP FLOAT    HP BAR
WHITE    ↑ Fades        SHRINKS
TINT     
         Color codes:
         Yellow (super)
         White (normal)
         Gray (weak)
│
└────────────────┬─────────────────
             MAX: 1000ms


                  │
        ┌─────────▼──────────────┐
        │  UPDATE MESSAGE BOX    │
        │  "Charizard used       │
        │  Ember! Super          │
        │  effective! +20%"      │
        └─────────┬──────────────┘
                  │
        ┌─────────▼──────────────┐
        │ CHECK BATTLE STATUS    │
        └─────────┬──────────────┘
                  │
        ┌─────────▼──────────────┐
        │  ENEMY FAINTED?        │
        └───────┬────────┬───────┘
                │        │
               YES      NO
                │        │
                │        └──────────┐
                │                   │
            VICTORY          ENABLE ENEMY TURN
             SCREEN               │
                            [Similar animation
                             sequence from
                             enemy's perspective]
```

---

### 8. Side-by-Side Comparison

```
WITHOUT ANIMATIONS (Boring):
┌────────────────────────────────────────┐
│ Click Move                             │
│ [instant] Enemy takes 45 damage        │
│ HP: 100 → 55 instantly                 │
│ No visual feedback                     │
│ [instant] Ready for next turn          │
│ Total: 0ms visual, feels stiff         │
└────────────────────────────────────────┘


WITH ANIMATIONS (Engaging):
┌────────────────────────────────────────┐
│ Click Move                             │
│ [200ms] Player charges forward         │
│ [100ms] Enemy flashes white on impact  │
│ [1000ms] "45" floats up in yellow      │
│ [300ms] HP smoothly: 100 → 55 (red)   │
│ [Message] "Super effective! +20%!"     │
│ [Audio*] Attack sound + hit ping       │
│ Total: ~1000ms visual, feels polished  │
│ * Audio not yet implemented            │
└────────────────────────────────────────┘
```

---

## Animation Checklist While Playing

When you play Flashcard Rogue, check for:

### ✅ Player Turn Checklist
- [ ] See player sprite move right when attacking
- [ ] Enemy sprite flashes white on hit
- [ ] See yellow/white/gray damage number float up
- [ ] HP bar smoothly decreases
- [ ] Bar color changes green → yellow → red based on HP
- [ ] HP text updates to new value
- [ ] Message shows damage and effectiveness

### ✅ Enemy Turn Checklist
- [ ] See enemy sprite move left when attacking
- [ ] Player sprite flashes white on hit
- [ ] See damage number float above player
- [ ] Player's HP bar smoothly decreases
- [ ] Same color changes as player
- [ ] Player takes damage correctly

### ✅ Status Move Checklist (Growl, etc.)
- [ ] See sprite move (attack animation)
- [ ] NO flash (status moves don't deal damage)
- [ ] NO damage popup
- [ ] Message shows stat change: "ATK fell!"

### ✅ Performance Checklist
- [ ] Smooth 60 FPS (no stuttering)
- [ ] Animations feel responsive
- [ ] No lag between button click and animation
- [ ] Battle flows naturally
- [ ] No visual glitches

---

## Customization Visual Examples

### Arcade Mode (Fast)
```
Original:  [→→→←←←] Attack (200ms)
Arcade:    [→←] Attack (100ms)

Original:  ████████████████░░ Smooth decrease (300ms)
Arcade:    ████░░░░░░░░░░░░░░ Quick drop (150ms)

Original:  [45]↑ Float (1000ms)
Arcade:    [45]↑ Float (500ms)
```

### Cinematic Mode (Slow)
```
Original:  [→→→←←←] Attack (200ms)
Cinematic: [→→→→→→→→←←←←←←←←] Attack (400ms)

Original:  ████████████████░░ Decrease (300ms)
Cinematic: ████████░░░░░░░░░░ Slow decrease (600ms)

Original:  [45]↑ Float (1000ms)
Cinematic: [45]↑ Float (2000ms)
```

---

## Summary Visual

```
4 Core Animations Working Together:

┌─────────────────────────────────────┐
│  🏃 ATTACK                          │
│  Sprite moves forward + back        │
│  Duration: 200ms                    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  💥 DAMAGE FEEDBACK                 │
│  ├─ Flash: White tint (100ms)       │
│  ├─ Popup: Number float (1000ms)    │
│  └─ Bar: Smooth HP decrease (300ms) │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  ✨ VISUAL POLISH                   │
│  ├─ Color-coded numbers             │
│  ├─ Dynamic health bar colors       │
│  ├─ Smooth tweens                   │
│  └─ Auto-cleanup                    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  🎮 RESULT                          │
│  Professional game feel             │
│  60 FPS performance                 │
│  Engaging combat                    │
│  Player satisfaction ⭐⭐⭐⭐⭐      │
└─────────────────────────────────────┘
```
