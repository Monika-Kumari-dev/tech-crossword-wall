const words = [
  { answer: 'GED', row: 0, col: 2, direction: 'down', number: 1, branded: true },
  { answer: 'WEEK', row: 1, col: 1, direction: 'across', number: 2, branded: true },
  { answer: 'ENGINEER', row: 1, col: 3, direction: 'down', number: 3 },
  { answer: 'INTUIT', row: 4, col: 3, direction: 'across', number: 4, branded: true },
  { answer: 'UNITY', row: 4, col: 6, direction: 'down', number: 5 },
  { answer: 'FY27', row: 8, col: 5, direction: 'across', number: 6, branded: true },
];

export default function WallPreview() {
  const cells = new Map();
  words.forEach((word) => [...word.answer].forEach((letter, index) => {
    const row = word.row + (word.direction === 'down' ? index : 0);
    const col = word.col + (word.direction === 'across' ? index : 0);
    const key = `${row}-${col}`;
    cells.set(key, {
      letter: word.branded ? letter : cells.get(key)?.letter || '',
      number: index === 0 ? word.number : cells.get(key)?.number,
    });
  }));
  return (
    <aside className="wall-preview" aria-label="Preview of the tech crossword wall">
      <div className="preview-grid" style={{ gridTemplateColumns: "repeat(9, 1fr)" }} aria-hidden="true">
        {Array.from({ length: 81 }, (_, index) => {
          const row = Math.floor(index / 9);
          const cell = cells.get(`${row}-${index % 9}`);
          return <div key={index} className={cell ? 'preview-cell' : 'preview-empty'}>
            {cell?.number && <small>{cell.number}</small>}
            {cell?.letter && <span>{cell.letter}</span>}
          </div>;
        })}
      </div>
    </aside>
  );
}
