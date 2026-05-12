import { createSlice } from '@reduxjs/toolkit'

export const QUESTIONS = [
  {
    id: 1,
    qNum: 'Q.01',
    text: 'Look at the veins on both wrists. What color do they appear most clearly?',
    choices: [
      {
        letter: 'A', text: 'Mostly green', hint: null, value: 'warm',
        emoji: '🌿',
        illustrationBg: 'linear-gradient(145deg, #e8f5e9 0%, #a5d6a7 100%)',
        dotColor: 'rgba(76,175,80,0.2)',
      },
      {
        letter: 'B', text: 'Mostly purple or blue', hint: null, value: 'cool',
        emoji: '💜',
        illustrationBg: 'linear-gradient(145deg, #ede7f6 0%, #b39ddb 100%)',
        dotColor: 'rgba(103,58,183,0.2)',
      },
    ],
  },
  {
    id: 2,
    qNum: 'Q.02',
    text: 'Which direction does your skin tone lean?',
    choices: [
      {
        letter: 'A', text: 'Yellowish', hint: 'Gold-tone foundation makes your face look brighter', value: 'warm',
        emoji: '✨',
        illustrationBg: 'linear-gradient(145deg, #fffde7 0%, #ffe082 100%)',
        dotColor: 'rgba(255,193,7,0.25)',
      },
      {
        letter: 'B', text: 'Pinkish', hint: 'Silver-tone foundation makes your face look brighter', value: 'cool',
        emoji: '🌸',
        illustrationBg: 'linear-gradient(145deg, #fce4ec 0%, #f48fb1 100%)',
        dotColor: 'rgba(233,30,99,0.15)',
      },
    ],
  },
  {
    id: 3,
    qNum: 'Q.03',
    text: 'After spending time in the sun, what color does your skin turn?',
    choices: [
      {
        letter: 'A', text: 'Golden tan or brown tan', hint: null, value: 'warm',
        emoji: '☀️',
        illustrationBg: 'linear-gradient(145deg, #fff8e1 0%, #ffcc80 100%)',
        dotColor: 'rgba(255,152,0,0.2)',
      },
      {
        letter: 'B', text: 'Red or dark red', hint: null, value: 'cool',
        emoji: '🌡️',
        illustrationBg: 'linear-gradient(145deg, #ffebee 0%, #ef9a9a 100%)',
        dotColor: 'rgba(244,67,54,0.15)',
      },
    ],
  },
  {
    id: 4,
    qNum: 'Q.04',
    text: 'Is your skin tone more dark or light?',
    choices: [
      {
        letter: 'A', text: 'Leans darker', hint: null, value: 'deep',
        emoji: '🌙',
        illustrationBg: 'linear-gradient(145deg, #4a4580 0%, #2d1b4e 100%)',
        dotColor: 'rgba(255,255,255,0.12)',
      },
      {
        letter: 'B', text: 'Leans lighter', hint: null, value: 'light',
        emoji: '🌤️',
        illustrationBg: 'linear-gradient(145deg, #fffde7 0%, #fff59d 100%)',
        dotColor: 'rgba(255,235,59,0.25)',
      },
    ],
  },
  {
    id: 5,
    qNum: 'Q.05',
    text: 'How dark is your natural hair color?',
    choices: [
      {
        letter: 'A', text: 'Pure black', hint: null, value: 'deep',
        emoji: '🌌',
        illustrationBg: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        dotColor: 'rgba(255,255,255,0.1)',
      },
      {
        letter: 'B', text: 'Dark brown or lighter', hint: null, value: 'light',
        emoji: '🌺',
        illustrationBg: 'linear-gradient(145deg, #efebe9 0%, #bcaaa4 100%)',
        dotColor: 'rgba(121,85,72,0.2)',
      },
    ],
  },
]

export const SEASON_DATA = {
  Spring: {
    undertone: 'WARM TONE',
    emoji: '🌸',
    colors: ['#E8D44D', '#8B9E3A', '#F4A7B9', '#7EC8E3', '#E8734A', '#9E8B6E', '#D42B2B'],
    description: 'Spring types suit bright, vivid colors full of life — like nature in bloom. You give off an approachable, friendly, and energetic vibe.',
    heroGradient: 'linear-gradient(135deg, #FFD54F 0%, #FF8A65 45%, #F48FB1 100%)',
  },
  Summer: {
    undertone: 'COOL TONE',
    emoji: '🌊',
    colors: ['#B8C5D6', '#DDA0DD', '#98C9C5', '#F2C4CE', '#9B8EA8', '#C4B7A6', '#7B9EA8'],
    description: 'Summer types suit soft, muted, romantic colors — like morning mist in the warm season. You give off an elegant and refined impression.',
    heroGradient: 'linear-gradient(135deg, #CE93D8 0%, #90CAF9 45%, #80CBC4 100%)',
  },
  Autumn: {
    undertone: 'WARM TONE',
    emoji: '🍂',
    colors: ['#C4873A', '#8B6340', '#C4A951', '#7A8B40', '#A0522D', '#C4874A', '#4A3728'],
    description: 'Autumn types suit warm, deep, rich earth tones — like the colors of falling leaves. You give off a grounded, trustworthy, and mature presence.',
    heroGradient: 'linear-gradient(135deg, #FF8F00 0%, #BF360C 45%, #4E342E 100%)',
  },
  Winter: {
    undertone: 'COOL TONE',
    emoji: '❄️',
    colors: ['#1B3A6B', '#8B0000', '#1B6B5A', '#4B0082', '#C41230', '#E8E8E8', '#2B2B2B'],
    description: 'Winter types suit bold, sharp, high-contrast colors — like the clarity of a cold winter day. You give off a modern, striking, and sophisticated vibe.',
    heroGradient: 'linear-gradient(135deg, #1565C0 0%, #6A1B9A 45%, #1B1B1B 100%)',
  },
}

function calcResult(answers) {
  const get = (idx) => answers.find((a) => a.questionIndex === idx)?.value
  const warmCount = [get(0), get(1), get(2)].filter((v) => v === 'warm').length
  const deepCount = [get(3), get(4)].filter((v) => v === 'deep').length
  const isWarm = warmCount >= 2
  const isDeep = deepCount >= 1
  if  (isWarm && !isDeep) return 'Spring'
  if (!isWarm && !isDeep) return 'Summer'
  if  (isWarm &&  isDeep) return 'Autumn'
  return 'Winter'
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    answers: [],
    currentQuestion: 0,
    result: null,
  },
  reducers: {
    answerQuestion(state, action) {
      const { questionIndex, value } = action.payload
      state.answers = state.answers.filter((a) => a.questionIndex < questionIndex)
      state.answers.push({ questionIndex, value })
      state.currentQuestion = questionIndex + 1
      if (state.answers.length === QUESTIONS.length) {
        const season = calcResult(state.answers)
        state.result = { season, undertone: SEASON_DATA[season].undertone }
      }
    },
    goBack(state) {
      if (state.currentQuestion > 0) {
        state.currentQuestion -= 1
        state.result = null
      }
    },
    resetQuiz(state) {
      state.answers         = []
      state.currentQuestion = 0
      state.result          = null
    },
    setResult(state, action) {
      state.result = action.payload
    },
  },
})

export const { answerQuestion, goBack, resetQuiz, setResult } = quizSlice.actions
export default quizSlice.reducer
