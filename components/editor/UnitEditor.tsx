'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { UnitWithContent } from '@/types/curriculum'
import VocabularyEditor from './sections/VocabularyEditor'
import WorkbookEditor from './sections/WorkbookEditor'
import TeacherNotesEditor from './sections/TeacherNotesEditor'
import AssessmentEditor from './sections/AssessmentEditor'

type Tab = 'vocabulary' | 'workbook' | 'teacher' | 'assessment'

const TABS: { id: Tab; label: string }[] = [
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'workbook', label: 'Workbook' },
  { id: 'teacher', label: 'Teacher Notes' },
  { id: 'assessment', label: 'Assessment' },
]

export default function UnitEditor({ initialContent }: { initialContent: UnitWithContent }) {
  const [activeTab, setActiveTab] = useState<Tab>('vocabulary')
  const { unit, vocabulary, workbook, teacher, assessments } = initialContent

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard" className="mt-1 text-sm text-gray-400 hover:text-gray-600 shrink-0">
          ←
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{unit.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unit.phonics_skill}
            <span className="mx-1.5">·</span>
            <span className="capitalize">{unit.student_level}</span>
            {unit.sequence_position && (
              <><span className="mx-1.5">·</span>Position {unit.sequence_position}</>
            )}
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'vocabulary' && (
        <VocabularyEditor unitId={unit.id} userId={unit.user_id} initialWords={vocabulary} />
      )}
      {activeTab === 'workbook' && (
        <WorkbookEditor unitId={unit.id} userId={unit.user_id} initialContent={workbook} />
      )}
      {activeTab === 'teacher' && (
        <TeacherNotesEditor unitId={unit.id} userId={unit.user_id} initialContent={teacher} />
      )}
      {activeTab === 'assessment' && (
        <AssessmentEditor unitId={unit.id} userId={unit.user_id} initialAssessments={assessments} />
      )}
    </div>
  )
}
