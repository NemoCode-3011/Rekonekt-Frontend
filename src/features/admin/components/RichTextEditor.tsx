import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { toEditorHtml } from "../../../lib/richText";

interface RichTextEditorProps {
  id?: string;
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  invalid?: boolean;
}

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  ["blockquote"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

// A Quill editor that behaves like the other form inputs: it takes a value
// (HTML) and calls onChange with new HTML. An empty editor gives "" so the
// form's "required" check still works.
export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  invalid,
}: RichTextEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const lastHtml = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Create the editor once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const editorEl = document.createElement("div");
    host.appendChild(editorEl);

    const quill = new Quill(editorEl, {
      theme: "snow",
      placeholder,
      modules: { toolbar: TOOLBAR },
    });
    quill.root.setAttribute("aria-label", label);
    if (id) quill.root.id = id;

    if (value) {
      quill.setContents(
        quill.clipboard.convert({ html: toEditorHtml(value) }),
        "silent",
      );
    }

    quill.on("text-change", () => {
      const html =
        quill.getText().trim() === ""
          ? ""
          : quill.getSemanticHTML().replace(/&nbsp;/g, " ");
      lastHtml.current = html;
      onChangeRef.current(html);
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
      host.innerHTML = ""; // removes the toolbar and editor (safe in StrictMode)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the form changes the value from outside (for example it clears after
  // creating a story), put that into the editor.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === lastHtml.current) return;
    lastHtml.current = value;
    quill.setContents(
      quill.clipboard.convert({ html: toEditorHtml(value) }),
      "silent",
    );
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="rte"
      data-invalid={invalid ? "true" : "false"}
    />
  );
}
