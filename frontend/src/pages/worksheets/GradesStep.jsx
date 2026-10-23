import { useState } from 'react'
import Button from '../../components/ui/Button'
import GradePicker from '../../components/ui/GradePicker'
import LanguageSelect from '../../components/ui/LanguageSelect'
import Sheet from '../../components/ui/Sheet'

export default function GradesStep({ form, update, onBack, onNext }) {
  const [error, setError] = useState('')

  const next = () => {
    if (form.grades.length === 0) {
      setError('Choose at least one grade.')
      return
    }
    onNext()
  }

  return (
    <Sheet title="Which grades, in which language?" description="Sahayak writes a separate worksheet for each grade, pitched to that grade.">
      <div className="flex max-w-2xl flex-col gap-6">
        <GradePicker
          label="Grades"
          value={form.grades}
          onChange={(grades) => {
            setError('')
            update({ grades })
          }}
          error={error}
        />
        <div className="max-w-xs">
          <LanguageSelect label="Worksheet language" value={form.language} onChange={(language) => update({ language })} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon="arrow_back" onClick={onBack}>
            Back
          </Button>
          <Button icon="arrow_forward" onClick={next}>
            Next: question mix
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
