import * as React from "react";

export type ModalProps = {
  /** Defaults to true, so a conditionally rendered <Modal> opens on mount. */
  open?: boolean;
  /** Called on Escape, a backdrop click, or the close button. */
  onClose: () => void;
  /** Shown in the header bar. */
  title: React.ReactNode;
  children: React.ReactNode;
  /** Optional action row along the bottom. */
  footer?: React.ReactNode;
  /**
   * Header cells left of the close button: buttons or links with the class
   * `su-modal__cell` (e.g. ‹ PREV / NEXT ›). Wrap their words in
   * `su-modal__cell-text` to show only the icon on phones.
   */
  actions?: React.ReactNode;
  /** "md" is 720px wide, "lg" 1200px. */
  size?: "md" | "lg";
  closeLabel?: string;
  /** Id of the element that names the dialog, when it isn't the header title. */
  labelledBy?: string;
  /** Change it to scroll the body back to the top (e.g. on prev/next). */
  scrollKey?: string | number;
};

/**
 * Centred on desktop, docked to the bottom on phones. A native <dialog>
 * opened with showModal(), so the browser handles focus trapping, Escape and
 * stacking; React only mirrors `open`.
 *
 * Same API and classes as the Modal in african-artifacts
 * (src/typescript/frontend/components/Modal.tsx). Keep the two in step.
 */
export function Modal({
  open = true,
  onClose,
  title,
  children,
  footer,
  actions,
  size = "md",
  closeLabel = "Close",
  labelledBy,
  scrollKey,
}: ModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Unmounting while open would leave the page inert in some browsers.
  React.useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  React.useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [scrollKey]);

  // Escape fires `cancel`; keep React state in charge of closing.
  const handleCancel = (event: React.SyntheticEvent) => {
    event.preventDefault();
    onClose();
  };

  // A click whose target is the <dialog> itself, outside its box, landed on
  // the backdrop.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const r = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`su-modal su-modal--${size}`}
      aria-labelledby={labelledBy ?? titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className="su-modal__head">
        <h2 className="su-modal__title" id={titleId}>
          {title}
        </h2>
        {actions}
        <button
          type="button"
          className="su-modal__cell su-modal__close"
          aria-label={closeLabel}
          title={`${closeLabel} (Esc)`}
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="su-modal__body" ref={bodyRef}>
          {children}
        </div>
      ) : null}
      {open && footer ? <div className="su-modal__foot">{footer}</div> : null}
    </dialog>
  );
}
