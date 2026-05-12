import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { answerQuestion, goBack, resetQuiz, QUESTIONS, SEASON_DATA } from './quizSlice'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './QuizPage.module.css'

const IMAGE_MAP = {
  '0-A': { src: '/images/quiz/vein-green.png',   bg: '#F0FAF0' },
  '0-B': { src: '/images/quiz/vein-purple.png',  bg: '#F5F0FA' },
  '1-A': { src: '/images/quiz/skin-warm.png',    bg: '#FFF3E8' },
  '1-B': { src: '/images/quiz/skin-cool.png',    bg: '#FFF0F3' },
  '2-A': { src: '/images/quiz/sun-tan.png',      bg: '#FFFBE8' },
  '2-B': { src: '/images/quiz/sun-red.png',      bg: '#FFF0EE' },
  '3-A': { src: '/images/quiz/depth-dark.png',   bg: '#FBF5EE' },
  '3-B': { src: '/images/quiz/depth-light.png',  bg: '#FFF8F3' },
  '4-A': { src: '/images/quiz/hair-black.png',   bg: '#F5F5F7' },
  '4-B': { src: '/images/quiz/hair-brown.png',   bg: '#FDF6EE' },
}

const SEASON_HERO = {
  Spring: '/images/seasons/spring.png',
  Summer: '/images/seasons/summer.png',
  Autumn: '/images/seasons/autumn.png',
  Winter: '/images/seasons/winter.png',
}

const SEASON_OVERLAY = {
  Spring: 'linear-gradient(to bottom, transparent 25%, rgba(230,160,50,0.90) 100%)',
  Summer: 'linear-gradient(to bottom, transparent 25%, rgba(90,60,160,0.90) 100%)',
  Autumn: 'linear-gradient(to bottom, transparent 25%, rgba(130,45,10,0.90) 100%)',
  Winter: 'linear-gradient(to bottom, transparent 25%, rgba(12,38,115,0.90) 100%)',
}

/* ─────────────────────────────────────────────────────────────
   Result screen
───────────────────────────────────────────────────────────── */
function QuizResult({ result, onRetake }) {
  const data = SEASON_DATA[result.season]
  const { t } = useTranslation()

  return (
    <main className={styles.resultPage}>
      <div className={styles.confettiContainer} aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className={styles.confettiPiece} />
        ))}
      </div>

      <div className="container">
        <div className={styles.resultContent}>

          <p className={styles.resultEyebrow}>{t('result_eyebrow')}</p>

          <div className={styles.resultHero}>
            <img
              src={SEASON_HERO[result.season]}
              alt={result.season}
              className={styles.resultHeroImg}
            />
            <div
              className={styles.resultHeroOverlay}
              style={{ background: SEASON_OVERLAY[result.season] }}
              aria-hidden="true"
            />
            <div className={styles.resultHeroText}>
              <span className={styles.resultUndertoneBadge}>{result.undertone}</span>
              <h1 className={styles.resultSeasonName}>{result.season}</h1>
            </div>
          </div>

          <div className={styles.descQuote}>
            <p className={styles.descText}>{data.description}</p>
          </div>

          <div className={styles.resultBtns}>
            <button className={styles.retakeBtn} onClick={onRetake}>{t('btn_retake')}</button>
            <Link to="/analyzer" className={styles.analyzerBtn}>{t('btn_go_analyzer')}</Link>
          </div>

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
  const [isExiting, setIsExiting] = useState(false)
  const { t } = useTranslation()

  const handleAnswer = useCallback((value) => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => {
      setIsExiting(false)
      dispatch(answerQuestion({ questionIndex: currentQuestion, value }))
    }, 220)
  }, [isExiting, currentQuestion, dispatch])

  if (result) {
    return <QuizResult result={result} onRetake={() => dispatch(resetQuiz())} />
  }

  const question = QUESTIONS[currentQuestion]

  return (
    <div className={styles.pageOuter}>
      <div
        key={currentQuestion}
        className={[styles.quizGrid, isExiting ? styles.quizGridExit : ''].join(' ')}
      >

        {/* ══ LEFT column — question info ══ */}
        <div className={styles.leftCol}>
          <span className={styles.leftDecorNum} aria-hidden="true">
            {String(currentQuestion + 1).padStart(2, '0')}
          </span>

          <div className={styles.leftContent}>
            <div className={styles.qNumBlock}>
              <span className={styles.qNum}>{question.qNum}</span>
              <div className={styles.qNumLine} />
            </div>

            <h2 className={styles.qText}>{question.text}</h2>

            <div className={styles.progressSection}>
              <span className={styles.progressLabel}>
                {t('quiz_progress', { n: currentQuestion + 1 })}
              </span>
              <div className={styles.progressSegments}>
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={[
                      styles.progressSeg,
                      i <= currentQuestion ? styles.progressSegFilled : '',
                    ].join(' ')}
                  />
                ))}
              </div>
              {currentQuestion > 0 && (
                <button className={styles.backLink} onClick={() => dispatch(goBack())}>
                  {t('quiz_back')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT column — answer cards ══ */}
        <div className={styles.rightCol}>
          <div className={styles.rightDecorDots} aria-hidden="true">
            <span className={[styles.decorDot, styles.decorDotLg].join(' ')} />
            <span className={[styles.decorDot, styles.decorDotMd].join(' ')} />
            <span className={[styles.decorDot, styles.decorDotSm].join(' ')} />
          </div>
          <div className={styles.rightDecorBlob} aria-hidden="true" />

          <div className={styles.choices}>
            {question.choices.map((choice) => {
              const imgData = IMAGE_MAP[`${currentQuestion}-${choice.letter}`]
              return (
                <button
                  key={choice.letter}
                  className={styles.choiceCard}
                  onClick={() => handleAnswer(choice.value)}
                >
                  <div
                    className={styles.cardImageWrap}
                    style={{ background: imgData?.bg ?? '#FAF1EA' }}
                  >
                    {imgData && (
                      <img
                        src={imgData.src}
                        alt={choice.text}
                        className={styles.cardPhoto}
                      />
                    )}
                  </div>

                  <div className={styles.cardTextWrap}>
                    <span className={styles.cardLetter}>{choice.letter}</span>
                    <div className={styles.cardMain}>
                      <span className={styles.cardText}>{choice.text}</span>
                      {choice.hint && <span className={styles.cardHint}>{choice.hint}</span>}
                    </div>
                    <span className={styles.cardArrow}>→</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
