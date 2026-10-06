import { motion, useReducedMotion } from "framer-motion";
import { useModalDialog } from "../useModalDialog";
import SubjectDetails from "./SubjectDetails";
import type { DiscoverySubject } from "./types";

interface DiscoveryDrawerProps {
  subject: DiscoverySubject;
  onClose: () => void;
}

function titleOf(subject: DiscoverySubject) {
  switch (subject.kind) {
    case "person":
      return subject.person.name;
    case "place":
      return subject.place.name;
    case "event":
      return subject.event.title;
    case "artifact":
      return subject.artifact.title;
    case "story":
      return subject.story.title;
  }
}

// A panel that slides in from the right with the details of whatever the
// visitor selected.
function DiscoveryDrawer({ subject, onClose }: DiscoveryDrawerProps) {
  const { dialogRef, close, closeOnBackdropClick } = useModalDialog();
  const reduce = useReducedMotion();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={closeOnBackdropClick}
      aria-label={titleOf(subject)}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-xl bg-transparent p-0 backdrop:bg-ink/60"
    >
      <motion.div
        initial={reduce ? false : { x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-full flex-col overflow-y-auto bg-ivory text-ink"
      >
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={close}
            className="px-3 py-2 font-sans text-body-s text-muted hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="px-6 pb-16 md:px-10">
          <SubjectDetails subject={subject} />
        </div>
      </motion.div>
    </dialog>
  );
}

export default DiscoveryDrawer;