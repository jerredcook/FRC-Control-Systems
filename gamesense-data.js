/* FRC Academy - ORBIT, the practice game.
 *
 * ORBIT is an invented FRC-style game used by the Game Sense course, the
 * Scout trainer, and the Drive Lab. It exists so strategy skills can be
 * taught against a game that never goes stale: real games change every
 * January, but reading a manual, doing scoring math, and picking an
 * alliance transfer to any season. Every rule and point value lives HERE,
 * in one object, so a rebalance or clarification edits exactly one file.
 *
 * The fiction, in one breath: two alliances of three robots collect CELLS
 * (foam energy spheres) and feed the REACTOR tower at center field - low,
 * mid, or high ring - then return home to dock and balance on their
 * alliance PLATFORM before the buzzer.
 */
window.ORBIT = {
  name: "ORBIT",
  piece: "Cell",
  piecePlural: "Cells",
  fieldNote: "One REACTOR tower at center field with three scoring rings. Each alliance has a LOADING BAY at its wall (human player feeds Cells) and a tilting PLATFORM in its corner.",

  match: {
    autoSec: 15,
    teleopSec: 135,
    endgameSec: 30,   // the final 30 s of teleop
    totalSec: 150
  },

  scoring: {
    leave: 3,                       // auto: robot fully exits its start zone
    rings: {
      low:  { name: "Low ring",  tele: 2, auto: 4  },
      mid:  { name: "Mid ring",  tele: 5, auto: 10 },
      high: { name: "High ring", tele: 8, auto: 16 }
    },
    endgame: {
      park:    { name: "Park",    pts: 5,  note: "any part of the robot in the platform zone" },
      dock:    { name: "Dock",    pts: 10, note: "fully on the platform, platform tilted" },
      balance: { name: "Balance", pts: 20, note: "fully on the platform, platform level" },
      harmonyBonusEach: 5           // each robot, when 2+ alliance robots are balanced together
    }
  },

  rp: {
    win: 2, tie: 1, loss: 0,
    bonus: 1,   // RP paid per bonus accomplishment (Energized, Harmony), win or lose
    energized: { name: "Energized", note: "alliance scores at least 40 Reactor points", threshold: 40 },
    harmony:   { name: "Harmony",   note: "all three alliance robots dock or balance" }
  },

  fouls: {
    foul: 3,   // awarded to the opposing alliance
    tech: 8,
    rules: [
      { id: "O101", text: "A robot may control at most one Cell at a time. A second Cell held for more than 3 seconds is a FOUL." },
      { id: "O204", text: "Pinning an opponent against a field element for more than 5 seconds is a FOUL; the count resets after separating by 2 meters." },
      { id: "O207", text: "Contact inside an opponent's loading bay zone is a TECH FOUL." },
      { id: "O301", text: "During the last 30 seconds, opponents may not touch a robot in contact with its own platform. Violation: TECH FOUL and the touched robot is scored as Balanced." },
      { id: "O115", text: "Cells may not be intentionally launched over the Reactor's high ring guard. Violation: FOUL per Cell." }
    ]
  },

  // typical performance envelopes, used by cycle-math drills and the scout sim
  archetypes: [
    { key: "scorer",   name: "Scorer",     cycleSec: 14, ring: "high", note: "fast cycles to the high ring, weak on defense" },
    { key: "allround", name: "All-arounder", cycleSec: 18, ring: "mid",  note: "steady mid-ring cycles, reliable balance" },
    { key: "feeder",   name: "Feeder",     cycleSec: 10, ring: "low",  note: "hoovers Cells and feeds partners, low ring only" },
    { key: "defender", name: "Defender",   cycleSec: 0,  ring: null,   note: "shadows the opposing scorer; no cycles of its own" }
  ],

  glossary: [
    { t: "Alliance", d: "The team of three robots playing one side of a match. You win and lose together." },
    { t: "Qualification match", d: "The round-robin matches that set the rankings. Every team plays the same number." },
    { t: "Ranking point (RP)", d: "The points that decide seeding. Winning earns some, and special accomplishments (like Energized or Harmony in ORBIT) earn more." },
    { t: "Alliance selection", d: "After qualifications, the top seeds take turns picking partners for the playoffs - snake order." },
    { t: "Pick list", d: "A scouting-built ranking of every team, ready before alliance selection starts." },
    { t: "OPR", d: "Offensive power rating - a stats estimate of how many points a team contributes to its alliance per match." },
    { t: "Coopertition", d: "FIRST's word for helping opponents when it helps everyone - fierce play and real kindness at once." }
  ]
};
