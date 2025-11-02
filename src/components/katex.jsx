import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const RenderContent = ({ html }) => {
  if (!html) return null;

  // แก้ทุกกรณีที่เจอ
  let decodedHTML = html
    .replace(/&gt;/g, '>')          // &gt; → >
    .replace(/&lt;/g, '<')          // &lt; → <
    .replace(/&nbsp;/g, ' ')        // &nbsp; → ช่องว่าง
    .replace(/\\r\\n/g, '\n')       // literal \r\n → newline
    .replace(/\r\n/g, '\n')         // เผื่อมีจริง
    .replace(/\\n/g, '\n');         // literal \n → newline

  const regex = /(?:\\\(|\\\\\()(.*?)(?:\\\)|\\\\\))/g;
  const lines = decodedHTML.split('\n');
  let globalIndex = 0;

  const renderedLines = lines.map((line, lineIdx) => {
    const parts = [];
    let lastIndex = 0;
    let match;
    let hasLatex = false;

    while ((match = regex.exec(line)) !== null) {
      hasLatex = true;
      if (match.index > lastIndex) {
        parts.push(<span key={globalIndex++}>{line.slice(lastIndex, match.index)}</span>);
      }

      let mathContent = match[1]
        .replace(/\\\\/g, '\\')
        .replace(/\\degree/g, '^{\\circ}')
        .replace(/\\prime/g, "'");

      parts.push(<InlineMath key={globalIndex++} math={mathContent} />);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      const remainingText = line.slice(lastIndex);

      if (!hasLatex && /\\[a-zA-Z]/.test(remainingText)) {
        let mathContent = remainingText
          .replace(/\\\\/g, '\\')
          .replace(/\\degree/g, '^{\\circ}')
          .replace(/\\prime/g, "'");

        parts.push(<InlineMath key={globalIndex++} math={mathContent} />);
      } else {
        parts.push(<span key={globalIndex++}>{remainingText}</span>);
      }
    }

    return (
      <div
        key={lineIdx}
        style={{
          display: 'block',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}
      >
        {parts}
      </div>
    );
  });

  return <>{renderedLines}</>;
};

export default RenderContent;