import { useEffect, useRef } from 'react'

// Native <dialog>: focus is trapped and Escape closes it. The scrim is solid, never blurred.
export default function Dialog({ open, onClose, labelledBy, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="sheet-rise m-auto max-h-[calc(100vh_-_2rem)] w-[min(1080px,calc(100vw_-_2rem))] max-w-none overflow-hidden rounded-md border border-ink bg-sheet p-0 text-ink shadow-[0_24px_48px_-16px_rgba(23,35,58,0.4)]"
    >
      {open && (
        <div className="flex max-h-[calc(100vh_-_2rem)] flex-col">
          <div aria-hidden="true" className="bg-masthead h-2 shrink-0" />
          {children}
        </div>
      )}
    </dialog>
  )
}
