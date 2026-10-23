import { cx } from '../../lib/cx'

export default function Icon({ name, size = 20, filled = false, className }) {
  return (
    <span
      aria-hidden="true"
      className={cx('material-symbols-outlined', filled && 'filled', className)}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}
