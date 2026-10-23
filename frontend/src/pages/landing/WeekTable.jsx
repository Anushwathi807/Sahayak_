import SubjectInk from '../../components/ui/SubjectInk'

// Every claim sits beside a sample of the screen that delivers it. Samples are labelled as samples.
function PlanSample() {
  return (
    <div className="text-sm">
      <SubjectInk subject="Science" className="font-semibold">
        Science · Monday
      </SubjectInk>
      <ul className="mt-1.5 flex flex-col gap-0.5">
        <li>
          <span className="font-semibold">Grade 1:</span> Direct teaching
        </li>
        <li>
          <span className="font-semibold">Grade 2:</span> Group activity
        </li>
      </ul>
    </div>
  )
}

function StorySample() {
  return (
    <p className="text-sm leading-relaxed" lang="hi">
      गाँव के तालाब में पानी कम हो रहा था। मीना और रवि ने तय किया कि वे हर घर में बारिश का पानी बचाने की बात करेंगे।
    </p>
  )
}

function DiagramSample() {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      {['Seed', 'Sprout', 'Sapling', 'Tree'].map((s, i) => (
        <li key={s} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ink-3">then</span>}
          <span className="rounded-sm border border-rule px-2 py-0.5">
            <span className="font-display font-bold">{i + 1}</span> {s}
          </span>
        </li>
      ))}
    </ol>
  )
}

function WorksheetSample() {
  return (
    <div className="text-sm">
      <p className="flex justify-between gap-3">
        <span>
          <span className="font-display font-bold">3.</span> Asha ate 1 of 4 equal pieces of a roti. What fraction did she eat?
        </span>
        <span className="font-display font-semibold text-ink-2">[1]</span>
      </p>
      <p className="mt-1 pl-4 text-ink-2">(a) 1/2 &nbsp; (b) 1/4 &nbsp; (c) 3/4 &nbsp; (d) 1/3</p>
    </div>
  )
}

function MarksSample() {
  const rows = [
    ['Asha', '9'],
    ['Ravi', '8'],
    ['Meena', ''],
  ]
  return (
    <div className="text-sm">
      <p className="mb-1.5 font-semibold">Fractions quiz, out of 10</p>
      <ul className="flex flex-col gap-1">
        {rows.map(([name, marks]) => (
          <li key={name} className="flex items-center justify-between gap-3">
            <span>{name}</span>
            <span className="inline-flex h-7 w-14 items-center justify-end rounded-sm border border-field bg-sheet px-2 font-semibold tabular-nums text-entry">
              {marks}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ROWS = [
  {
    step: 'Plan',
    ask: 'Science on Monday for grades 1 and 2: the water cycle.',
    gives: 'A weekly plan that rotates direct teaching, worksheets, group work and peer reading fairly across grades.',
    sample: <PlanSample />,
  },
  {
    step: 'Prepare',
    ask: 'Tell a story about saving water in our village.',
    gives: 'A story set in local life, in your language, that you can simplify, translate, edit or read aloud.',
    sample: <StorySample />,
  },
  {
    step: 'Teach',
    ask: 'Show how a seed grows into a tree.',
    gives: 'A labelled blackboard diagram with each stage in order, and a note on how to draw it.',
    sample: <DiagramSample />,
  },
  {
    step: 'Assess',
    ask: 'Fractions for grades 3, 4 and 5: five multiple choice, three short answers.',
    gives: 'One worksheet per grade with an answer key, downloaded as PDF or Word.',
    sample: <WorksheetSample />,
  },
  {
    step: 'Track',
    ask: 'Marks for the fractions quiz.',
    gives: "Type a whole quiz's marks in one table. Averages move into grade bands at once, weakest first.",
    sample: <MarksSample />,
  },
]

export default function WeekTable() {
  return (
    <>
      <ol className="flex flex-col md:hidden">
        {ROWS.map((row) => (
          <li key={row.step} className="flex flex-col gap-2 border-b border-rule py-5 first:border-t first:border-t-ink last:border-b-0">
            <h3 className="font-display text-xl font-semibold">{row.step}</h3>
            <p className="text-base text-ink-2">
              <span className="font-semibold text-ink">You ask: </span>"{row.ask}"
            </p>
            <p className="text-base">{row.gives}</p>
            <div className="rounded-sm border border-rule bg-ground px-3.5 py-3">{row.sample}</div>
          </li>
        ))}
      </ol>
      <WideTable />
    </>
  )
}

function WideTable() {
  return (
    <div className="hidden md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
            <th className="w-28 py-2.5 pr-4">Step</th>
            <th className="w-64 py-2.5 pr-4">You ask</th>
            <th className="py-2.5 pr-4">Sahayak gives you</th>
            <th className="w-80 py-2.5">Sample on screen</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.step} className="border-b border-rule align-top last:border-b-0">
              <th scope="row" className="py-4 pr-4 font-display text-lg font-semibold">
                {row.step}
              </th>
              <td className="py-4 pr-4 text-base text-ink-2">"{row.ask}"</td>
              <td className="py-4 pr-4 text-base">{row.gives}</td>
              <td className="py-4">
                <div className="rounded-sm border border-rule bg-ground px-3.5 py-3">{row.sample}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
