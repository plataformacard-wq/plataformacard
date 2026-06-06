"use client";

import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  theme?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  readOnly = false,
  className = "",
  theme = "snow",
}: RichTextEditorProps) {
  return (
    <ReactQuill
      theme={theme}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={className}
    />
  );
}
