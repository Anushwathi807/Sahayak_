import { cx } from '../../lib/cx'

// A white sheet of card stock. Its title sits on an ink rule, like a report card section.
export default function Sheet({ title, description, action, children, className, bodyClassName, as: Tag = 'section' }) {
  return (
    <Tag className={cx('rounded-md border border-rule bg-sheet', className)}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink px-5 py-3.5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-ink-2">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cx('p-5', bodyClassName)}>{children}</div>
    </Tag>
  )
}
