import prisma from './db';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.progress.deleteMany();
  await prisma.guestSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.module.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.strategy.deleteMany();

  // ============================================
  // MODULES — Progressive learning stages
  // ============================================
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        title: 'The Basics — Tiles, Hands & Rules',
        description: 'Learn the foundation of Riichi Mahjong: tile types, hand structure, how to draw and discard, and the basic flow of a game.',
        order: 1,
        type: 'lesson',
        content: JSON.stringify({
          sections: [
            {
              title: 'Welcome to Mahjong Soul',
              body: 'Riichi Mahjong (also called Japanese Mahjong) is a 4-player tile game where your goal is to build a complete winning hand before your opponents. Mahjong Soul is a popular online platform to play this game.',
            },
            {
              title: 'The Tiles',
              body: 'There are 136 tiles in a standard set, divided into 3 suits and honor tiles:\n\n**Suits (numbered 1-9, four copies each):**\n- 🀇 **Man (Characters/萬子)** — Marked with Chinese numerals\n- 🀙 **Pin (Circles/筒子)** — Marked with circles/dots\n- 🀐 **Sou (Bamboo/索子)** — Marked with bamboo sticks\n\n**Honor Tiles (four copies each):**\n- **Wind tiles (風牌):** East, South, West, North\n- **Dragon tiles (三元牌):** White (Haku), Green (Hatsu), Red (Chun)\n\n**Special:** Tiles numbered 1 and 9 are called "terminals" (老頭牌). Tiles 2-8 are "simples" (中張牌).',
            },
            {
              title: 'Hand Structure',
              body: 'A complete winning hand consists of **14 tiles** arranged as:\n- **4 sets (mentsu)** + **1 pair (jantai/atama)**\n\nSets can be:\n- **Sequence (Shuntsu):** 3 consecutive tiles of the same suit (e.g., 2-3-4 Pin)\n- **Triplet (Koutsu):** 3 identical tiles (e.g., three 7-Sou)\n- **Quad (Kantsu):** 4 identical tiles (declared as a Kan)\n\nDuring your turn you hold 13 tiles. You draw a 14th tile and must discard one.',
            },
            {
              title: 'Game Flow',
              body: '1. **Deal:** Each player receives 13 tiles\n2. **Turns:** Going counterclockwise, each player draws from the wall and discards\n3. **Calls:** You can claim discarded tiles for Chi (sequence), Pon (triplet), or Kan (quad)\n4. **Winning:** Declare "Tsumo" (self-draw win) or "Ron" (win off opponent\'s discard)\n5. **Rounds:** A game consists of East round and South round (Hanchan)',
            },
            {
              title: 'Key Rules',
              body: '- **Riichi (立直):** When your hand is one tile away from winning (tenpai) and fully concealed, you can declare Riichi by discarding sideways and paying 1000 points.\n- **Furiten (振聴):** If your winning tile is in your own discard pile, you cannot win by Ron.\n- **Yaku requirement:** Your hand must contain at least one Yaku (winning pattern) to win.\n- **Dora:** Bonus tiles that increase hand value. Shown by the indicator on the dead wall.',
            },
          ],
          quiz: [
            { question: 'How many tiles are in a standard Riichi Mahjong set?', options: ['108', '136', '144', '152'], answer: 1 },
            { question: 'A complete winning hand consists of how many tiles?', options: ['13', '14', '15', '16'], answer: 1 },
            { question: 'What are the three suits in Mahjong?', options: ['Man, Pin, Sou', 'East, South, West', 'Haku, Hatsu, Chun', 'Pon, Chi, Kan'], answer: 0 },
            { question: 'What does Furiten mean?', options: ['A winning hand', 'You cannot Ron if your winning tile is in your discards', 'A special call', 'A type of Yaku'], answer: 1 },
          ],
        }),
      },
    }),
    prisma.module.create({
      data: {
        title: 'Yaku — Winning Hand Patterns',
        description: 'Master the essential Yaku (winning conditions) you need to know. From simple 1-han Yaku to powerful Yakuman hands.',
        order: 2,
        type: 'lesson',
        content: JSON.stringify({
          sections: [
            {
              title: 'What is a Yaku?',
              body: 'A Yaku is a specific pattern or condition that makes your hand valid for winning. You MUST have at least one Yaku to declare a win. The more valuable the Yaku, the more points you score. Yaku value is measured in "Han" (翻).',
            },
            {
              title: 'Essential 1-Han Yaku',
              body: '**Riichi (立直)** — Declare when tenpai with a closed hand. 1 han.\n\n**Tsumo (門前清自摸和)** — Win by self-draw with a closed hand. 1 han.\n\n**Pinfu (平和)** — All sequences, valueless pair, two-sided wait. Closed only. 1 han.\n\n**Tanyao (断么九)** — Hand with only simples (2-8), no terminals or honors. 1 han.\n\n**Iipeiko (一盃口)** — Two identical sequences in a closed hand. 1 han.\n\n**Yakuhai (役牌)** — A triplet of: your seat wind, round wind, or any dragon. 1 han each.',
            },
            {
              title: 'Important 2-3 Han Yaku',
              body: '**Chanta (混全帯么九)** — Every set and the pair includes a terminal or honor. 2 han (1 if open).\n\n**Ittsu (一気通貫)** — A 1-2-3, 4-5-6, 7-8-9 straight in one suit. 2 han (1 if open).\n\n**San Shoku (三色同順)** — Same sequence in all three suits. 2 han (1 if open).\n\n**Toitoi (対々和)** — All triplets, no sequences. 2 han.\n\n**Honitsu (混一色)** — One suit plus honors. 3 han (2 if open).\n\n**Chinitsu (清一色)** — All tiles from one suit only. 6 han (5 if open).',
            },
            {
              title: 'Yakuman — The Grand Slams',
              body: 'Yakuman hands are worth a massive number of points (limit hand):\n\n**Kokushi Musou (国士無双)** — One of each terminal and honor tile, plus one duplicate.\n\n**Suuankou (四暗刻)** — Four concealed triplets.\n\n**Daisangen (大三元)** — Triplets of all three dragons.\n\n**Shousuushii (小四喜)** — Three wind triplets + wind pair.\n\n**Tsuuiisou (字一色)** — All honor tiles.\n\n**Chinroutou (清老頭)** — All terminals only.\n\nThese are rare but game-winning!',
            },
          ],
          quiz: [
            { question: 'What is the minimum number of Yaku needed to win?', options: ['0', '1', '2', '3'], answer: 1 },
            { question: 'Which Yaku requires only simple tiles (2-8)?', options: ['Pinfu', 'Tanyao', 'Riichi', 'Toitoi'], answer: 1 },
            { question: 'Pinfu requires what kind of wait?', options: ['Single tile wait', 'Two-sided wait', 'Pair wait', 'Any wait'], answer: 1 },
            { question: 'What is Kokushi Musou?', options: ['All triplets', 'One of each terminal and honor', 'All one suit', 'All sequences'], answer: 1 },
          ],
        }),
      },
    }),
    prisma.module.create({
      data: {
        title: 'Tile Efficiency — Shanten & Ukeire',
        description: 'Learn how to build your hand efficiently. Understand Shanten count, tile acceptance (Ukeire), and how to maximize your chances of winning.',
        order: 3,
        type: 'lesson',
        content: JSON.stringify({
          sections: [
            {
              title: 'What is Shanten?',
              body: 'Shanten (向聴数) is the number of tiles you need to change to reach tenpai (ready to win).\n\n- **Tenpai (0-shanten):** One tile away from completing your hand\n- **1-shanten (iishanten):** Two tiles away\n- **2-shanten:** Three tiles away\n\nYour goal in the early-mid game is to reduce your shanten count as quickly as possible.',
            },
            {
              title: 'Ukeire — Tile Acceptance',
              body: 'Ukeire (受入) is the number of different tiles that would improve your hand (reduce shanten). Higher ukeire = more chances to improve.\n\n**Example:** If discarding tile A leaves you accepting 12 different tiles, and discarding tile B only accepts 8 tiles, discard B.\n\nAlways count:\n- How many types of tiles help you\n- How many copies of each are still available (check discards!)',
            },
            {
              title: 'Key Shapes to Know',
              body: '**Strong shapes (high ukeire):**\n- **Two-sided wait (Ryanmen):** e.g., 4-5 waiting for 3 or 6 → 8 tiles\n- **Connected pair + sequence:** Multiple ways to complete\n\n**Weak shapes (low ukeire):**\n- **Edge wait (Penchan):** e.g., 1-2 waiting for 3 only → 4 tiles\n- **Closed wait (Kanchan):** e.g., 3-5 waiting for 4 only → 4 tiles\n- **Pair wait (Shanpon):** Two pairs, waiting for either to become a triplet → 4 tiles\n- **Single wait (Tanki):** Waiting for pair completion → 3 tiles',
            },
            {
              title: 'Practical Efficiency Tips',
              body: '1. **Keep connected tiles:** Pairs, consecutive tiles, and tiles one apart (e.g., 3-5) have the most potential\n2. **Discard isolated tiles first:** Single honor tiles or terminals with no connections\n3. **Prioritize two-sided waits:** They give you the most outs\n4. **Count visible tiles:** Tiles in discards and calls reduce your available outs\n5. **Flexibility over speed:** Sometimes keeping more options is better than rushing to tenpai\n6. **Middle tiles (3-7) are most versatile:** They can form sequences in multiple ways',
            },
          ],
          quiz: [
            { question: 'What does "tenpai" mean?', options: ['You won', 'One tile from winning', 'Two tiles from winning', 'You lost'], answer: 1 },
            { question: 'Which wait type gives the most tile acceptance?', options: ['Edge wait', 'Closed wait', 'Two-sided wait', 'Single wait'], answer: 2 },
            { question: 'What is Ukeire?', options: ['A type of Yaku', 'Number of tiles that improve your hand', 'A discard pile', 'A scoring term'], answer: 1 },
            { question: 'Which tiles are the most versatile in forming sequences?', options: ['1 and 9', '2 and 8', '3 through 7', 'Honor tiles'], answer: 2 },
          ],
        }),
      },
    }),
    prisma.module.create({
      data: {
        title: 'Defense — Protecting Your Points',
        description: 'Learn when and how to play defensively. Master the art of reading danger tiles, folding safely, and minimizing point losses.',
        order: 4,
        type: 'lesson',
        content: JSON.stringify({
          sections: [
            {
              title: 'Why Defense Matters',
              body: 'In Riichi Mahjong, avoiding dealing into someone\'s hand (paying via Ron) is just as important as winning. A single bad discard can cost you 8,000+ points. Good players know WHEN to attack and WHEN to fold.',
            },
            {
              title: 'Reading the Danger',
              body: '**Signs someone is dangerous:**\n- They declared Riichi (立直) — they\'re definitely tenpai\n- They made multiple calls (Pon/Chi) and are discarding unusual tiles\n- Their discards show a clear pattern (one suit missing = likely Honitsu/Chinitsu)\n- Late-game with few tiles in their hand\n\n**Danger assessment:**\n- Riichi player is ALWAYS dangerous\n- Player with 3+ calls and few tiles = likely tenpai\n- Watch what suit they\'re collecting',
            },
            {
              title: 'Safe Tile Principles',
              body: '**Safest tiles (in order):**\n1. **Genbutsu (現物):** Tiles already in the riichi player\'s discard pile — 100% safe against that player\n2. **Suji (筋):** If they discarded 4, then 1 and 7 of that suit are relatively safe (suji defense)\n3. **Kabe (壁):** If all 4 copies of a tile are visible, tiles depending on it for sequences are safe\n4. **Honor tiles with 2+ copies visible:** Lower chance of being their pair wait\n\n**Most dangerous tiles:**\n- Tiles adjacent to their last discard before Riichi\n- Middle tiles (3-7) of suits not in their discards\n- Dora tiles or red fives',
            },
            {
              title: 'When to Fold (Betaori)',
              body: 'Betaori (ベタ降り) means completely abandoning your hand to play safe.\n\n**Fold when:**\n- Someone declares Riichi and your hand is far from tenpai (2+ shanten)\n- Multiple players seem tenpai\n- You\'re in the lead and have more to lose\n- The hand value you\'re building is low vs. the risk\n\n**How to fold:**\n1. Discard genbutsu (safe tiles) first\n2. Use suji as secondary safety\n3. Avoid discarding tiles from suits they\'re collecting\n4. If you must discard a dangerous tile, do it early (less chance of them being tenpai early)',
            },
            {
              title: 'Suji Defense Deep Dive',
              body: 'Suji is based on the logic that for a two-sided wait (the most common wait):\n\n- If they discard **1**, then **4** is safer (4-5-6 would need 4, but 1-2-3 would need 1 which they discarded)\n- **1↔4, 2↔5, 3↔6** are suji pairs\n- **4↔7, 5↔8, 6↔9** are suji pairs\n\n⚠️ Suji is NOT 100% safe — it doesn\'t protect against kanchan, shanpon, or tanki waits. It\'s a probability play.',
            },
          ],
          quiz: [
            { question: 'What is Genbutsu?', options: ['A winning tile', 'Tiles in the opponent\'s discard pile (100% safe)', 'A type of Yaku', 'An honor tile'], answer: 1 },
            { question: 'When should you fold (Betaori)?', options: ['Always', 'When your hand is far from winning and someone declared Riichi', 'Never', 'Only in the last round'], answer: 1 },
            { question: 'What is Suji defense based on?', options: ['Honor tile safety', 'Two-sided wait logic', 'Random probability', 'Tile counting'], answer: 1 },
            { question: 'Which tile is safest to discard against a Riichi player?', options: ['A tile they discarded', 'A dora tile', 'A middle tile from a suit not in their discards', 'A red five'], answer: 0 },
          ],
        }),
      },
    }),
    prisma.module.create({
      data: {
        title: 'Advanced Strategy — Pushing, Pulling & Game Sense',
        description: 'Take your game to the next level with advanced concepts: push/fold decisions, placement-aware play, scoring strategy, and situational reads.',
        order: 5,
        type: 'lesson',
        content: JSON.stringify({
          sections: [
            {
              title: 'Push vs. Fold Decisions',
              body: 'The core of intermediate-to-advanced Mahjong is knowing when to push (continue attacking) vs. fold (play defensively).\n\n**Push when:**\n- Your hand is tenpai or 1-shanten with good waits\n- Your hand is high-value (3+ han, good fu)\n- You have a safe tile to discard while staying tenpai\n- You\'re behind in points and need to catch up\n\n**Fold when:**\n- You\'re 2+ shanten with a low-value hand\n- Multiple opponents seem dangerous\n- You\'re ahead in points and playing for placement\n- The risk/reward ratio is unfavorable',
            },
            {
              title: 'Placement-Aware Play',
              body: 'In Mahjong Soul ranked games, your final placement (1st-4th) determines your rank points:\n\n- **1st place:** Gain significant rank points\n- **2nd place:** Small gain or break even\n- **3rd place:** Small loss\n- **4th place:** Large loss (avoid at all costs!)\n\n**Strategy by position:**\n- Leading: Play safe, protect your lead, cheap wins are fine\n- 2nd/3rd: Balanced play, look for opportunities\n- 4th (last): Must take risks, go for bigger hands, can\'t afford to fold everything',
            },
            {
              title: 'Scoring Optimization',
              body: '**Key scoring thresholds:**\n- 1 han 30 fu = 1,000 pts (min)\n- 3 han 30 fu = 4,000 pts (good)\n- Mangan (5 han) = 8,000 pts (great)\n- Haneman (6-7 han) = 12,000 pts\n- Baiman (8-10 han) = 16,000 pts\n\n**Tips:**\n- Aim for at least Mangan when possible\n- Riichi + Tsumo + Dora can easily reach Mangan\n- Ippatsu (winning within one turn of Riichi) adds 1 han\n- Ura-dora (revealed after winning with Riichi) can spike your score\n- Consider whether opening your hand (calls) reduces value too much',
            },
            {
              title: 'Reading Opponents',
              body: '**Discard reading:**\n- Early honor/terminal discards = likely going for Tanyao or Pinfu\n- Early simple tile discards = might be going for Honitsu or Yakuhai\n- Suit concentrated in discards = they don\'t need that suit\n- Sudden change in discard pattern = they just changed strategy\n\n**Behavioral tells (in Mahjong Soul):**\n- Long pause before discard = tough decision (might be choosing between attack/defense)\n- Quick discards = they have a clear plan\n- Calling (Pon/Chi) early = they\'re racing for a specific hand',
            },
            {
              title: 'Advanced Concepts',
              body: '**Damaten (黙聴):** Being tenpai without declaring Riichi. Useful when:\n- Your hand is already valuable enough\n- You want to stay flexible\n- You want to hide your tenpai from opponents\n\n**Sashikomi (差し込み):** Intentionally dealing into a cheap hand to prevent a more dangerous player from winning.\n\n**Kan timing:** Declaring Kan gives you an extra draw and reveals new dora, but it also gives opponents more information and can enable their Rinshan or Chankan.\n\n**Ippatsu negation:** Calling (Pon/Chi) resets the Ippatsu counter — useful to deny a Riichi player their Ippatsu bonus.',
            },
          ],
          quiz: [
            { question: 'In Mahjong Soul ranked games, which placement should you avoid most?', options: ['1st', '2nd', '3rd', '4th'], answer: 3 },
            { question: 'What is Mangan worth in points (non-dealer)?', options: ['4,000', '8,000', '12,000', '16,000'], answer: 1 },
            { question: 'What is Damaten?', options: ['Declaring Riichi loudly', 'Being tenpai without declaring Riichi', 'A defensive technique', 'A type of Kan'], answer: 1 },
            { question: 'When should you push (continue attacking)?', options: ['Always', 'Never', 'When tenpai with good waits and decent hand value', 'Only when in 1st place'], answer: 2 },
          ],
        }),
      },
    }),
  ]);

  console.log(`✅ Created ${modules.length} modules`);

  // ============================================
  // KEYWORDS — Mahjong terminology (25+ terms)
  // ============================================
  const keywords = await prisma.keyword.createMany({
    data: [
      // Tiles category
      { term: 'Man (萬子)', definition: 'Character/Wan suit tiles, numbered 1-9, marked with Chinese numerals for ten-thousands.', category: 'tiles', examples: '1m, 5m, 9m (一萬, 五萬, 九萬)' },
      { term: 'Pin (筒子)', definition: 'Circle/Dot suit tiles, numbered 1-9, marked with circular patterns.', category: 'tiles', examples: '1p, 5p, 9p' },
      { term: 'Sou (索子)', definition: 'Bamboo suit tiles, numbered 1-9, marked with bamboo stick designs.', category: 'tiles', examples: '1s, 5s, 9s' },
      { term: 'Jihai (字牌)', definition: 'Honor tiles including wind tiles (East, South, West, North) and dragon tiles (Haku, Hatsu, Chun).', category: 'tiles', examples: 'East (東), South (南), Haku (白), Hatsu (發), Chun (中)' },
      { term: 'Dora (ドラ)', definition: 'Bonus tiles that add 1 han each to a winning hand. The dora indicator is shown on the dead wall, and the actual dora is the next tile in sequence.', category: 'tiles', examples: 'If indicator is 3m, dora is 4m. Red fives (赤ドラ) are always dora.' },
      // Yaku category
      { term: 'Riichi (立直)', definition: 'Declaring your hand is tenpai and closed by placing a 1,000 point stick. Locks your hand but adds 1 han and chance for Ippatsu/Ura-dora.', category: 'yaku', examples: 'Discard your tile sideways and say "Riichi!"' },
      { term: 'Tsumo (自摸)', definition: 'Winning by drawing your winning tile yourself. As a Yaku, Menzen Tsumo (門前清自摸和) adds 1 han for a closed hand.', category: 'yaku', examples: 'Draw the tile you need from the wall to complete your hand.' },
      { term: 'Tanyao (断么九)', definition: 'A hand consisting entirely of simple tiles (2-8), with no terminals (1, 9) or honor tiles.', category: 'yaku', examples: '234m 567p 345s 88s — all simples, 1 han.' },
      { term: 'Pinfu (平和)', definition: 'All sequences, no-value pair, and a two-sided wait. Must be closed. Worth 1 han.', category: 'yaku', examples: '123m 456p 789s 345p + pair of 2s' },
      { term: 'Yakuman (役満)', definition: 'The highest-value hands in Mahjong, worth a limit payment. These are extremely rare and powerful.', category: 'yaku', examples: 'Kokushi, Suuankou, Daisangen, Tsuuiisou' },
      // Gameplay category
      { term: 'Tenpai (聴牌)', definition: 'Your hand is one tile away from being a complete winning hand. Also written as "ready."', category: 'gameplay', examples: '1234567m 456p 89s — waiting for 7s or 10s (actually 7s).' },
      { term: 'Shanten (向聴)', definition: 'The number of tile changes needed to reach tenpai. Lower is better. Tenpai = 0 shanten.', category: 'gameplay', examples: '2-shanten means you need to improve 2 tiles to be tenpai.' },
      { term: 'Pon (ポン)', definition: 'Calling an opponent\'s discarded tile to complete a triplet (three identical tiles). Opens your hand.', category: 'gameplay', examples: 'You have two 7p, opponent discards 7p → call Pon.' },
      { term: 'Chi (チー)', definition: 'Calling the tile discarded by the player to your left to complete a sequence. Opens your hand.', category: 'gameplay', examples: 'You have 4m 5m, player to your left discards 3m → call Chi.' },
      { term: 'Kan (カン)', definition: 'Declaring a quad (four identical tiles). Can be open (from discard), closed (in hand), or added to an existing Pon.', category: 'gameplay', examples: 'Closed kan: You draw the 4th copy of a tile you hold 3 of.' },
      { term: 'Ron (ロン)', definition: 'Winning by claiming an opponent\'s discarded tile to complete your hand. The discarding player pays the full amount.', category: 'gameplay', examples: 'Opponent discards 3s and that completes your hand → Ron!' },
      { term: 'Furiten (振聴)', definition: 'A state where you cannot win by Ron because your winning tile appears in your own discard pile. You can still win by Tsumo.', category: 'gameplay', examples: 'If you need 3m to win but you discarded 3m earlier, you are Furiten.' },
      { term: 'Noten (ノーテン)', definition: 'Not being in tenpai when a round ends in an exhaustive draw. Noten players pay a penalty to tenpai players.', category: 'gameplay', examples: 'Draw round: tenpai players receive 3000 points split from noten players.' },
      // Scoring category
      { term: 'Han (翻)', definition: 'The unit measuring Yaku value. More han = higher score. Total han (from yaku + dora) determines the payment tier.', category: 'scoring', examples: 'Riichi(1) + Tsumo(1) + Dora(1) = 3 han' },
      { term: 'Fu (符)', definition: 'Mini-points that affect scoring at lower han values. Based on wait type, set composition, and win method. Becomes less relevant at Mangan+.', category: 'scoring', examples: 'Base 30 fu + closed triplet of terminals (8 fu) = 38 → rounded to 40 fu' },
      { term: 'Mangan (満貫)', definition: 'A score limit at 5 han (or 4 han 30+ fu / 3 han 70+ fu). Non-dealer Mangan = 8,000 points. A common target for strong hands.', category: 'scoring', examples: 'Riichi + Tsumo + Pinfu + Dora 2 = 5 han = Mangan!' },
      // Strategy category
      { term: 'Betaori (ベタ降り)', definition: 'Full defensive play — completely abandoning your hand to avoid dealing into an opponent\'s win. Essential survival skill.', category: 'strategy', examples: 'After Riichi is declared and you\'re far from tenpai, switch to discarding only safe tiles.' },
      { term: 'Genbutsu (現物)', definition: 'Tiles that a player has already discarded — 100% safe to discard against that player (they cannot Ron on a tile they discarded).', category: 'strategy', examples: 'If an opponent in Riichi discarded 5p, then 5p is genbutsu and safe against them.' },
      { term: 'Suji (筋)', definition: 'A defense technique based on two-sided wait logic. If a player discarded 4m, then 1m and 7m are suji-safe (~65% safe).', category: 'strategy', examples: '1-4-7, 2-5-8, 3-6-9 are the suji groups for each suit.' },
      { term: 'Damaten (黙聴)', definition: 'Being in tenpai without declaring Riichi. Conceals your ready state from opponents but forgoes Riichi bonuses.', category: 'strategy', examples: 'Hand is tenpai with Pinfu + Tanyao — already 2 han, so Damaten is fine.' },
      { term: 'Ippatsu (一発)', definition: 'Winning within the first go-around after declaring Riichi (before any calls interrupt). Adds 1 bonus han.', category: 'scoring', examples: 'Declare Riichi, and win on the very next draw or discard before anyone calls.' },
    ],
  });

  console.log(`✅ Created ${keywords.count} keywords`);

  // ============================================
  // STRATEGIES — Closing/winning guides
  // ============================================
  const strategies = await Promise.all([
    prisma.strategy.create({
      data: {
        title: 'The Fast Tanyao — Speed Wins Games',
        description: 'A reliable strategy for building quick, cheap winning hands using only simple tiles. Perfect for beginners and consistent point accumulation.',
        difficulty: 'beginner',
        content: JSON.stringify({
          overview: 'Tanyao (All Simples) is one of the easiest and most reliable Yaku to aim for. By focusing on tiles 2-8 and avoiding terminals and honors, you create a flexible hand that\'s quick to complete.',
          steps: [
            'At the start, identify if your hand has many simple tiles (2-8). If 9+ of your 13 tiles are simples, consider going for Tanyao.',
            'Discard isolated terminal tiles (1, 9) and honor tiles early. These tiles also help disguise your hand.',
            'Focus on building sequences with middle tiles — they have the most connections (e.g., 5 can be part of 3-4-5, 4-5-6, or 5-6-7).',
            'Pairs of simple tiles are great for your pair (jantai). Keep 2-8 pairs.',
            'Consider whether to keep the hand closed (for Menzen Tsumo potential) or open it (for speed). Open Tanyao (Kuitan) is allowed in most Mahjong Soul rooms.',
            'Combine with Pinfu if your hand is all sequences with a two-sided wait — that\'s Tanyao + Pinfu = 2 han minimum.',
            'Add Riichi if closed for 3 han, plus any Dora for Mangan potential!',
          ],
          tips: [
            'Open Tanyao is fast but only 1 han — make sure you have Dora or it might not be worth it',
            'Watch for Dora tiles in the 2-8 range — they make Tanyao much more valuable',
            'If 3+ of your tiles are terminals/honors, Tanyao probably isn\'t the right choice',
          ],
          when_to_use: 'Early rounds when you have many simple tiles. Good for building a lead or staying competitive without risky play.',
        }),
      },
    }),
    prisma.strategy.create({
      data: {
        title: 'Riichi Power Play — Maximizing Riichi Value',
        description: 'Master the timing and power of Riichi declaration. Learn when declaring Riichi multiplies your hand value and when staying silent (Damaten) is better.',
        difficulty: 'intermediate',
        content: JSON.stringify({
          overview: 'Riichi is the most common and powerful Yaku in the game. It adds 1 han, gives you a chance at Ippatsu (1 han), and reveals Ura-dora that can spike your hand\'s value dramatically. But it also locks your hand and reveals that you\'re tenpai.',
          steps: [
            'Build towards a closed hand. Avoid calling Pon/Chi unless you have a specific open-hand strategy.',
            'Reach tenpai with a good wait — prefer two-sided waits (Ryanmen) for maximum winning chances.',
            'Before declaring Riichi, consider: Am I safe? Is the reward worth the risk? Do I have points to spare?',
            'Declare Riichi by placing 1,000 points on the table and discarding your tile sideways.',
            'After Riichi, your hand is locked. You draw and discard automatically unless you can Tsumo or the winning tile appears.',
            'Ippatsu: If you win within one go-around (before any player calls), you get +1 han bonus.',
            'After winning with Riichi, check Ura-dora (tiles under the dora indicators) — each matching tile in your hand is +1 han!',
          ],
          tips: [
            'Riichi with Dora is extremely powerful — even a 1 han hand becomes Mangan with Riichi + Ippatsu + Dora 2',
            'Don\'t Riichi with a bad wait (single tile / edge wait) unless the hand is very valuable',
            'Consider Damaten (silent tenpai) when: your hand is already high value, the game situation requires stealth, or you\'re in a dangerous position',
            'Riichi stick goes to the winner of that hand — even if you don\'t win, it\'s incentive for others',
          ],
          when_to_use: 'Most situations when you reach tenpai with a closed hand. Especially powerful when you have Dora or a good wait.',
        }),
      },
    }),
    prisma.strategy.create({
      data: {
        title: 'Honitsu Fortress — The Honor-Suit Hybrid',
        description: 'Build powerful hands by focusing on a single suit plus honor tiles. High han count and relatively easy to assemble, even when open.',
        difficulty: 'intermediate',
        content: JSON.stringify({
          overview: 'Honitsu (Half Flush) combines tiles from one suit with honor tiles for 3 han closed (2 han open). It\'s a versatile strategy that naturally accumulates han from Yakuhai (honor triplets), making it easy to reach Mangan or higher.',
          steps: [
            'Identify your strongest suit early — which suit do you have the most tiles in?',
            'Begin discarding tiles from the other two suits. Prioritize discarding simples from off-suits.',
            'Collect honor tiles, especially: your seat wind, the round wind, and dragon tiles. Each triplet = 1 han of Yakuhai.',
            'It\'s OK to call Pon on honor tiles — you still get Honitsu (2 han open) + Yakuhai (1 han each).',
            'Fill out your chosen suit with sequences and triplets. Pairs from your suit or honors work for the pair.',
            'A typical Honitsu hand: 2 sets in your suit + 1-2 honor triplets + pair = 2-5 han base.',
            'Add Dora for even more value. Honitsu hands regularly reach Mangan (8,000 points).',
          ],
          tips: [
            'Your discards will reveal your strategy — opponents will know you\'re going for Honitsu when they see you dumping two suits',
            'Because it\'s visible, Honitsu works best when you\'re fast enough to win before opponents can fully defend',
            'Chinitsu (Full Flush, no honors) is even more powerful at 6 han but harder to complete',
            'If you get 3 dragon triplets while going Honitsu, that\'s Daisangen (Yakuman)!',
          ],
          when_to_use: 'When dealt many tiles of one suit plus honors. Especially effective when you have seat/round wind or dragon pairs early.',
        }),
      },
    }),
    prisma.strategy.create({
      data: {
        title: 'Endgame Survival — 4th Place Avoidance',
        description: 'The most critical skill in ranked Mahjong Soul: avoiding last place. Learn emergency strategies for when you\'re behind in the final rounds.',
        difficulty: 'advanced',
        content: JSON.stringify({
          overview: 'In Mahjong Soul ranking, 4th place costs the most rank points. Escaping 4th place (even to 3rd) dramatically reduces your losses. This guide covers strategies for the desperate situations every player faces.',
          steps: [
            'Track the score gap: Know exactly how many points you need to escape 4th. The scoreboard is always visible.',
            'Adjust your Yaku targets: If you need 8,000+ points, aim for Mangan. If you only need 2,000, a cheap hand is fine.',
            'Increase aggression: When in 4th, you can afford more risk. Push hands you\'d normally fold.',
            'Target the leader: If possible, win directly off the 1st place player (Ron) — this simultaneously boosts you and reduces their lead.',
            'Use Riichi aggressively: The Riichi stick + potential Ippatsu + Ura-dora can turn a small hand into Mangan.',
            'Consider open hands for speed: When you need points fast, calling Pon/Chi to complete a quick Yakuhai or Tanyao hand might save you.',
            'In the very last hand: If the score gap is close, even a Tsumo (all-pay) can push you up a placement.',
          ],
          tips: [
            'Noten penalty can drop you to 4th — if a draw seems likely, try to get to tenpai even with a weak hand',
            'Don\'t deal into the 3rd place player — you want to pass THEM, not make them richer',
            'All-Last (final hand): if you need a direct hit on a specific player, declare Riichi to maximize your hand value',
            'Sometimes dealing into a small hand from the 2nd/3rd place player is acceptable if the 1st place player is about to Tsumo a big hand',
          ],
          when_to_use: 'South round (2nd half) when you\'re in 4th place or close to it. Also useful in East round if you fall significantly behind early.',
        }),
      },
    }),
  ]);

  console.log(`✅ Created ${strategies.length} strategies`);

  console.log('\n🎊 Seeding complete!\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
