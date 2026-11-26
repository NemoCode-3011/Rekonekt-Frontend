import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { toEditorHtml } from "../../../lib/richText";
import { toYouTubeEmbedUrl } from "../../../lib/youtube";
import { useAuth } from "../../auth/auth-context";
import { uploadAdminImage } from "../api/media";

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
  ["link", "image", "video"],
  ["clean"],
];

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type Notify = (message: string, tone?: "error") => void;

// Quill would normally paste or drop a picture into the text as base64, which
// makes a story huge. Instead every picture is uploaded first, and only its
// web address goes into the text.
async function uploadAndInsert(
  quill: Quill,
  files: File[],
  index: number,
  notify: Notify,
  alt?: string,
) {
  let position = index;

  for (const file of files) {
    if (!IMAGE_TYPES.includes(file.type)) {
      notify("Choose a JPEG, PNG or WebP image.", "error");
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify("Images must be 10 MB or smaller.", "error");
      continue;
    }

    const name = file.name.replace(/\.[^.]+$/, "").trim();

    try {
      notify("Uploading image…");
      const media = await uploadAdminImage(
        file,
        { title: name.length >= 2 ? name : "Story image" },
        () => undefined,
      );
      quill.insertEmbed(position, "image", media.file_url, "user");
      if (alt) quill.formatText(position, 1, { alt }, "user");
      position += 1;
      quill.setSelection(position, 0, "silent");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Image upload failed.",
        "error",
      );
    }
  }
}

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
  const { showToast } = useAuth();
  const hostRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const notifyRef = useRef<Notify>(showToast);
  const lastHtml = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    notifyRef.current = showToast;
  });

  // Create the editor once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const editorEl = document.createElement("div");
    host.appendChild(editorEl);

    const notify: Notify = (message, tone) => notifyRef.current(message, tone);

    function chooseImage() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = IMAGE_TYPES.join(",");
      input.onchange = () => {
        const file = input.files?.[0];
        const current = quillRef.current;
        if (!file || !current) return;

        const alt =
          window
            .prompt("Describe this picture for people who can't see it (optional)")
            ?.trim() || undefined;
        const range = current.getSelection(true);
        void uploadAndInsert(current, [file], range.index, notify, alt);
      };
      input.click();
    }

    function addVideo() {
      const current = quillRef.current;
      if (!current) return;

      const link = window.prompt("Paste a YouTube link");
      if (!link) return;

      const embedUrl = toYouTubeEmbedUrl(link);
      if (!embedUrl) {
        notify("That doesn't look like a YouTube link.", "error");
        return;
      }

      const range = current.getSelection(true);
      current.insertEmbed(range.index, "video", embedUrl, "user");
      current.setSelection(range.index + 1, 0, "silent");
    }

    const quill = new Quill(editorEl, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: TOOLBAR,
          handlers: { image: chooseImage, video: addVideo },
        },
        // Pictures pasted or dropped into the text are uploaded too.
        uploader: {
          handler: (range: { index: number }, files: File[]) => {
            const current = quillRef.current;
            if (current) void uploadAndInsert(current, files, range.index, notify);
          },
        },
      },
    });
    quill.root.setAttribute("aria-label", label);
    if (id) quill.root.id = id;

    // Pasted web pages can carry base64 pictures. Leave those out.
    quill.clipboard.addMatcher("img", (node, delta) => {
      const src = node instanceof Element ? (node.getAttribute("src") ?? "") : "";
      // slice(0, 0) is an empty copy: the picture is dropped, the rest stays.
      return /^https?:\/\//i.test(src) ? delta : delta.slice(0, 0);
    });

    if (value) {
      quill.setContents(
        quill.clipboard.convert({ html: toEditorHtml(value) }),
        "silent",
      );
    }

    quill.on("text-change", () => {
      // A story that is only a picture or a video still counts as filled in.
      const hasEmbed = quill
        .getContents()
        .ops.some((op) => typeof op.insert === "object");
      const html =
        quill.getText().trim() === "" && !hasEmbed
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