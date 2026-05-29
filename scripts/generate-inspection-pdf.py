#!/usr/bin/env python3
"""
Generate Inspection Certificate PDF for AutoMarket
Professional format with 160-point inspection results
"""

import json
import sys
import os
from datetime import datetime
from collections import defaultdict

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font families for bold tags
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Colors
BRAND_PRIMARY = colors.HexColor('#3B82F6')  # Blue
BRAND_SECONDARY = colors.HexColor('#8B5CF6')  # Purple
BRAND_ACCENT = colors.HexColor('#10B981')  # Emerald
HEADER_BG = colors.HexColor('#1F4E79')
TABLE_HEADER = colors.HexColor('#2D5F8B')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
STATUS_COLORS = {
    'istimewa': colors.HexColor('#8B5CF6'),  # Purple
    'baik': colors.HexColor('#10B981'),  # Green
    'sedang': colors.HexColor('#F59E0B'),  # Yellow
    'perlu_perbaikan': colors.HexColor('#EF4444'),  # Red
}

STATUS_LABELS = {
    'istimewa': 'Istimewa',
    'baik': 'Baik',
    'sedang': 'Sedang',
    'perlu_perbaikan': 'Perlu Perbaikan',
}

GRADE_COLORS = {
    'A+': colors.HexColor('#10B981'),
    'A': colors.HexColor('#22C55E'),
    'B+': colors.HexColor('#84CC16'),
    'B': colors.HexColor('#EAB308'),
    'C': colors.HexColor('#F97316'),
    'D': colors.HexColor('#EF4444'),
    'E': colors.HexColor('#991B1B'),
}


def create_styles():
    """Create paragraph styles"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Microsoft YaHei',
        fontSize=28,
        leading=34,
        alignment=TA_CENTER,
        textColor=BRAND_PRIMARY,
        spaceAfter=12,
    ))
    
    # Subtitle style
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='SimHei',
        fontSize=14,
        leading=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666'),
        spaceAfter=8,
    ))
    
    # Section header
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Microsoft YaHei',
        fontSize=14,
        leading=20,
        alignment=TA_LEFT,
        textColor=BRAND_PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='BodyText',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        textColor=colors.black,
        wordWrap='CJK',
    ))
    
    # Table header
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='SimHei',
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.white,
    ))
    
    # Table cell
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='SimHei',
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
        textColor=colors.black,
        wordWrap='CJK',
    ))
    
    # Table cell center
    styles.add(ParagraphStyle(
        name='TableCellCenter',
        fontName='SimHei',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.black,
    ))
    
    # Certificate number
    styles.add(ParagraphStyle(
        name='CertificateNumber',
        fontName='Times New Roman',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666'),
    ))
    
    return styles


def group_results_by_category(results):
    """Group inspection results by category"""
    grouped = defaultdict(list)
    for result in results:
        category = result.get('item', {}).get('category', 'Other')
        grouped[category].append(result)
    
    # Sort by display_order
    for category in grouped:
        grouped[category].sort(key=lambda x: x.get('item', {}).get('display_order', 0))
    
    return dict(sorted(grouped.items(), key=lambda x: x[1][0].get('item', {}).get('display_order', 0) if x[1] else 0))


def calculate_stats(results):
    """Calculate inspection statistics"""
    stats = {
        'total': len(results),
        'istimewa': 0,
        'baik': 0,
        'sedang': 0,
        'perlu_perbaikan': 0,
    }
    
    for result in results:
        status = result.get('status', 'baik')
        if status in stats:
            stats[status] += 1
    
    # Calculate score (istimewa + baik counts as passed)
    passed = stats['istimewa'] + stats['baik']
    stats['score'] = round((passed / stats['total']) * 100) if stats['total'] > 0 else 0
    
    return stats


def create_cover_page(inspection, styles):
    """Create certificate cover page"""
    story = []
    
    story.append(Spacer(1, 2*cm))
    
    # Logo placeholder (AutoMarket branding)
    logo_text = Paragraph(
        '<font color="#3B82F6"><b>Auto</b></font><font color="#8B5CF6"><b>Market</b></font>',
        ParagraphStyle(
            name='Logo',
            fontName='Microsoft YaHei',
            fontSize=36,
            leading=44,
            alignment=TA_CENTER,
        )
    )
    story.append(logo_text)
    story.append(Spacer(1, 0.5*cm))
    
    # Certificate title
    story.append(Paragraph(
        'SERTIFIKAT INSPEKSI',
        styles['CoverTitle']
    ))
    story.append(Paragraph(
        '160 Titik Pemeriksaan Kendaraan',
        styles['CoverSubtitle']
    ))
    
    story.append(Spacer(1, 1*cm))
    
    # Car info
    car_info = inspection.get('car_listing', {}) or {}
    car_title = car_info.get('title', '')
    if not car_title:
        brand_name = car_info.get('brand', {}).get('name', '') if car_info.get('brand') else ''
        model_name = car_info.get('model', {}).get('name', '') if car_info.get('model') else ''
        year = car_info.get('year', '')
        car_title = f"{brand_name} {model_name} {year}".strip()
    
    story.append(Paragraph(
        f'<b>{car_title}</b>',
        ParagraphStyle(
            name='CarTitle',
            fontName='Microsoft YaHei',
            fontSize=18,
            leading=24,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#333333'),
        )
    ))
    
    story.append(Spacer(1, 0.5*cm))
    
    # Grade badge
    grade = inspection.get('overall_grade', '')
    if grade:
        grade_color = GRADE_COLORS.get(grade, colors.gray)
        story.append(Paragraph(
            f'<font color="{grade_color.hexval()}"><b>Grade: {grade}</b></font>',
            ParagraphStyle(
                name='Grade',
                fontName='Times New Roman',
                fontSize=24,
                leading=30,
                alignment=TA_CENTER,
            )
        ))
    
    story.append(Spacer(1, 1.5*cm))
    
    # Certificate info box
    cert_number = inspection.get('certificate_number') or f"INS-{inspection.get('id', '')[:8].upper()}"
    inspection_date = inspection.get('inspection_date', '')
    if inspection_date:
        try:
            inspection_date = datetime.fromisoformat(inspection_date.replace('Z', '+00:00')).strftime('%d %B %Y')
        except:
            pass
    
    info_data = [
        [Paragraph('<b>No. Sertifikat</b>', styles['TableCell']), Paragraph(cert_number, styles['TableCell'])],
        [Paragraph('<b>Tanggal Inspeksi</b>', styles['TableCell']), Paragraph(inspection_date or '-', styles['TableCell'])],
        [Paragraph('<b>Inspektor</b>', styles['TableCell']), Paragraph(inspection.get('inspector_name') or '-', styles['TableCell'])],
        [Paragraph('<b>Lokasi</b>', styles['TableCell']), Paragraph(inspection.get('inspection_place') or '-', styles['TableCell'])],
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 10*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E5E5E5')),
        ('LINEAFTER', (0, 0), (0, -1), 1, colors.HexColor('#E5E5E5')),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 1.5*cm))
    
    # Vehicle details
    story.append(Paragraph('<b>Detail Kendaraan</b>', styles['SectionHeader']))
    
    plate_number = car_info.get('plate_number', '-') or '-'
    vin_number = car_info.get('vin_number', '-') or '-'
    year = car_info.get('year', '-') or '-'
    
    vehicle_data = [
        [Paragraph('<b>No. Polisi</b>', styles['TableCell']), Paragraph(str(plate_number), styles['TableCell']),
         Paragraph('<b>Tahun</b>', styles['TableCell']), Paragraph(str(year), styles['TableCell'])],
        [Paragraph('<b>No. Rangka (VIN)</b>', styles['TableCell']), Paragraph(str(vin_number), styles['TableCell']), '', ''],
    ]
    
    vehicle_table = Table(vehicle_data, colWidths=[3.5*cm, 4.5*cm, 2.5*cm, 3.5*cm])
    vehicle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E5E5E5')),
        ('SPAN', (1, 1), (3, 1)),  # Span VIN column
    ]))
    story.append(vehicle_table)
    
    story.append(PageBreak())
    
    return story


def create_summary_page(inspection, stats, styles):
    """Create inspection summary page"""
    story = []
    
    story.append(Paragraph('<b>Ringkasan Inspeksi</b>', styles['SectionHeader']))
    story.append(Spacer(1, 0.5*cm))
    
    # Score circle (simulated with table)
    score = stats.get('score', 0)
    score_color = BRAND_ACCENT if score >= 80 else (colors.HexColor('#F59E0B') if score >= 60 else colors.HexColor('#EF4444'))
    
    score_data = [[
        Paragraph(f'<font size="28"><b>{score}%</b></font>', 
                  ParagraphStyle(name='ScoreNum', fontName='Times New Roman', alignment=TA_CENTER, textColor=score_color)),
        Paragraph(f'<font size="12"><b>Skor Kondisi</b></font><br/><font size="9">Berdasarkan 160 titik inspeksi</font>', 
                  ParagraphStyle(name='ScoreLabel', fontName='SimHei', alignment=TA_LEFT, leading=14)),
    ]]
    
    score_table = Table(score_data, colWidths=[4*cm, 10*cm])
    score_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (0, 0), 2, score_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(score_table)
    
    story.append(Spacer(1, 1*cm))
    
    # Status distribution
    story.append(Paragraph('<b>Distribusi Status</b>', styles['SectionHeader']))
    
    status_data = [
        [Paragraph('<b>Status</b>', styles['TableHeader']),
         Paragraph('<b>Jumlah</b>', styles['TableHeader']),
         Paragraph('<b>Persentase</b>', styles['TableHeader'])],
    ]
    
    total = stats.get('total', 1)
    for status, label in STATUS_LABELS.items():
        count = stats.get(status, 0)
        pct = round((count / total) * 100) if total > 0 else 0
        status_data.append([
            Paragraph(f'<font color="{STATUS_COLORS[status].hexval()}">●</font> {label}', styles['TableCell']),
            Paragraph(str(count), styles['TableCellCenter']),
            Paragraph(f'{pct}%', styles['TableCellCenter']),
        ])
    
    status_table = Table(status_data, colWidths=[6*cm, 4*cm, 4*cm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E5E5')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(status_table)
    
    story.append(Spacer(1, 1*cm))
    
    # Safety checks
    story.append(Paragraph('<b>Pemeriksaan Keamanan</b>', styles['SectionHeader']))
    
    safety_checks = [
        ('Bebas Kecelakaan', inspection.get('accident_free', True)),
        ('Bebas Banjir', inspection.get('flood_free', True)),
        ('Bebas Kebakaran', inspection.get('fire_free', True)),
        ('Odometer Original', not inspection.get('odometer_tampered', False)),
    ]
    
    safety_data = [[
        Paragraph('<b>Pemeriksaan</b>', styles['TableHeader']),
        Paragraph('<b>Status</b>', styles['TableHeader']),
    ]]
    
    for label, is_ok in safety_checks:
        status_text = '✓ Lolos' if is_ok else '✗ Tidak Lolos'
        status_color = colors.HexColor('#10B981') if is_ok else colors.HexColor('#EF4444')
        safety_data.append([
            Paragraph(label, styles['TableCell']),
            Paragraph(f'<font color="{status_color.hexval()}">{status_text}</font>', styles['TableCellCenter']),
        ])
    
    safety_table = Table(safety_data, colWidths=[10*cm, 4*cm])
    safety_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E5E5')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(safety_table)
    
    story.append(Spacer(1, 1*cm))
    
    # Risk level
    story.append(Paragraph('<b>Tingkat Risiko</b>', styles['SectionHeader']))
    risk_level = inspection.get('risk_level', 'low')
    risk_labels = {'low': 'Rendah', 'medium': 'Sedang', 'high': 'Tinggi', 'very_high': 'Sangat Tinggi'}
    risk_colors = {'low': BRAND_ACCENT, 'medium': colors.HexColor('#F59E0B'), 'high': colors.HexColor('#EF4444'), 'very_high': colors.HexColor('#991B1B')}
    
    risk_text = risk_labels.get(risk_level, risk_level)
    risk_color = risk_colors.get(risk_level, colors.gray)
    
    story.append(Paragraph(
        f'<font size="14" color="{risk_color.hexval()}"><b>● {risk_text}</b></font>',
        ParagraphStyle(name='RiskLevel', fontName='SimHei', alignment=TA_LEFT)
    ))
    
    return story


def create_detail_pages(inspection, grouped_results, styles):
    """Create detailed inspection results pages"""
    story = []
    
    story.append(PageBreak())
    story.append(Paragraph('<b>Detail Hasil Inspeksi</b>', styles['SectionHeader']))
    story.append(Spacer(1, 0.3*cm))
    
    for category, results in grouped_results.items():
        # Category header
        story.append(Paragraph(f'<b>{category}</b>', 
            ParagraphStyle(
                name='CategoryHeader',
                fontName='Microsoft YaHei',
                fontSize=12,
                leading=16,
                textColor=BRAND_PRIMARY,
                spaceBefore=12,
                spaceAfter=6,
            )
        ))
        
        # Items table
        cat_data = [[
            Paragraph('<b>No</b>', styles['TableHeader']),
            Paragraph('<b>Item</b>', styles['TableHeader']),
            Paragraph('<b>Status</b>', styles['TableHeader']),
            Paragraph('<b>Catatan</b>', styles['TableHeader']),
        ]]
        
        for i, result in enumerate(results, 1):
            item = result.get('item', {})
            status = result.get('status', 'baik')
            status_label = STATUS_LABELS.get(status, status)
            notes = result.get('notes', '') or ''
            
            cat_data.append([
                Paragraph(str(i), styles['TableCellCenter']),
                Paragraph(item.get('name', '-'), styles['TableCell']),
                Paragraph(f'<font color="{STATUS_COLORS.get(status, colors.gray).hexval()}">{status_label}</font>', 
                         styles['TableCellCenter']),
                Paragraph(notes[:50] + ('...' if len(notes) > 50 else ''), styles['TableCell']),
            ])
        
        cat_table = Table(cat_data, colWidths=[1*cm, 5*cm, 3*cm, 5*cm])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E5E5')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(cat_table)
        story.append(Spacer(1, 0.3*cm))
    
    return story


def create_footer(canvas, doc):
    """Add footer to each page"""
    canvas.saveState()
    
    # Footer line
    canvas.setStrokeColor(colors.HexColor('#E5E5E5'))
    canvas.line(1.5*cm, 1.5*cm, doc.pagesize[0] - 1.5*cm, 1.5*cm)
    
    # Footer text
    canvas.setFont('SimHei', 8)
    canvas.setFillColor(colors.HexColor('#999999'))
    
    # Left: Certificate number
    canvas.drawString(1.5*cm, 1*cm, f"Dokumen ini diterbitkan secara elektronik oleh AutoMarket")
    
    # Right: Page number
    canvas.drawRightString(doc.pagesize[0] - 1.5*cm, 1*cm, f"Halaman {doc.page}")
    
    canvas.restoreState()


def generate_pdf(input_file, output_file):
    """Generate the inspection certificate PDF"""
    
    # Load inspection data
    with open(input_file, 'r', encoding='utf-8') as f:
        inspection = json.load(f)
    
    # Create document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        leftMargin=1.5*cm,
        rightMargin=1.5*cm,
        topMargin=2*cm,
        bottomMargin=2.5*cm,
        title=f"Sertifikat Inspeksi - {inspection.get('certificate_number', inspection.get('id', '')[:8])}",
        author='AutoMarket',
        creator='AutoMarket',
        subject='Sertifikat Inspeksi Kendaraan 160 Titik',
    )
    
    styles = create_styles()
    story = []
    
    # Get results
    results = inspection.get('results', [])
    grouped_results = group_results_by_category(results)
    stats = calculate_stats(results)
    
    # Build story
    story.extend(create_cover_page(inspection, styles))
    story.extend(create_summary_page(inspection, stats, styles))
    story.extend(create_detail_pages(inspection, grouped_results, styles))
    
    # Build PDF with footer
    doc.build(story, onFirstPage=create_footer, onLaterPages=create_footer)
    
    print(f"PDF generated: {output_file}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python generate-inspection-pdf.py <input.json> <output.pdf>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    generate_pdf(input_file, output_file)
