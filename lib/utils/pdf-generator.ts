import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UCATMock } from '@/lib/supabase/types'
import type { User } from '@/lib/supabase/types'

// Map component format to DB format for PDF generation
interface UCATMockForPDF {
  mock_date?: string | null
  mock_name?: string | null
  verbal_reasoning?: number | null
  decision_making?: number | null
  quantitative_reasoning?: number | null
  abstract_reasoning?: number | null
  situational_judgement?: number | null
  total_score?: number | null
}

interface GenerateUCATReportOptions {
  student: User
  mocks: UCATMockForPDF[]
}

export async function generateUCATReport({ student, mocks }: GenerateUCATReportOptions): Promise<void> {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Colors - Premium palette
  const primaryColor = '#D4AF37' // Gold
  const darkColor = '#0B1120' // Navy
  const lightGray = '#F8FAFC' // Light background
  const textGray = '#64748B'

  // Convert hex to RGB for jsPDF
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0]
  }

  const goldRgb = hexToRgb(primaryColor)
  const navyRgb = hexToRgb(darkColor)
  const grayRgb = hexToRgb(textGray)

  // Header Section with Logo placeholder and title
  doc.setFillColor(...navyRgb)
  doc.rect(0, 0, 210, 40, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Regent\'s Consultancy', 105, 20, { align: 'center' })

  // Subtitle
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(212, 175, 55) // Gold
  doc.text('Private Client Portal - UCAT Performance Report', 105, 28, { align: 'center' })

  // Date
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, 35, { align: 'center' })

  // Student Information Section
  let yPos = 50

  doc.setFillColor(248, 250, 252) // Light background
  doc.rect(10, yPos - 5, 190, 30, 'F')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...navyRgb)
  doc.text('Student Information', 15, yPos)

  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  const studentName = student.full_name || student.email.split('@')[0]
  const course = student.target_course
    ? student.target_course.charAt(0).toUpperCase() + student.target_course.slice(1)
    : 'Not specified'
  const entryYear = student.entry_year ? `${student.entry_year}` : 'Not specified'

  doc.text(`Name: ${studentName}`, 15, yPos)
  doc.text(`Target Course: ${course}`, 15, yPos + 6)
  doc.text(`Entry Year: ${entryYear}`, 15, yPos + 12)

  yPos += 35

  // UCAT Scores Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...navyRgb)
  doc.text('UCAT Mock Exam Scores', 15, yPos)

  yPos += 10

    // Prepare table data
    const tableData = mocks.map((mock) => {
      const date = mock.mock_date ? new Date(mock.mock_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
      // Handle SJT - can be number or string (Band 1-4)
      let sjt = '—'
      if (mock.situational_judgement !== null && mock.situational_judgement !== undefined) {
        if (typeof mock.situational_judgement === 'number') {
          sjt = mock.situational_judgement.toString()
        } else if (typeof mock.situational_judgement === 'string') {
          sjt = mock.situational_judgement
        } else {
          sjt = String(mock.situational_judgement)
        }
      }
      return [
        date,
        mock.mock_name || 'Mock Exam',
        mock.verbal_reasoning?.toString() || '—',
        mock.decision_making?.toString() || '—',
        mock.quantitative_reasoning?.toString() || '—',
        mock.abstract_reasoning?.toString() || '—',
        sjt,
        mock.total_score?.toString() || '—',
      ]
    })

  // If no mocks, show empty state
  if (mocks.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...grayRgb)
    doc.text('No UCAT mock scores recorded yet.', 15, yPos)
    yPos += 10
  } else {
    // Calculate statistics if mocks exist
    const scores = mocks.map((m) => m.total_score).filter((s): s is number => s !== null && s !== undefined)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0
    const minScore = scores.length > 0 ? Math.min(...scores) : 0

    // Add statistics box
    doc.setFillColor(248, 250, 252)
    doc.rect(10, yPos, 190, 20, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Mocks: ${mocks.length}`, 15, yPos + 6)
    doc.text(`Average Score: ${avgScore}`, 60, yPos + 6)
    doc.text(`Highest Score: ${maxScore}`, 110, yPos + 6)
    doc.text(`Lowest Score: ${minScore}`, 160, yPos + 6)
    yPos += 25

    // Create table with autoTable
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Mock Name', 'VR', 'DM', 'QR', 'AR', 'SJT', 'Total Score']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: navyRgb,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        fontSize: 8,
      },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 30 }, // Date
        1: { cellWidth: 40 }, // Mock Name
        2: { cellWidth: 18 }, // VR
        3: { cellWidth: 18 }, // DM
        4: { cellWidth: 18 }, // QR
        5: { cellWidth: 18 }, // AR
        6: { cellWidth: 18 }, // SJT
        7: { cellWidth: 20, fontStyle: 'bold' }, // Total
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...grayRgb)
    doc.text(
      `Regent's Consultancy - Confidential Report`,
      105,
      287,
      { align: 'center' }
    )
    doc.text(
      `Page ${i} of ${pageCount}`,
      195,
      287,
      { align: 'right' }
    )
  }

  // Generate filename
  const filename = `UCAT_Report_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  // Save PDF
  doc.save(filename)
}

