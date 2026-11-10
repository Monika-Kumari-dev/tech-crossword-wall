// Clue bank from GED Activation Content Ideas, November 2026.
const puzzles = [
  {
    "theme": "Intuit / GED",
    "clue": "The color of the Quality track",
    "answer": "BLUE",
    "row": 0,
    "col": 4,
    "direction": "down",
    "id": 22,
    "number": 1,
    "hint": "Starts with B and has 4 letters. Theme: Intuit / GED."
  },
  {
    "theme": "Engineering",
    "clue": "Percent of time a system stays up",
    "answer": "UPTIME",
    "row": 0,
    "col": 6,
    "direction": "down",
    "id": 16,
    "number": 2,
    "hint": "Starts with U and has 6 letters. Theme: Engineering."
  },
  {
    "theme": "Intuit / GED",
    "clue": "Intuit’s small business accounting product",
    "answer": "QUICKBOOKS",
    "row": 0,
    "col": 20,
    "direction": "down",
    "id": 6,
    "number": 3,
    "hint": "Starts with Q and has 10 letters. Theme: Intuit / GED."
  },
  {
    "theme": "Engineering",
    "clue": "A two-week chunk of work",
    "answer": "SPRINT",
    "row": 1,
    "col": 2,
    "direction": "down",
    "id": 14,
    "number": 4,
    "hint": "Starts with S and has 6 letters. Theme: Engineering."
  },
  {
    "theme": "AI",
    "clue": "A single request typed to a model",
    "answer": "PROMPT",
    "row": 1,
    "col": 6,
    "direction": "across",
    "id": 18,
    "number": 5,
    "hint": "Starts with P and has 6 letters. Theme: AI."
  },
  {
    "theme": "AI",
    "clue": "The protocol that lets Claude plug into your tools",
    "answer": "MCP",
    "row": 1,
    "col": 9,
    "direction": "down",
    "id": 20,
    "number": 6,
    "hint": "Starts with M and has 3 letters. Theme: AI."
  },
  {
    "theme": "Coding",
    "clue": "A saved snapshot of your changes",
    "answer": "COMMIT",
    "row": 2,
    "col": 16,
    "direction": "across",
    "id": 10,
    "number": 7,
    "hint": "Starts with C and has 6 letters. Theme: Coding."
  },
  {
    "theme": "Coding",
    "clue": "Combining two lines of work into one",
    "answer": "MERGE",
    "row": 3,
    "col": 0,
    "direction": "across",
    "id": 17,
    "number": 8,
    "hint": "Starts with M and has 5 letters. Theme: Coding."
  },
  {
    "theme": "Coding",
    "clue": "Hunting down the bug",
    "answer": "DEBUG",
    "row": 4,
    "col": 10,
    "direction": "down",
    "id": 11,
    "number": 9,
    "hint": "Starts with D and has 5 letters. Theme: Coding."
  },
  {
    "theme": "Intuit / GED",
    "clue": "The color of the Done-for-You track",
    "answer": "PINK",
    "row": 4,
    "col": 17,
    "direction": "across",
    "id": 21,
    "number": 10,
    "hint": "Starts with P and has 4 letters. Theme: Intuit / GED."
  },
  {
    "theme": "Engineering",
    "clue": "An unplanned event that pages the on-call engineer",
    "answer": "INCIDENT",
    "row": 5,
    "col": 1,
    "direction": "across",
    "id": 13,
    "number": 11,
    "hint": "Starts with I and has 8 letters. Theme: Engineering."
  },
  {
    "theme": "Intuit / GED",
    "clue": "Intuit’s tax product",
    "answer": "TURBOTAX",
    "row": 5,
    "col": 8,
    "direction": "down",
    "id": 5,
    "number": 12,
    "hint": "Starts with T and has 8 letters. Theme: Intuit / GED."
  },
  {
    "theme": "Engineering",
    "clue": "Undoing a bad deploy",
    "answer": "ROLLBACK",
    "row": 5,
    "col": 12,
    "direction": "down",
    "id": 2,
    "number": 13,
    "hint": "Starts with R and has 8 letters. Theme: Engineering."
  },
  {
    "theme": "Coding",
    "clue": "Where your code lives",
    "answer": "REPO",
    "row": 5,
    "col": 12,
    "direction": "across",
    "id": 23,
    "number": 13,
    "hint": "Starts with R and has 4 letters. Theme: Coding."
  },
  {
    "theme": "Engineering",
    "clue": "The automated path code takes from commit to production",
    "answer": "PIPELINE",
    "row": 5,
    "col": 14,
    "direction": "down",
    "id": 3,
    "number": 14,
    "hint": "Starts with P and has 8 letters. Theme: Engineering."
  },
  {
    "theme": "Coding",
    "clue": "Shipping your code to production",
    "answer": "DEPLOY",
    "row": 6,
    "col": 16,
    "direction": "across",
    "id": 12,
    "number": 15,
    "hint": "Starts with D and has 6 letters. Theme: Coding."
  },
  {
    "theme": "Intuit / GED",
    "clue": "Where all four tracks show off their work",
    "answer": "GALLERYWALK",
    "row": 8,
    "col": 10,
    "direction": "across",
    "id": 4,
    "number": 16,
    "hint": "Starts with G and has 11 letters. Theme: Intuit / GED."
  },
  {
    "theme": "Engineering",
    "clue": "The list of work not yet started",
    "answer": "BACKLOG",
    "row": 9,
    "col": 3,
    "direction": "across",
    "id": 15,
    "number": 17,
    "hint": "Starts with B and has 7 letters. Theme: Engineering."
  },
  {
    "theme": "AI",
    "clue": "Software that acts on your behalf, not just answers",
    "answer": "AGENT",
    "row": 9,
    "col": 4,
    "direction": "down",
    "id": 19,
    "number": 18,
    "hint": "Starts with A and has 5 letters. Theme: AI."
  },
  {
    "theme": "AI",
    "clue": "The “memory window” a model can see at once",
    "answer": "CONTEXT",
    "row": 10,
    "col": 18,
    "direction": "down",
    "id": 7,
    "number": 19,
    "hint": "Starts with C and has 7 letters. Theme: AI."
  },
  {
    "theme": "Intuit / GED",
    "clue": "Three letters, one big week of building",
    "answer": "GED",
    "row": 11,
    "col": 3,
    "direction": "across",
    "id": 24,
    "number": 20,
    "hint": "Starts with G and has 3 letters. Theme: Intuit / GED."
  },
  {
    "theme": "AI",
    "clue": "When a model confidently makes something up",
    "answer": "HALLUCINATION",
    "row": 11,
    "col": 7,
    "direction": "across",
    "id": 1,
    "number": 21,
    "hint": "Starts with H and has 13 letters. Theme: AI."
  },
  {
    "theme": "AI",
    "clue": "Teaching a model one more skill after initial training",
    "answer": "FINETUNE",
    "row": 14,
    "col": 11,
    "direction": "across",
    "id": 8,
    "number": 22,
    "hint": "Starts with F and has 8 letters. Theme: AI."
  },
  {
    "theme": "Coding",
    "clue": "Cleaning up code without changing what it does",
    "answer": "REFACTOR",
    "row": 16,
    "col": 13,
    "direction": "across",
    "id": 9,
    "number": 23,
    "hint": "Starts with R and has 8 letters. Theme: Coding."
  }
];

export default puzzles;
