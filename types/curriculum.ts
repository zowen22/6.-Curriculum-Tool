export type UnitStatus = 'draft' | 'review' | 'published'
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced'
export type DifficultyLevel = 'low' | 'medium' | 'high'
export type InstructionalCategory = 'core' | 'functional' | 'teacher_note'
export type AssessmentLevel = 'beginner' | 'intermediate'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface Unit {
  id: string
  user_id: string
  title: string
  phonics_skill: string
  sequence_position: number | null
  student_level: StudentLevel
  language_transfer_enabled: boolean
  custom_vocabulary: string[] | null
  status: UnitStatus
  created_at: string
  updated_at: string
}

export interface NewUnitInput {
  title: string
  phonics_skill: string
  sequence_position?: number
  student_level: StudentLevel
  language_transfer_enabled: boolean
  custom_vocabulary?: string[]
}

export interface VocabularyWord {
  id: string
  unit_id: string
  user_id: string
  word: string
  definition: string | null
  image_url: string | null
  difficulty_level: DifficultyLevel | null
  instructional_category: InstructionalCategory
  language_transfer_notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface WorkbookContent {
  id: string
  unit_id: string
  user_id: string
  lesson_introduction: string | null
  word_practice: string[] | null
  phrase_practice: string[] | null
  sentence_practice: string[] | null
  decodable_text: string | null
  activities: string[] | null
  updated_at: string
}

export interface TeacherContent {
  id: string
  unit_id: string
  user_id: string
  objective: string | null
  teaching_guidance: string | null
  language_transfer_notes: string | null
  common_errors: string | null
  example_responses: string | null
  updated_at: string
}

export interface Assessment {
  id: string
  unit_id: string
  user_id: string
  level: AssessmentLevel
  word_reading: string[] | null
  phrase_reading: string[] | null
  connected_text: string | null
  spelling_words: string[] | null
  sentence_reading: string[] | null
  dictation_sentences: string[] | null
  application_activity: string | null
  updated_at: string
}

export interface UnitWithContent {
  unit: Unit
  vocabulary: VocabularyWord[]
  workbook: WorkbookContent | null
  teacher: TeacherContent | null
  assessments: Assessment[]
}
