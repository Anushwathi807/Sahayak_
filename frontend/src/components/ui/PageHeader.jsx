export default function PageHeader({ title, description, actions }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-ink pb-4">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1.5 text-base text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
    </header>
  )
}
