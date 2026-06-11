import type { Unit } from '@/types/curriculum'

export const SYSTEM_PROMPT = `You are an expert curriculum specialist creating Science of Reading-aligned phonics curriculum for multilingual middle school English learners.

Your students are primarily:
- Newcomers (0-2 years in the US) at middle school level (ages 11-18)
- Students literate in their home language with foundational English phonics gaps
- Long-term English learners missing specific phonics skills

CORE PRINCIPLES:
- Follow Science of Reading research: explicit, systematic phonics instruction
- Apply orthographic mapping: help students connect phonemes (sounds) to graphemes (letter patterns)
- Use Structured Literacy principles: direct, sequential, cumulative instruction
- All content must be age-appropriate — no childish themes, no baby vocabulary

VOCABULARY: Select high-utility, age-appropriate words containing the target phonics pattern. Choose words middle schoolers encounter in school and everyday life. Avoid cutesy "cat/mat/sat" rhyme lists unless the pattern demands it for absolute beginners.

DECODABLE TEXT: Write informational or realistic narrative passages appropriate for middle schoolers (100 words). Use the target pattern consistently throughout.

TEACHER NOTES: Be specific and practical. Assume the teacher may have limited explicit phonics training. Include scripted examples where helpful (e.g., "Say: 'This word has the ___ pattern...'").

LANGUAGE TRANSFER: Include Spanish connections only when genuinely meaningful — true cognates, similar phonemes, helpful contrasts. Never force a connection. Return empty string if no meaningful transfer exists.

ASSESSMENTS: Beginner items test word-level accuracy. Intermediate items test application in connected text and generalization.`

export interface GeneratedCurriculum {
  vocabulary: {
    word: string
    definition: string
    difficulty_level: 'low' | 'medium' | 'high'
    instructional_category: 'core' | 'functional' | 'teacher_note'
    language_transfer_notes: string
  }[]
  workbook: {
    lesson_introduction: string
    word_practice: string[]
    phrase_practice: string[]
    sentence_practice: string[]
    decodable_text: string
    activities: string[]
  }
  teacher: {
    objective: string
    teaching_guidance: string
    language_transfer_notes: string
    common_errors: string
    example_responses: string
  }
  assessment_beginner: {
    word_reading: string[]
    phrase_reading: string[]
    connected_text: string
    spelling_words: string[]
  }
  assessment_intermediate: {
    sentence_reading: string[]
    dictation_sentences: string[]
    application_activity: string
  }
}

export const CURRICULUM_SCHEMA = {
  type: 'object',
  properties: {
    vocabulary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          definition: { type: 'string' },
          difficulty_level: { type: 'string', enum: ['low', 'medium', 'high'] },
          instructional_category: { type: 'string', enum: ['core', 'functional', 'teacher_note'] },
          language_transfer_notes: { type: 'string' },
        },
        required: ['word', 'definition', 'difficulty_level', 'instructional_category', 'language_transfer_notes'],
        additionalProperties: false,
      },
    },
    workbook: {
      type: 'object',
      properties: {
        lesson_introduction: { type: 'string' },
        word_practice: { type: 'array', items: { type: 'string' } },
        phrase_practice: { type: 'array', items: { type: 'string' } },
        sentence_practice: { type: 'array', items: { type: 'string' } },
        decodable_text: { type: 'string' },
        activities: { type: 'array', items: { type: 'string' } },
      },
      required: ['lesson_introduction', 'word_practice', 'phrase_practice', 'sentence_practice', 'decodable_text', 'activities'],
      additionalProperties: false,
    },
    teacher: {
      type: 'object',
      properties: {
        objective: { type: 'string' },
        teaching_guidance: { type: 'string' },
        language_transfer_notes: { type: 'string' },
        common_errors: { type: 'string' },
        example_responses: { type: 'string' },
      },
      required: ['objective', 'teaching_guidance', 'language_transfer_notes', 'common_errors', 'example_responses'],
      additionalProperties: false,
    },
    assessment_beginner: {
      type: 'object',
      properties: {
        word_reading: { type: 'array', items: { type: 'string' } },
        phrase_reading: { type: 'array', items: { type: 'string' } },
        connected_text: { type: 'string' },
        spelling_words: { type: 'array', items: { type: 'string' } },
      },
      required: ['word_reading', 'phrase_reading', 'connected_text', 'spelling_words'],
      additionalProperties: false,
    },
    assessment_intermediate: {
      type: 'object',
      properties: {
        sentence_reading: { type: 'array', items: { type: 'string' } },
        dictation_sentences: { type: 'array', items: { type: 'string' } },
        application_activity: { type: 'string' },
      },
      required: ['sentence_reading', 'dictation_sentences', 'application_activity'],
      additionalProperties: false,
    },
  },
  required: ['vocabulary', 'workbook', 'teacher', 'assessment_beginner', 'assessment_intermediate'],
  additionalProperties: false,
}

export function buildUserPrompt(unit: Unit): string {
  const lines = [
    'Generate a complete curriculum unit:',
    '',
    `PHONICS SKILL: ${unit.phonics_skill}`,
    `STUDENT LEVEL: ${unit.student_level}`,
    `LANGUAGE TRANSFER: ${
      unit.language_transfer_enabled
        ? 'Include Spanish language transfer notes where genuinely helpful. Return empty string if no meaningful connection exists.'
        : 'No language transfer notes needed — return empty string for all language_transfer_notes fields.'
    }`,
  ]

  if (unit.custom_vocabulary?.length) {
    lines.push(`REQUIRED VOCABULARY: Include these words (add more as needed to reach 8-12 total): ${unit.custom_vocabulary.join(', ')}`)
  }

  lines.push(
    '',
    'Generate:',
    '- Vocabulary: 8-12 words',
    '- Workbook: lesson introduction (2-3 sentences), 10 word practice items, 6 phrases (3-5 words each), 6 sentences, 100-word decodable text, 3 activity descriptions',
    '- Teacher manual: all 5 sections',
    '- Beginner assessment: 10 word reading items, 5 phrase reading items, 50-word connected text, 8 spelling words',
    '- Intermediate assessment: 6 sentence reading items, 4 dictation sentences, 1 application activity description',
  )

  return lines.join('\n')
}
