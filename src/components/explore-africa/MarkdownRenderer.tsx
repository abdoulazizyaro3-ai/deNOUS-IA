import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by newlines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKeyCounter = 0;

  // Helper to parse inline **bold**
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-stone-900 bg-amber-500/10 px-1 rounded-sm">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Handle bullet items
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      const listContent = trimmedLine.substring(2);
      currentList.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-stone-700 text-sm font-sans mb-1.5 leading-relaxed">
          <span className="text-amber-500 shrink-0 select-none mt-1.5 font-bold">✦</span>
          <span className="flex-1">{parseInlineStyles(listContent)}</span>
        </li>
      );
    } else {
      // If we were building a list, push it now and clear
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${listKeyCounter++}`} className="space-y-1 my-3 pl-1">
            {currentList}
          </ul>
        );
        currentList = [];
      }

      // Handle headers
      if (trimmedLine.startsWith("### ")) {
        elements.push(
          <h4 key={`h3-${index}`} className="font-sans font-semibold text-base text-stone-800 mt-5 mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-xs" />
            {trimmedLine.substring(4)}
          </h4>
        );
      } else if (trimmedLine.startsWith("## ")) {
        elements.push(
          <h3 key={`h2-${index}`} className="font-sans font-bold text-lg text-amber-900 mt-6 mb-3 border-b border-stone-200/50 pb-1.5">
            {trimmedLine.substring(3)}
          </h3>
        );
      } else if (trimmedLine.startsWith("# ")) {
        elements.push(
          <h2 key={`h1-${index}`} className="font-sans font-extrabold text-xl text-stone-900 mt-8 mb-4">
            {trimmedLine.substring(2)}
          </h2>
        );
      } else if (trimmedLine === "") {
        // Empty line acts as paragraph break (handled naturally by blocks)
      } else {
        // Plain text paragraph
        elements.push(
          <p key={`p-${index}`} className="text-stone-600 text-sm font-sans leading-relaxed mb-3">
            {parseInlineStyles(trimmedLine)}
          </p>
        );
      }
    }
  });

  // Collect any remaining list items at the end of file
  if (currentList.length > 0) {
    elements.push(
      <ul key={`ul-${listKeyCounter++}`} className="space-y-1 my-3 pl-1">
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1.5 text-stone-800">{elements}</div>;
}
