import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { spawn } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface InspectionResultExport {
  item_id: number
  status: 'baik' | 'sedang' | 'perlu_perbaikan' | 'istimewa'
  notes: string | null
  item?: {
    id: number
    name: string
    description: string | null
    display_order: number
    category?: string
  }
}

interface InspectionExportData {
  id: string
  car_listing_id: string
  inspector_name: string | null
  inspection_place: string | null
  inspection_date: Date | null
  total_points: number
  passed_points: number | null
  inspection_score: number | null
  accident_free: boolean
  flood_free: boolean
  fire_free: boolean
  odometer_tampered: boolean
  risk_level: string | null
  overall_grade: string | null
  certificate_number: string | null
  results?: InspectionResultExport[]
  car_listing?: {
    title: string | null
    brand?: { name: string } | null
    carModel?: { name: string } | null
    year: number | null
    plate_number: string | null
    vin_number: string | null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inspection_id, car_listing_id, inspection_data } = body

    let inspection: InspectionExportData | null = null

    // If inspection_id provided, fetch from database
    if (inspection_id) {
      const data = await db.carInspection.findUnique({
        where: { id: inspection_id },
        include: {
          results: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  display_order: true,
                  inspectionCategory: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          listing: {
            select: {
              title: true,
              year: true,
              plate_number: true,
              vin_number: true,
              brand: { select: { name: true } },
              carModel: { select: { name: true } }
            }
          }
        }
      })

      if (data) {
        inspection = {
          ...data,
          results: data.results.map(r => ({
            item_id: r.item_id,
            status: r.status as InspectionResultExport['status'],
            notes: r.notes,
            item: r.item ? {
              id: r.item.id,
              name: r.item.name,
              description: r.item.description,
              display_order: r.item.display_order,
              category: r.item.inspectionCategory?.name || undefined
            } : undefined
          })),
          car_listing: data.listing ? {
            title: data.listing.title,
            brand: data.listing.brand,
            carModel: data.listing.carModel,
            year: data.listing.year,
            plate_number: data.listing.plate_number,
            vin_number: data.listing.vin_number
          } : undefined
        }
      }
    }
    // If inspection_data provided directly (for preview before save)
    else if (inspection_data) {
      inspection = inspection_data

      // Fetch car listing info if car_listing_id provided
      if (car_listing_id) {
        const listing = await db.carListing.findUnique({
          where: { id: car_listing_id },
          select: {
            title: true,
            year: true,
            plate_number: true,
            vin_number: true,
            brand: { select: { name: true } },
            carModel: { select: { name: true } }
          }
        })

        if (listing && inspection) {
          inspection.car_listing = {
            title: listing.title,
            brand: listing.brand,
            carModel: listing.carModel,
            year: listing.year,
            plate_number: listing.plate_number,
            vin_number: listing.vin_number
          }
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'inspection_id or inspection_data is required' },
        { status: 400 }
      )
    }

    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      )
    }

    // Generate PDF using Python script
    const pdfBuffer = await generateInspectionPdf(inspection)

    // Return PDF as download
    const filename = `inspeksi-${inspection.certificate_number || inspection.id.slice(0, 8)}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting inspection PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}

async function generateInspectionPdf(inspection: InspectionExportData): Promise<Buffer> {
  const tempDir = tmpdir()
  const jobId = uuidv4()
  const inputFile = join(tempDir, `inspection-input-${jobId}.json`)
  const outputFile = join(tempDir, `inspection-output-${jobId}.pdf`)

  // Write input data
  await writeFile(inputFile, JSON.stringify(inspection, null, 2), 'utf-8')

  // Python script to generate PDF
  const pythonScript = join(process.cwd(), 'scripts', 'generate-inspection-pdf.py')

  return new Promise((resolve, reject) => {
    const python = spawn('python3', [pythonScript, inputFile, outputFile])

    let stderr = ''
    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('close', async (code) => {
      try {
        // Clean up input file
        await unlink(inputFile).catch(() => {})

        if (code !== 0) {
          console.error('Python script error:', stderr)
          reject(new Error(`PDF generation failed: ${stderr}`))
          return
        }

        // Read generated PDF
        const pdfBuffer = await readFile(outputFile)

        // Clean up output file
        await unlink(outputFile).catch(() => {})

        resolve(pdfBuffer)
      } catch (err) {
        reject(err)
      }
    })
  })
}
