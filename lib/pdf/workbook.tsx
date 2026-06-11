import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { UnitWithContent, Segment } from '@/types/curriculum'

const brand = '#4338ca'
const brandLight = '#eef2ff'

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
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: brand,
    borderLeftWidth: 3,
    borderLeftColor: brand,
    paddingLeft: 7,
    marginBottom: 10,
    marginTop: 6,
  },
  subsectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 6,
  },
  wordCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  wordRow: { flexDirection: 'row', marginBottom: 5 },
  wordImage: { width: 68, height: 52, marginRight: 10 },
  wordTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  definition: { fontSize: 10, color: '#374151', lineHeight: 1.4 },
  mapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  mapCell: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 3,
    marginTop: 5,
    alignItems: 'center',
  },
  mapGrapheme: {
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 6,
    paddingRight: 6,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  mapPhoneme: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    fontSize: 8,
    color: brand,
    backgroundColor: brandLight,
    textAlign: 'center',
  },
  twoCol: { flexDirection: 'row' },
  colLeft: { flex: 1, marginRight: 24 },
  col: { flex: 1 },
  listItem: { fontSize: 11, marginBottom: 5, color: '#374151' },
  sentenceItem: { fontSize: 11, marginBottom: 8, color: '#374151', lineHeight: 1.4 },
  body: { fontSize: 11, lineHeight: 1.7, color: '#374151' },
  activityBlock: { marginBottom: 14 },
  activityLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 3 },
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
      <Text style={styles.headerUnit}>{title} — Student Workbook</Text>
      <Text style={styles.headerSkill}>{skill}</Text>
    </View>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function OrthoMap({ segments }: { segments: Segment[] }) {
  if (!segments.length) return null
  return (
    <View style={styles.mapRow}>
      {segments.map((seg, i) => (
        <View key={i} style={styles.mapCell}>
          <Text style={styles.mapGrapheme}>{seg.grapheme}</Text>
          <Text style={styles.mapPhoneme}>{seg.phoneme}</Text>
        </View>
      ))}
    </View>
  )
}

export function WorkbookPDF({ data }: { data: UnitWithContent }) {
  const { unit, vocabulary, workbook } = data

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header title={unit.title} skill={unit.phonics_skill} />

        {/* Vocabulary */}
        <SectionTitle>Vocabulary</SectionTitle>
        {vocabulary.map(word => (
          <View key={word.id} style={styles.wordCard} wrap={false}>
            <View style={styles.wordRow}>
              {word.image_url && <Image src={word.image_url} style={styles.wordImage} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.wordTitle}>{word.word}</Text>
                {word.definition && <Text style={styles.definition}>{word.definition}</Text>}
              </View>
            </View>
            {word.phoneme_grapheme_map && word.phoneme_grapheme_map.length > 0 && (
              <OrthoMap segments={word.phoneme_grapheme_map} />
            )}
          </View>
        ))}

        {/* Word + Phrase Practice */}
        {(workbook?.word_practice?.length || workbook?.phrase_practice?.length) ? (
          <>
            <SectionTitle>Practice</SectionTitle>
            <View style={styles.twoCol}>
              {workbook.word_practice?.length ? (
                <View style={styles.colLeft}>
                  <Text style={styles.subsectionTitle}>Word Practice</Text>
                  {workbook.word_practice.map((w, i) => (
                    <Text key={i} style={styles.listItem}>{i + 1}. {w}</Text>
                  ))}
                </View>
              ) : null}
              {workbook.phrase_practice?.length ? (
                <View style={styles.col}>
                  <Text style={styles.subsectionTitle}>Phrase Practice</Text>
                  {workbook.phrase_practice.map((p, i) => (
                    <Text key={i} style={styles.listItem}>{i + 1}. {p}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Sentence Practice */}
        {workbook?.sentence_practice?.length ? (
          <>
            <SectionTitle>Sentence Practice</SectionTitle>
            {workbook.sentence_practice.map((sentence, i) => (
              <Text key={i} style={styles.sentenceItem}>{i + 1}. {sentence}</Text>
            ))}
          </>
        ) : null}

        {/* Decodable Text */}
        {workbook?.decodable_text ? (
          <>
            <SectionTitle>Read It</SectionTitle>
            <Text style={styles.body}>{workbook.decodable_text}</Text>
          </>
        ) : null}

        {/* Activities */}
        {workbook?.activities?.length ? (
          <>
            <SectionTitle>Activities</SectionTitle>
            {workbook.activities.map((activity, i) => (
              <View key={i} style={styles.activityBlock} wrap={false}>
                <Text style={styles.activityLabel}>Activity {i + 1}</Text>
                <Text style={styles.body}>{activity}</Text>
              </View>
            ))}
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
