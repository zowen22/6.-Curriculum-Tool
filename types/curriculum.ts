export type UnitStatus = 'draft' | 'review' | 'published'
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced'

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
