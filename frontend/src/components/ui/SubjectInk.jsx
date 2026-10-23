import { subjectInk } from '../../lib/subjects'

export default function SubjectInk({ subject, children, className }) {
  return (
    <span className={className ? `inline-flex items-center gap-2 ${className}` : 'inline-flex items-center gap-2'}>
      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: subjectInk(subject) }} />
      {children ?? subject}
    </span>
  )
}
