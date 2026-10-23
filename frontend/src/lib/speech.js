// Browser-native speech: no API calls. Voice input needs Chrome; read-aloud needs installed voices.

const LANGUAGE_CODES = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Marathi: 'mr-IN',
  Tamil: 'ta-IN',
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

const ERROR_MESSAGES = {
  'no-speech': 'No speech was heard. Tap the microphone and start speaking right away.',
  'not-allowed': 'Microphone access is blocked. Allow the microphone for this site and try again.',
  'audio-capture': 'No microphone was found on this device.',
  network: 'The speech service could not be reached. Voice input needs Google Chrome and an internet connection.',
  aborted: 'Voice input was stopped.',
}

// onError is called exactly once when no result arrives, so a "listening" state never sticks.
export function startListening(language, onResult, onError) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Recognition) {
    onError('Voice input works in Google Chrome. Type your request instead.')
    return () => {}
  }

  const recognition = new Recognition()
  recognition.lang = LANGUAGE_CODES[language] || 'en-IN'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  let settled = false
  recognition.onresult = (event) => {
    settled = true
    onResult(event.results[0][0].transcript)
  }
  recognition.onerror = (event) => {
    settled = true
    onError(ERROR_MESSAGES[event.error] || `Voice input failed (${event.error}). Try again.`)
  }
  recognition.onend = () => {
    if (!settled) {
      settled = true
      onError(ERROR_MESSAGES['no-speech'])
    }
  }

  try {
    recognition.start()
  } catch {
    settled = true
    onError('Voice input could not start. Try again.')
  }
  return () => recognition.stop()
}

function getVoicesAsync() {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }
    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout)
      resolve(window.speechSynthesis.getVoices())
    }
  })
}

// Resolves when speech ends; calls onError when nothing audible can be produced.
export async function readAloud(text, language, { onError, onEnd } = {}) {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Read-aloud is not supported in this browser.')
    return
  }
  window.speechSynthesis.cancel()

  const langCode = LANGUAGE_CODES[language] || 'en-IN'
  const voices = await getVoicesAsync()

  if (voices.length === 0) {
    onError?.(
      'This device has no text-to-speech voices installed. On Linux install a speech engine (espeak-ng with speech-dispatcher), or try Chrome on Windows or Android.'
    )
    return
  }

  const voice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.split('-')[0]))
  if (!voice) {
    onError?.(`No ${language} voice is installed on this device. Try English, or another device.`)
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langCode
  utterance.voice = voice
  utterance.onend = () => onEnd?.()
  utterance.onerror = (event) => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      onError?.(`Audio could not play (${event.error}).`)
    }
    onEnd?.()
  }
  window.speechSynthesis.speak(utterance)
}

export function stopReading() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel()
}
