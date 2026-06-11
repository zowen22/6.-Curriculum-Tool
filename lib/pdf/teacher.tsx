import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { UnitWithContent } from '@/types/curriculum'

const brand = '#4338ca'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 50,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 7,
    marginBottom: 18,
  },
  headerUnit: { fontSize: 9, color: '#6b7280' },
  headerSkill: { fontSize: 9, color: brand, fontFamily: 'Helvetica-Bold' },
  titleBlock: {
    marginBottom: 22,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: brand,
  },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#6b7280' },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: brand,
    borderLeftWidth: 3,
    borderLeftColor: brand,
    paddingLeft: 7,
    marginBottom: 8,
    marginTop: 14,
  },
  body: { fontSize: 11, lineHeight: 1.7, color: '#374151' },
  twoCol: { flexDirection: 'row', marginTop: 2 },
  colLeft: { flex: 1, marginRight: 20 },
  col: { flex: 1 },
  listItem: { fontSize: 11, marginBottom: 5, color: '#374151' },
  assessmentBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  assessmentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  pageNum: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})

function Header({ title, skill }: { title: string; skill: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerUnit}>{title} — Teacher Manual</Text>
      <Text style={styles.headerSkill}>{skill}</Text>
    </View>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function BodyText({ text }: { text: string | null | undefined }) {
  if (!text) return null
  return <Text style={styles.body}>{text}</Text>
}

export function TeacherPDF({ data }: { data: UnitWithContent }) {
  const { unit, teacher, assessments } = data
  const beginner = assessments.find(a => a.level === 'beginner')
  const intermediate = assessments.find(a => a.level === 'intermediate')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header title={unit.title} skill={unit.phonics_skill} />

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{unit.title}</Text>
          <Text style={styles.subtitle}>
            {unit.phonics_skill}
            {unit.student_level ? `  ·  ${unit.student_level.charAt(0).toUpperCase() + unit.student_level.slice(1)}` : ''}
          </Text>
        </View>

        {/* Objective */}
        {teacher?.objective ? (
          <>
            <SectionTitle>Objective</SectionTitle>
            <BodyText text={teacher.objective} />
          </>
        ) : null}

        {/* Teaching Guidance */}
        {teacher?.teaching_guidance ? (
          <>
            <SectionTitle>Teaching Guidance</SectionTitle>
            <BodyText text={teacher.teaching_guidance} />
          </>
        ) : null}

        {/* Language Transfer Notes */}
        {teacher?.language_transfer_notes ? (
          <>
            <SectionTitle>Language Transfer Notes</SectionTitle>
            <BodyText text={teacher.language_transfer_notes} />
          </>
        ) : null}

        {/* Common Errors + Example Responses */}
        {(teacher?.common_errors || teacher?.example_responses) ? (
          <>
            <SectionTitle>Common Errors &amp; Responses</SectionTitle>
            <View style={styles.twoCol}>
              {teacher.common_errors ? (
                <View style={styles.colLeft}>
                  <Text style={[styles.assessmentTitle, { marginBottom: 4 }]}>Common Errors</Text>
                  <BodyText text={teacher.common_errors} />
                </View>
              ) : null}
              {teacher.example_responses ? (
                <View style={styles.col}>
                  <Text style={[styles.assessmentTitle, { marginBottom: 4 }]}>Example Responses</Text>
                  <BodyText text={teacher.example_responses} />
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Beginner Assessment */}
        {beginner ? (
          <>
            <SectionTitle>Assessment — Beginner</SectionTitle>
            <View style={styles.assessmentBox} wrap={false}>
              {beginner.word_reading?.length ? (
                <>
                  <Text style={styles.assessmentTitle}>Word Reading</Text>
                  <Text style={styles.listItem}>{beginner.word_reading.join('   ')}</Text>
                </>
              ) : null}
              {beginner.phrase_reading?.length ? (
                <>
                  <Text style={[styles.assessmentTitle, { marginTop: 8 }]}>Phrase Reading</Text>
                  {beginner.phrase_reading.map((p, i) => (
                    <Text key={i} style={styles.listItem}>{i + 1}. {p}</Text>
                  ))}
                </>
              ) : null}
              {beginner.connected_text ? (
                <>
                  <Text style={[styles.assessmentTitle, { marginTop: 8 }]}>Connected Text</Text>
                  <Text style={styles.body}>{beginner.connected_text}</Text>
                </>
              ) : null}
              {beginner.spelling_words?.length ? (
                <>
                  <Text style={[styles.assessmentTitle, { marginTop: 8 }]}>Spelling Words</Text>
                  <Text style={styles.listItem}>{beginner.spelling_words.join('   ')}</Text>
                </>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Intermediate Assessment */}
        {intermediate ? (
          <>
            <SectionTitle>Assessment — Intermediate</SectionTitle>
            <View style={styles.assessmentBox} wrap={false}>
              {intermediate.sentence_reading?.length ? (
                <>
                  <Text style={styles.assessmentTitle}>Sentence Reading</Text>
                  {intermediate.sentence_reading.map((s, i) => (
                    <Text key={i} style={styles.listItem}>{i + 1}. {s}</Text>
                  ))}
                </>
              ) : null}
              {intermediate.dictation_sentences?.length ? (
                <>
                  <Text style={[styles.assessmentTitle, { marginTop: 8 }]}>Dictation</Text>
                  {intermediate.dictation_sentences.map((s, i) => (
                    <Text key={i} style={styles.listItem}>{i + 1}. {s}</Text>
                  ))}
                </>
              ) : null}
              {intermediate.application_activity ? (
                <>
                  <Text style={[styles.assessmentTitle, { marginTop: 8 }]}>Application Activity</Text>
                  <Text style={styles.body}>{intermediate.application_activity}</Text>
                </>
              ) : null}
            </View>
          </>
        ) : null}

        <Text
          style={styles.pageNum}
          render={({ pageNumber }: { pageNumber: number }) => String(pageNumber)}
          fixed
        />
      </Page>
    </Document>
  )
}
