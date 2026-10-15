import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db, googleProvider } from './firebase'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('')
  const [requestText, setRequestText] = useState('')
  const [intentResult, setIntentResult] = useState(null)
  const [routing, setRouting] = useState(false)
  const [contentResult, setContentResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [textbookResult, setTextbookResult] = useState(null)
  const [readingPage, setReadingPage] = useState(false)
  const [selectedGrades, setSelectedGrades] = useState([])
  const [worksheetLanguage, setWorksheetLanguage] = useState('English')
  const [worksheetResult, setWorksheetResult] = useState(null)
  const [generatingWorksheets, setGeneratingWorksheets] = useState(false)
  const [requestMode, setRequestMode] = useState('auto')
  const [requestLanguage, setRequestLanguage] = useState('English')
  const [specRows, setSpecRows] = useState([])
  const [newSpecType, setNewSpecType] = useState('mcq')
  const [newSpecMarks, setNewSpecMarks] = useState(2)
  const [newSpecCount, setNewSpecCount] = useState(5)

  const QUESTION_TYPE_LABELS = {
    mcq: 'Multiple Choice',
    true_false: 'True/False',
    fill_blank: 'Fill in the Blank',
    short_answer: 'Short Answer',
    long_answer: 'Long Answer',
    match_the_following: 'Match the Following',
    diagram_based: 'Diagram Based',
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        const teacherRef = doc(db, 'teachers', firebaseUser.uid)
        const snap = await getDoc(teacherRef)
        if (!snap.exists()) {
          await setDoc(teacherRef, {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            createdAt: serverTimestamp(),
          })
        }
      }
    })
    return unsubscribe
  }, [])

  const handleSignIn = () => signInWithPopup(auth, googleProvider)
  const handleSignOut = () => signOut(auth)

  const testBackend = async () => {
    setBackendStatus('checking...')
    const token = await user.getIdToken()
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setBackendStatus(`error: ${res.status}`)
      return
    }
    const data = await res.json()
    setBackendStatus(`backend confirmed: ${data.email}`)
  }

  const authedPost = async (path, body) => {
    const token = await user.getIdToken()
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  const handleTextbookUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReadingPage(true)
    setTextbookResult(null)
    try {
      const token = await user.getIdToken()
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/read-textbook-page`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.status === 503) {
        setTextbookResult({
          error: "Sahayak's AI is busy right now — please try again in a few seconds.",
        })
        return
      }
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        setTextbookResult({ error: detail.detail || `Something went wrong (error ${res.status}).` })
        return
      }
      setTextbookResult(await res.json())
    } catch {
      setTextbookResult({ error: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setReadingPage(false)
      event.target.value = ''
    }
  }

  const addSpecRow = () => {
    setSpecRows((prev) => [
      ...prev,
      { type: newSpecType, marks: Number(newSpecMarks), count: Number(newSpecCount) },
    ])
  }

  const removeSpecRow = (index) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleGrade = (grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade].sort()
    )
  }

  const downloadWorksheet = async (worksheet, format, answers) => {
    const token = await user.getIdToken()
    const res = await fetch(`${API_BASE}/export/worksheet/${format}?answers=${answers}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(worksheet),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = answers ? 'answer-key' : 'worksheet'
    a.download = `grade-${worksheet.grade}-${suffix}.${format === 'pdf' ? 'pdf' : 'docx'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateWorksheets = async () => {
    if (!textbookResult || selectedGrades.length === 0) return
    setGeneratingWorksheets(true)
    setWorksheetResult(null)
    try {
      const res = await authedPost('/generate/worksheets', {
        subject: textbookResult.subject,
        topics: textbookResult.topics,
        summary: textbookResult.summary,
        grades: selectedGrades,
        language: worksheetLanguage,
        spec: specRows,
      })
      if (res.status === 503) {
        setWorksheetResult({
          error: "Sahayak's AI is busy right now — please try again in a few seconds.",
        })
        return
      }
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        setWorksheetResult({ error: detail.detail || `Something went wrong (error ${res.status}).` })
        return
      }
      setWorksheetResult(await res.json())
    } catch {
      setWorksheetResult({ error: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setGeneratingWorksheets(false)
    }
  }

  const runGenerator = async (path, language) => {
    setGenerating(true)
    setContentResult(null)
    try {
      const genRes = await authedPost(path, { text: requestText, language })
      if (genRes.status === 503) {
        setContentResult({
          error: "Sahayak's AI is busy right now — please try again in a few seconds.",
        })
        return
      }
      if (!genRes.ok) {
        setContentResult({ error: `Something went wrong (error ${genRes.status}).` })
        return
      }
      setContentResult(await genRes.json())
    } catch {
      setContentResult({ error: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setGenerating(false)
    }
  }

  const submitRequest = async (event) => {
    event.preventDefault()
    if (!requestText.trim()) return
    setIntentResult(null)
    setContentResult(null)

    if (requestMode === 'diagram') {
      await runGenerator('/generate/visual-aid', requestLanguage)
      return
    }
    if (requestMode === 'text') {
      await runGenerator('/generate/knowledge-base', requestLanguage)
      return
    }

    setRouting(true)
    try {
      const res = await authedPost('/route', { text: requestText })
      if (res.status === 503) {
        setIntentResult({
          error: "Sahayak's AI is busy right now — please try again in a few seconds.",
        })
        return
      }
      if (!res.ok) {
        setIntentResult({ error: `Something went wrong (error ${res.status}). Please try again.` })
        return
      }
      const intent = await res.json()
      setIntentResult(intent)

      const generatorPath =
        intent.category === 'hyperlocal_content'
          ? '/generate/hyperlocal'
          : intent.category === 'knowledge_base'
            ? '/generate/knowledge-base'
            : intent.category === 'visual_aid'
              ? '/generate/visual-aid'
              : null

      if (generatorPath) {
        await runGenerator(generatorPath, intent.language)
      }
    } catch {
      setIntentResult({ error: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setRouting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800">Sahayak</h1>
      {user ? (
        <>
          <p className="text-gray-600">Signed in as {user.displayName}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={testBackend}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Test backend connection
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Sign out
            </button>
          </div>
          {backendStatus && <p className="text-sm text-gray-500">{backendStatus}</p>}

          <form onSubmit={submitRequest} className="flex flex-col gap-2 w-80">
            <div className="flex gap-2">
              <select
                value={requestMode}
                onChange={(e) => setRequestMode(e.target.value)}
                className="border rounded p-2 text-sm flex-1"
              >
                <option value="auto">Auto-detect</option>
                <option value="text">Force: Text Explanation</option>
                <option value="diagram">Force: Diagram/Image</option>
              </select>
              {requestMode !== 'auto' && (
                <select
                  value={requestLanguage}
                  onChange={(e) => setRequestLanguage(e.target.value)}
                  className="border rounded p-2 text-sm"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Tamil</option>
                </select>
              )}
            </div>
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Type a request, any language..."
              className="border rounded p-2 text-sm"
              rows={3}
            />
            <button
              type="submit"
              disabled={routing || generating}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {routing ? 'Routing...' : generating ? 'Generating content...' : 'Submit request'}
            </button>
          </form>

          {intentResult?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 w-80">
              {intentResult.error}
            </p>
          )}

          {intentResult && !intentResult.error && intentResult.category === 'unclear' && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 w-80">
              Sahayak couldn't tell what you need. Try rephrasing — e.g. mention a story, a
              question, a worksheet, a drawing, or a lesson plan.
            </p>
          )}

          {intentResult &&
            !intentResult.error &&
            intentResult.category !== 'unclear' &&
            intentResult.category !== 'hyperlocal_content' &&
            intentResult.category !== 'knowledge_base' &&
            intentResult.category !== 'visual_aid' && (
              <pre className="text-xs bg-white border rounded p-3 w-80 whitespace-pre-wrap">
                {JSON.stringify(intentResult, null, 2)}
              </pre>
            )}

          {contentResult?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 w-80">
              {contentResult.error}
            </p>
          )}

          {contentResult && !contentResult.error && 'title' in contentResult && (
            <div className="text-sm bg-white border rounded p-4 w-80 text-left">
              <p className="font-semibold mb-2">{contentResult.title}</p>
              <p className="whitespace-pre-wrap">{contentResult.content}</p>
              <p className="text-xs text-gray-400 mt-2">{contentResult.language}</p>
            </div>
          )}

          {contentResult && !contentResult.error && 'explanation' in contentResult && (
            <div className="text-sm bg-white border rounded p-4 w-80 text-left">
              <p className="font-semibold mb-1">Explanation</p>
              <p className="whitespace-pre-wrap mb-3">{contentResult.explanation}</p>
              <p className="font-semibold mb-1">Analogy</p>
              <p className="whitespace-pre-wrap">{contentResult.analogy}</p>
              <p className="text-xs text-gray-400 mt-2">{contentResult.language}</p>
            </div>
          )}

          {contentResult && !contentResult.error && 'svg' in contentResult && (
            <div className="text-sm bg-white border rounded p-4 w-80 text-left">
              <div
                className="flex justify-center"
                // biome-ignore lint: trusted content, generated by our own backend
                dangerouslySetInnerHTML={{ __html: contentResult.svg }}
              />
              <p className="text-xs text-gray-600 mt-2 italic">{contentResult.caption}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 w-80 border-t pt-4 mt-2">
            <p className="text-sm text-gray-600">Upload a textbook page photo:</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleTextbookUpload}
              disabled={readingPage}
              className="text-sm"
            />
            {readingPage && <p className="text-sm text-gray-500">Reading page...</p>}
          </div>

          {textbookResult?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 w-80">
              {textbookResult.error}
            </p>
          )}

          {textbookResult && !textbookResult.error && (
            <div className="text-sm bg-white border rounded p-4 w-80 text-left">
              <p className="font-semibold mb-1">Subject: {textbookResult.subject}</p>
              <p className="font-semibold mb-1 mt-2">Topics</p>
              <ul className="list-disc list-inside mb-2">
                {textbookResult.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <p className="font-semibold mb-1">Summary</p>
              <p className="whitespace-pre-wrap">{textbookResult.summary}</p>
            </div>
          )}

          {textbookResult && !textbookResult.error && (
            <div className="flex flex-col gap-2 w-80 border-t pt-4 mt-2">
              <p className="text-sm text-gray-600">Grades in your classroom:</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((grade) => (
                  <label key={grade} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes(grade)}
                      onChange={() => toggleGrade(grade)}
                    />
                    Grade {grade}
                  </label>
                ))}
              </div>
              <select
                value={worksheetLanguage}
                onChange={(e) => setWorksheetLanguage(e.target.value)}
                className="border rounded p-2 text-sm"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Tamil</option>
              </select>

              <p className="text-sm text-gray-600 mt-2">Choose the worksheet composition:</p>
              <div className="flex gap-1 items-center">
                <select
                  value={newSpecType}
                  onChange={(e) => setNewSpecType(e.target.value)}
                  className="border rounded p-1 text-xs flex-1"
                >
                  {Object.entries(QUESTION_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={newSpecMarks}
                  onChange={(e) => setNewSpecMarks(e.target.value)}
                  className="border rounded p-1 text-xs w-14"
                  title="Marks per question"
                />
                <span className="text-xs">marks ×</span>
                <input
                  type="number"
                  min="1"
                  value={newSpecCount}
                  onChange={(e) => setNewSpecCount(e.target.value)}
                  className="border rounded p-1 text-xs w-14"
                  title="Number of questions"
                />
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="px-2 py-1 text-xs bg-gray-700 text-white rounded"
                >
                  Add
                </button>
              </div>

              {specRows.length > 0 && (
                <ul className="text-xs bg-gray-100 rounded p-2 space-y-1">
                  {specRows.map((row, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>
                        {row.count} × {QUESTION_TYPE_LABELS[row.type]} ({row.marks} marks each)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSpecRow(i)}
                        className="text-red-600 ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={generateWorksheets}
                disabled={selectedGrades.length === 0 || specRows.length === 0 || generatingWorksheets}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              >
                {generatingWorksheets ? 'Generating worksheets...' : 'Generate Worksheets'}
              </button>
            </div>
          )}

          {worksheetResult?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 w-80">
              {worksheetResult.error}
            </p>
          )}

          {worksheetResult?.worksheets?.map((ws) => (
            <div key={ws.grade} className="text-sm bg-white border rounded p-4 w-80 text-left">
              <p className="font-semibold mb-1">
                Grade {ws.grade}: {ws.title}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {ws.instructions} · Total marks: {ws.total_marks}
              </p>
              <ol className="list-decimal list-inside space-y-3">
                {ws.questions.map((q, i) => (
                  <li key={i}>
                    <span className="text-xs text-gray-400">
                      [{q.type.replace(/_/g, ' ')}, {q.marks}m]
                    </span>{' '}
                    {q.question}
                    {q.options && (
                      <ul className="list-disc list-inside ml-4 text-xs text-gray-600">
                        {q.options.map((opt) => (
                          <li key={opt}>{opt}</li>
                        ))}
                      </ul>
                    )}
                    {q.match_pairs && (
                      <ul className="list-disc list-inside ml-4 text-xs text-gray-600">
                        {q.match_pairs.map((pair) => (
                          <li key={pair.left}>
                            {pair.left} ↔ {pair.right}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.diagram_svg && (
                      <div
                        className="ml-4 my-1 w-40"
                        // biome-ignore lint: trusted content, generated by our own backend
                        dangerouslySetInnerHTML={{ __html: q.diagram_svg }}
                      />
                    )}
                    {!q.diagram_svg && q.diagram_description && (
                      <p className="text-xs text-gray-500 italic ml-4">
                        [Diagram: {q.diagram_description}]
                      </p>
                    )}
                    <div className="text-xs text-gray-400 ml-4">Answer: {q.answer}</div>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => downloadWorksheet(ws, 'pdf', false)}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded"
                >
                  Worksheet (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => downloadWorksheet(ws, 'docx', false)}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded"
                >
                  Worksheet (Word)
                </button>
                <button
                  type="button"
                  onClick={() => downloadWorksheet(ws, 'pdf', true)}
                  className="px-3 py-1 text-xs bg-amber-700 text-white rounded"
                >
                  Answer Key (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => downloadWorksheet(ws, 'docx', true)}
                  className="px-3 py-1 text-xs bg-amber-700 text-white rounded"
                >
                  Answer Key (Word)
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  )
}

export default App
