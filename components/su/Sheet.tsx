import * as React from "react";

export type SheetProps = {
  open: boolean;
  /** Called on Escape, backdrop click, or the close button. */
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Optional action row along the bottom. */
  footer?: React.ReactNode;
  closeLabel?: string;
};

/**
 * Modal on desktop, bottom sheet on phone. A native <dialog> shown with
 * showModal(), so the browser handles focus trapping, Escape and stacking;
 * React only mirrors `open` onto it.
 */
export function Sheet({ open, onClose, title, children, footer, closeLabel = "Close" }: SheetProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape fires `cancel`; keep React state in charge of closing.
  const onCancel = (event: React.SyntheticEvent) => {
    event.preventDefault();
    onClose();
  };

  // A click whose target is the <dialog> itself landed on the backdrop.
  const onClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const r = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) onClose();
  };

  return (
    <dialog ref={ref} className="su-sheet" aria-labelledby={titleId} onCancel={onCancel} onClick={onClick}>
      <div className="su-sheet__head">
        <h2 className="su-sheet__title" id={titleId}>
          {title}
        </h2>
        <button type="button" className="su-sheet__close" aria-label={closeLabel} onClick={onClose}>
          ×
        </button>
      </div>
      {open ? <div className="su-sheet__body">{children}</div> : null}
      {open && footer ? <div className="su-sheet__foot">{footer}</div> : null}
    </dialog>
  );
}
