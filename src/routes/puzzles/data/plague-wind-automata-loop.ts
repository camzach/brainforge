import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "plague-wind-automata-loop",
  code: "eyJ2ZXJzaW9uIjoxLCJ0aXRsZSI6IlBsYWd1ZSBXaW5kIEF1dG9tYXRhIExvb3AiLCJkZXNjcmlwdGlvbiI6Ii8vIEZvcmdlIGEga2V5IGJ5IGdlbmVyYXRpbmcgZXhhY3RseSA2IGFlbWJlciB0byBhdm9pZCBsb3NpbmcgZXhjZXNzIGFlbWJlciB0byBJbnRlcmRpbWVuc2lvbmFsIEdyYWZ0LiIsInBsYXllcjEiOnsiaG91c2UiOiJtYXJzIiwiaG91c2VzIjpbIm1hcnMiLCJicm9ibmFyIiwiZ2Vpc3RvaWQiXSwiaW5QbGF5IjpbInNocmluay1yYXktdGVjaG5pY2lhbiIsImJhbm5lci1vZi1iYXR0bGUiLCJiYW5uZXItb2YtYmF0dGxlIl0sImhhbmQiOlsidGhlLWJvZHktc25hdGNoZXJzIiwicGxhZ3VlLXdpbmQiXSwiZGlzY2FyZCI6WyJzaWRla2ljayIsInNpZGVraWNrIiwic2lkZWtpY2siLCJzaWRla2ljayIsInNpZGVraWNrIiwic2lkZWtpY2siLCJzaWRla2ljayIsInNpZGVraWNrIiwic2lkZWtpY2siLCJzaWRla2ljayJdfSwicGxheWVyMiI6eyJob3VzZXMiOlsiZ2Vpc3RvaWQiLCJsb2dvcyIsInNhbmN0dW0iXSwiaW5QbGF5IjpbeyJjYXJkIjoiZGltby1lbGRlcmdoYXN0IiwidG9rZW5zIjp7ImFybW9yIjoyfX0seyJjYXJkIjoiYXJtYWRyb25lIiwidG9rZW5zIjp7ImFybW9yIjozfX0seyJjYXJkIjoibGlvbi1iYXV0cmVtIiwidG9rZW5zIjp7ImFybW9yIjoxfX0seyJjYXJkIjoic2VsZi1ib2xzdGVyaW5nLWF1dG9tYXRhIiwidG9rZW5zIjp7ImFtYmVyIjoxfX1dLCJkZWNrIjpbImVjaG9mbHkiXSwiZGlzY2FyZCI6WyJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiLCJhcm1hZHJvbmUiXX19",
  title: "Plague Wind Automata Loop",
  publishedAt: "2024-04-01",
  difficulty: "Expert",
  author: "BrainForge",
  description:
    "Player 1 is in Mars with The Body Snatchers and Plague Wind in hand, and Shrink Ray Technician + 2 Banners of Battle in play. The opponent has Dimo Elderghast, an Armadrone, Lion Bautrem, and a Self-Bolstering Automata in play. Forge a key by generating exactly 6 Æmber to avoid losing excess to Interdimensional Graft.",
  goal: "Trigger the Self-Bolstering Automata loop to gain exactly 6 Æmber and forge a key.",
  hints: [
    "Shrink Lion Bautrem's power to 1 first so Plague Wind destroys it after the transfer.",
    "The Body Snatchers steals all opponent creatures; Plague Wind then deals -3 power to all non-Mars creatures.",
    "After gaining the creatures, Lion Bautrem has 1 - 3 + 2 = 0 power and is immediately destroyed.",
    "Self-Bolstering Automata loops its destroyed-and-returned ability, triggering Dimo Elderghast for +1 Æmber each iteration.",
    "Place Automata on the left flank to avoid adjacency to Lion and continue the loop; on the 7th placement put it next to Lion to stop at exactly 6 Æmber.",
  ],
  solution: {
    overview:
      "Shrink Lion Bautrem, steal all opponent creatures via The Body Snatchers + Plague Wind, then exploit the Self-Bolstering Automata loop with Dimo Elderghast for exactly 6 Æmber.",
    steps: [
      "Reap with Shrink Ray Technician: target Lion Bautrem, setting its power to 1.",
      "Play The Body Snatchers: steal control of all opponent creatures (Dimo Elderghast, Armadrone, Lion Bautrem, Self-Bolstering Automata).",
      "Play Plague Wind: deal -3 power to all non-Mars creatures. Lion Bautrem (1 - 3 + 2 banner bonus = 0) is destroyed immediately.",
      "When prompted, override Self-Bolstering Automata's destroyed replacement effect with The Body Snatchers' effect. Autoresolve the remaining destroyed triggers.",
      "Place creatures: Dimo Elderghast → Left, Armadrone → Left, Lion Bautrem → Right, Self-Bolstering Automata → Left.",
      "Self-Bolstering Automata's loop begins. Each iteration: trigger Dimo Elderghast for +1 Æmber, then place Automata on the Left flank. Repeat for 5 more iterations (6 total Dimo triggers = 6 Æmber).",
      "On the final (7th) placement, move Automata to the Right flank adjacent to Lion Bautrem. The +2 power from neighbours raises Automata's power to 2, ending the loop.",
      "Forge a key with exactly 6 Æmber and win.",
    ],
    explanation:
      "Shrinking Lion first ensures it dies to Plague Wind once transferred. The Banner of Battle +2 power bonus is what makes Automata survive on the right flank next to Lion, ending the loop precisely at 6 Æmber and satisfying Interdimensional Graft's exact-cost requirement.",
  },
};

export default puzzle;
