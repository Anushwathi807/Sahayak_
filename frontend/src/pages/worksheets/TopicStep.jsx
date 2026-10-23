import { useState } from 'react'
import Button, { ButtonLink } from '../../components/ui/Button'
import { Field, Input, TextArea } from '../../components/ui/Field'
import Sheet from '../../components/ui/Sheet'
import TopicInput from '../../components/ui/TopicInput'

export default function TopicStep({ form, update, onNext }) {
  const [errors, setErrors] = useState({})

  const next = (e) => {
    e.preventDefault()
    const found = {}
    if (!form.subject.trim()) found.subject = 'Enter the subject, for example Science or Maths.'
    if (form.topics.length === 0 && !form.summary.trim()) found.topics = 'Add at least one topic, or describe what the page covers.'
    setErrors(found)
    if (Object.keys(found).length === 0) onNext()
  }

  return (
    <Sheet title="What is the worksheet about?" description="Type the topic, or scan a textbook page in the Library to fill this in.">
      <form onSubmit={next} className="flex max-w-2xl flex-col gap-5">
        <Field label="Subject" error={errors.subject}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={form.subject}
              onChange={(e) => update({ subject: e.target.value })}
              placeholder="For example: Science"
            />
          )}
        </Field>
        <TopicInput label="Topics" value={form.topics} onChange={(topics) => update({ topics })} error={errors.topics} />
        <Field label="What the lesson covers (optional)" hint="A few lines from the textbook help Sahayak match its questions to your lesson.">
          {({ id, describedBy }) => (
            <TextArea
              id={id}
              aria-describedby={describedBy}
              rows={4}
              value={form.summary}
              onChange={(e) => update({ summary: e.target.value })}
              placeholder="For example: Plants make their food in the leaves using sunlight, water and air."
            />
          )}
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" icon="arrow_forward">
            Next: grades and language
          </Button>
          <ButtonLink to="/library" variant="secondary" icon="upload_file">
            Scan a textbook page instead
          </ButtonLink>
        </div>
      </form>
    </Sheet>
  )
}
