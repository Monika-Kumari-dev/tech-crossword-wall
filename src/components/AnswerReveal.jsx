import { useId, useState } from "react";

export default function AnswerReveal({ answer, buttonClassName }) {
  const [visible, setVisible] = useState(false);
  const answerId = useId();

  return (
    <div className="answer-reveal">
      <button
        type="button"
        className={buttonClassName}
        aria-expanded={visible}
        aria-controls={answerId}
        onClick={() => setVisible((previous) => !previous)}
      >
        {visible ? "Hide answer" : "See answer"}
      </button>
      {visible && <p id={answerId} className="hint-text" role="status">Answer: <strong>{answer}</strong></p>}
    </div>
  );
}
