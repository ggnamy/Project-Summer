import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { answerQuestion, goBack, resetQuiz, QUESTIONS, SEASON_DATA } from './quizSlice'
import styles from './QuizPage.module.css'

/* ─────────────────────────────────────────────────────────────
   Result screen
───────────────────────────────────────────────────────────── */
function QuizResult({ result, onRetake }) {
  const data = SEASON_DATA[result.season]
  return (
    <main className={styles.resultMain}>
      <div className="container">

        <p className={styles.resultEyebrow}>✦ Your Personal Color is...</p>

        <div className={styles.resultHero} style={{ background: data.heroGradient }}>
          {/* decorative dot pattern overlay */}
          <div className={styles.heroPattern} aria-hidden="true" />
          <span className={styles.heroEmoji}>{data.emoji}</span>
          <p className={styles.resultUndertone}>{result.undertone}</p>
          <h1 className={styles.resultSeason}>{result.season}</h1>
        </div>

        <div className={styles.swatchSection}>
          <p className={styles.swatchLabel}>Your color palette</p>
          <div className={styles.swatchRow}>
            {data.colors.map((hex) => (
              <div key={hex} className={styles.swatchWrapper}>
                <div className={styles.swatch} style={{ background: hex }} />
                <span className={styles.swatchHex}>{hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.resultDescCard}>
          <p className={styles.resultDesc}>{data.description}</p>
        </div>

        <div className={styles.resultBtns}>
          <button className={styles.retakeBtn} onClick={onRetake}>↺ Retake Quiz</button>
          <Link to="/analyzer" className={styles.analyzerBtn}>Go to Analyzer →</Link>
        </div>

      </div>
    </main>
  )
}

/* ─────────────────────────────────────────────────────────────
   Quiz screen
───────────────────────────────────────────────────────────── */
export default function QuizPage() {
  const dispatch = useDispatch()
  const { currentQuestion, result } = useSelector((s) => s.quiz)

  if (result) {
    return <QuizResult result={result} onRetake={() => dispatch(resetQuiz())} />
  }

  const question  = QUESTIONS[currentQuestion]
  const remaining = QUESTIONS.length - currentQuestion

  return (
    <main className={styles.main}>

      {/* decorative background blobs */}
      <div className={styles.blobTopRight} aria-hidden="true" />
      <div className={styles.blobBottomLeft} aria-hidden="true" />

      <div className={styles.quizWrapper}>

        {/* header pill */}
        <div className={styles.quizHeaderPill}>
          <span>✦</span> Personal Color Quiz <span>✦</span>
        </div>

        {/* animated question screen (key re-mounts on change → triggers animation) */}
        <div key={currentQuestion} className={styles.questionScreen}>

          <div className={styles.qNumRow}>
            <span className={styles.qNum}>{question.qNum}</span>
            <span className={styles.qLine} aria-hidden="true" />
          </div>

          <h2 className={styles.qText}>{question.text}</h2>

          {/* Answer cards — side by side */}
          <div className={styles.choices}>
            {question.choices.map((choice) => (
              <button
                key={choice.letter}
                className={styles.choiceCard}
                onClick={() => dispatch(answerQuestion({ questionIndex: currentQuestion, value: choice.value }))}
              >
                {/* Illustration area */}
                <div
                  className={styles.cardIllustration}
                  style={{ background: choice.illustrationBg }}
                >
                  <div
                    className={styles.illustrationDots}
                    style={{
                      backgroundImage: `radial-gradient(circle, ${choice.dotColor} 1.5px, transparent 1.5px)`,
                    }}
                    aria-hidden="true"
                  />
                  <span className={styles.cardEmoji}>{choice.emoji}</span>
                </div>

                {/* Text area */}
                <div className={styles.cardBody}>
                  <span className={styles.cardLetter}>{choice.letter}</span>
                  <div className={styles.cardContent}>
                    <span className={styles.cardText}>{choice.text}</span>
                    {choice.hint && <span className={styles.cardHint}>{choice.hint}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Progress + back */}
          <div className={styles.footer}>
            <div className={styles.progress}>
              <div className={styles.dots}>
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      styles.dot,
                      i === currentQuestion ? styles.dotActive : '',
                      i < currentQuestion   ? styles.dotDone   : '',
                    ].join(' ')}
                  />
                ))}
              </div>
              <span className={styles.remaining}>
                {remaining} question{remaining !== 1 ? 's' : ''} remaining
              </span>
            </div>

            {currentQuestion > 0 && (
              <button className={styles.backBtn} onClick={() => dispatch(goBack())}>
                ← Go back to previous question
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
