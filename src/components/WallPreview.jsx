const words = [
  { answer: 'PROMPT', row: 1, col: 3, direction: 'down', number: 1 },
  { answer: 'REPO', row: 2, col: 3, direction: 'across', number: 2 },
  { answer: 'COMMIT', row: 4, col: 0, direction: 'across', number: 3 },
  { answer: 'MCP', row: 4, col: 2, direction: 'down', number: 4 },
  { answer: 'UPTIME', row: 6, col: 1, direction: 'across', number: 5 },
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
      <div className="wall-topline"><span>GED WEEK FY27</span><span>01 / 24</span></div>
      <h2>Tech<br /><span>Crossword Wall</span></h2>
      <div className="preview-grid" aria-hidden="true">
        {Array.from({ length: 64 }, (_, index) => {
          const row = Math.floor(index / 8);
          const cell = cells.get(`${row}-${index % 8}`);
          return <div key={index} className={cell ? 'preview-cell' : 'preview-empty'}>
            {cell?.number && <small>{cell.number}</small>}
            {cell && (row === 4 || index % 8 === 3) && <span>{cell.letter}</span>}
          </div>;
        })}
      </div>
      <div className="preview-clues">
        <div><h3>Across</h3><p><b>2</b> Where your code lives</p><p><b>3</b> A saved snapshot of your changes</p><p><b>5</b> Percent of time a system stays up</p></div>
        <div><h3>Down</h3><p><b>1</b> A single request typed to a model</p><p><b>4</b> The protocol that lets Claude plug into your tools</p></div>
      </div>
      <p className="wall-caption">A little curiosity. A lot of connections.</p>
    </aside>
  );
}
