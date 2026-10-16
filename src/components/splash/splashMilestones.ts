export type Milestone = {
  id: string;
  year: number; // negative means BCE
  label: string;
  holdMs: number; // how long the counter rests here before moving on
};

// The stops along the way. Change holdMs to make a stop longer or shorter.
export const milestones: Milestone[] = [
  { id: "nok", year: -1500, label: "Nok", holdMs: 600 },
  { id: "igbo-ukwu", year: 900, label: "Igbo-Ukwu", holdMs: 500 },
  { id: "sokoto", year: 1804, label: "Sokoto Caliphate", holdMs: 500 },
  { id: "amalgamation", year: 1914, label: "Amalgamation", holdMs: 500 },
  { id: "independence", year: 1960, label: "Independence", holdMs: 1000 },
];