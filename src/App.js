import "./styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import Section from "./Section";

export default function App() {
  const [sections, setSections] = useState([{ id: Date.now() }]);

  return (
    <div>
      {sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
      <button onClick={() => setSections([...sections, { id: Date.now() }])}>
        New Section
      </button>
    </div>
  );
}
