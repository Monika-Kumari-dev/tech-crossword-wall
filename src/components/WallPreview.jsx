const words = [
  { answer: 'WEEK', row: 1, col: 3, direction: 'down', number: 1 },
  { answer: 'GED', row: 3, col: 2, direction: 'across', number: 2 },
  { answer: 'INTUIT', row: 5, col: 1, direction: 'across', number: 3 },
  { answer: 'FY27', row: 7, col: 2, direction: 'across', number: 4 },
];

export default function WallPreview() {
  const cells = new Map();
  words.forEach((word) => [...word.answer].forEach((letter, index) => {
    const row = word.row + (word.direction === 'down' ? index : 0);
    const col = word.col + (word.direction === 'across' ? index : 0);
    const key = `${row}-${col}`;
    cells.set(key, { letter, number: index === 0 ? word.number : cells.get(key)?.number });
  }));
  return (
    <aside className="wall-preview" aria-label="Preview of the tech crossword wall">
      <div className="wall-topline"><span>GED WEEK FY27</span><span>FY27</span></div>
      <h2>Tech<br /><span>Crossword Wall</span></h2>
      <div className="preview-grid" aria-hidden="true">
        {Array.from({ length: 64 }, (_, index) => {
          const row = Math.floor(index / 8);
          const cell = cells.get(`${row}-${index % 8}`);
          return <div key={index} className={cell ? 'preview-cell' : 'preview-empty'}>
            {cell?.number && <small>{cell.number}</small>}
            {cell && <span>{cell.letter}</span>}
          </div>;
        })}
      </div>
      <div className="preview-clues">
        <div><h3>Across</h3><p><b>2</b> Three letters at the heart of this event</p><p><b>3</b> The company behind GED Week</p><p><b>4</b> This GED Week’s fiscal year</p></div>
        <div><h3>Down</h3><p><b>1</b> GED ___ · November 16–20</p></div>
      </div>
      <p className="wall-caption">A little curiosity. A lot of connections.</p>
    </aside>
  );
}
