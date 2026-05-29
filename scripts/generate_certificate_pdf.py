#!/usr/bin/env python3
"""
AutoMarket Inspection Certificate PDF Generator
Generates a professional PDF certificate for vehicle inspection
"""

import json
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Load inspection data
with open('/home/z/my-project/download/inspection_data.json', 'r') as f:
    data = json.load(f)

inspection = data['inspection']
categories = data['categories']
summary = data['summary']
car = inspection['car_listings']

# Grade colors
grade_colors = {
    'A': colors.HexColor('#22C55E'),
    'B': colors.HexColor('#3B82F6'),
    'C': colors.HexColor('#EAB308'),
    'D': colors.HexColor('#EF4444')
}

grade_labels = {
    'A': 'SANGAT BAIK',
    'B': 'BAIK',
    'C': 'CUKUP',
    'D': 'PERLU PERBAIKAN'
}

# Create PDF
pdf_path = '/home/z/my-project/download/Sertifikat_Inspeksi_INS-2026-74302.pdf'
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    rightMargin=1.5*cm,
    leftMargin=1.5*cm,
    topMargin=1.5*cm,
    bottomMargin=1.5*cm,
    title='Sertifikat Inspeksi INS-2026-74302',
    author='Z.ai',
    creator='Z.ai',
    subject='Sertifikat Inspeksi Kendaraan'
)

# Define styles
styles = getSampleStyleSheet()

# Custom styles with unique names
styles.add(ParagraphStyle(
    name='CertMainTitle',
    fontName='Times New Roman',
    fontSize=24,
    leading=28,
    alignment=TA_CENTER,
    textColor=colors.white,
    spaceAfter=6
))

styles.add(ParagraphStyle(
    name='CertSubTitle',
    fontName='Times New Roman',
    fontSize=12,
    leading=16,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#BFDBFE')
))

styles.add(ParagraphStyle(
    name='CertSectionTitle',
    fontName='SimHei',
    fontSize=12,
    leading=16,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#1E40AF'),
    spaceBefore=12,
    spaceAfter=6
))

styles.add(ParagraphStyle(
    name='CertBody',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertBodySmall',
    fontName='SimHei',
    fontSize=8,
    leading=10,
    alignment=TA_LEFT,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertCenter',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertGrade',
    fontName='Times New Roman',
    fontSize=36,
    leading=40,
    alignment=TA_CENTER,
    textColor=colors.white
))

styles.add(ParagraphStyle(
    name='CertScore',
    fontName='Times New Roman',
    fontSize=48,
    leading=52,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1E40AF')
))

styles.add(ParagraphStyle(
    name='CertTableHeader',
    fontName='SimHei',
    fontSize=9,
    leading=11,
    alignment=TA_CENTER,
    textColor=colors.white,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertTableCell',
    fontName='SimHei',
    fontSize=8,
    leading=10,
    alignment=TA_LEFT,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertTableCellCenter',
    fontName='SimHei',
    fontSize=8,
    leading=10,
    alignment=TA_CENTER,
    wordWrap='CJK'
))

styles.add(ParagraphStyle(
    name='CertFooter',
    fontName='SimHei',
    fontSize=8,
    leading=10,
    alignment=TA_CENTER,
    textColor=colors.gray,
    wordWrap='CJK'
))

story = []

# ==================== PAGE 1: COVER & SUMMARY ====================

# Header box
header_data = [[
    Paragraph('SERTIFIKAT INSPEKSI', styles['CertMainTitle']),
    Paragraph('AutoMarket Inspection Certificate', styles['CertSubTitle'])
]]
header_table = Table(header_data, colWidths=[15*cm])
header_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1E40AF')),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 15),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
]))
story.append(header_table)
story.append(Spacer(1, 0.5*cm))

# Certificate number
cert_num_text = f'<b>No. Sertifikat:</b> {inspection["certificate_number"]}'
story.append(Paragraph(cert_num_text, styles['CertCenter']))
story.append(Spacer(1, 0.3*cm))

# Vehicle Info
story.append(Paragraph('<b>INFORMASI KENDARAAN</b>', styles['CertSectionTitle']))

vehicle_info = [
    ['Kendaraan', f'{car["brands"]["name"]} {car["car_models"]["name"]}', 'Tahun', str(car['year'])],
    ['Transmisi', car['transmission'].capitalize(), 'Bahan Bakar', car['fuel'].capitalize()],
    ['Kilometer', f'{car["mileage"]:,} km', 'Tipe Bodi', car['body_type'].capitalize()],
    ['Lokasi', f'{car["city"]}, {car["province"]}', 'Harga', f'Rp {car["price_cash"]:,}'],
]

vehicle_table = Table(vehicle_info, colWidths=[3*cm, 5*cm, 3*cm, 5*cm])
vehicle_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
    ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F3F4F6')),
    ('FONTNAME', (0, 0), (-1, -1), 'SimHei'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#6B7280')),
    ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#6B7280')),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(vehicle_table)
story.append(Spacer(1, 0.5*cm))

# Score & Grade
story.append(Paragraph('<b>HASIL INSPEKSI</b>', styles['CertSectionTitle']))

# Grade and Score boxes
grade_color = grade_colors.get(summary['grade'], colors.gray)
grade_label = grade_labels.get(summary['grade'], 'TIDAK DINILAI')

score_data = [[
    Paragraph(f'<b>{summary["grade"]}</b>', styles['CertGrade']),
    Paragraph(f'<b>{summary["score"]}%</b>', styles['CertScore'])
], [
    Paragraph(grade_label, styles['CertCenter']),
    Paragraph('Skor Keseluruhan', styles['CertCenter'])
], [
    Paragraph(f'{summary["passed"]}/{summary["total_items"]} item lulus', styles['CertBodySmall']),
    Paragraph('', styles['CertBodySmall'])
]]

score_table = Table(score_data, colWidths=[8*cm, 8*cm])
score_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, 0), grade_color),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (0, 0), 20),
    ('BOTTOMPADDING', (0, 0), (0, 0), 5),
    ('TOPPADDING', (0, 1), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F9FAFB')),
    ('BOX', (0, 0), (0, -1), 1, grade_color),
    ('BOX', (1, 0), (1, -1), 1, colors.HexColor('#E5E7EB')),
]))
story.append(score_table)
story.append(Spacer(1, 0.5*cm))

# Safety Status
story.append(Paragraph('<b>STATUS KEAMANAN</b>', styles['CertSectionTitle']))

safety_items = [
    ('Bebas Kecelakaan', inspection['accident_free']),
    ('Bebas Banjir', inspection['flood_free']),
    ('Bebas Kebakaran', inspection['fire_free']),
    ('Odometer Asli', not inspection['odometer_tampered'])
]

safety_data = []
for label, status in safety_items:
    status_color = colors.HexColor('#16A34A') if status else colors.HexColor('#DC2626')
    check = 'YA' if status else 'TIDAK'
    symbol = 'OK' if status else 'X'
    safety_data.append([
        Paragraph(f'[{symbol}] {label}', styles['CertTableCell']),
        Paragraph(f'<font color="{status_color.hexval()}"><b>{check}</b></font>', styles['CertTableCellCenter'])
    ])

safety_table = Table(safety_data, colWidths=[12*cm, 4*cm])
safety_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(safety_table)
story.append(Spacer(1, 0.5*cm))

# Category Summary
story.append(Paragraph('<b>RINGKASAN PER KATEGORI (160 ITEM)</b>', styles['CertSectionTitle']))

cat_header = [
    Paragraph('<b>Kategori</b>', styles['CertTableHeader']),
    Paragraph('<b>Skor</b>', styles['CertTableHeader']),
    Paragraph('<b>Lulus</b>', styles['CertTableHeader']),
    Paragraph('<b>Kategori</b>', styles['CertTableHeader']),
    Paragraph('<b>Skor</b>', styles['CertTableHeader']),
    Paragraph('<b>Lulus</b>', styles['CertTableHeader']),
]

cat_data = [cat_header]
for i in range(0, len(categories), 2):
    row = []
    for j in range(2):
        if i + j < len(categories):
            cat = categories[i + j]
            score_color = colors.HexColor('#16A34A') if cat['score'] >= 80 else (
                colors.HexColor('#CA8A04') if cat['score'] >= 60 else colors.HexColor('#DC2626')
            )
            row.extend([
                Paragraph(cat['name'], styles['CertTableCell']),
                Paragraph(f'<font color="{score_color.hexval()}"><b>{cat["score"]}%</b></font>', styles['CertTableCellCenter']),
                Paragraph(f'{cat["passed"]}/{len(cat["items"])}', styles['CertTableCellCenter'])
            ])
        else:
            row.extend(['', '', ''])
    cat_data.append(row)

cat_table = Table(cat_data, colWidths=[3*cm, 2*cm, 2.5*cm, 3*cm, 2*cm, 2.5*cm])
cat_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
]))
story.append(cat_table)
story.append(Spacer(1, 0.5*cm))

# Recommendation
rec_color = colors.HexColor('#DCFCE7') if inspection['recommended'] else colors.HexColor('#FEE2E2')
rec_border = colors.HexColor('#16A34A') if inspection['recommended'] else colors.HexColor('#DC2626')
rec_text = 'KENDARAAN DIREKOMENDASIKAN' if inspection['recommended'] else 'PERLU PERTIMBANGAN'
rec_desc = 'Kendaraan ini layak untuk dibeli' if inspection['recommended'] else 'Ada item yang memerlukan perbaikan'

rec_data = [[
    Paragraph(f'<b>{rec_text}</b><br/><font size="8">{rec_desc}</font>', styles['CertBody'])
]]
rec_table = Table(rec_data, colWidths=[16*cm])
rec_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), rec_color),
    ('BOX', (0, 0), (-1, -1), 2, rec_border),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('LEFTPADDING', (0, 0), (-1, -1), 15),
]))
story.append(rec_table)
story.append(Spacer(1, 0.3*cm))

# Validity
validity_text = f"<b>Tanggal Inspeksi:</b> {inspection['inspection_date'][:10]} | <b>Berlaku Hingga:</b> {inspection['certificate_expires_at'][:10]}"
story.append(Paragraph(validity_text, styles['CertFooter']))

story.append(PageBreak())

# ==================== PAGE 2+: DETAILED ITEMS ====================

story.append(Paragraph('<b>DETAIL 160 ITEM INSPEKSI</b>', styles['CertSectionTitle']))
story.append(Spacer(1, 0.3*cm))

for cat in categories:
    # Category header
    score_color = colors.HexColor('#16A34A') if cat['score'] >= 80 else (
        colors.HexColor('#CA8A04') if cat['score'] >= 60 else colors.HexColor('#DC2626')
    )
    
    cat_header_data = [[
        Paragraph(f'<b>{cat["name"]}</b> - {cat["score"]}% ({cat["passed"]}/{len(cat["items"])} lulus)', styles['CertTableCell'])
    ]]
    cat_header_table = Table(cat_header_data, colWidths=[16*cm])
    cat_header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), score_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(cat_header_table)
    
    # Items table
    item_header = [
        Paragraph('<b>No</b>', styles['CertTableCellCenter']),
        Paragraph('<b>Item Inspeksi</b>', styles['CertTableCell']),
        Paragraph('<b>Keterangan</b>', styles['CertTableCell']),
        Paragraph('<b>Status</b>', styles['CertTableCellCenter']),
    ]
    
    item_data = [item_header]
    for idx, item in enumerate(cat['items'], 1):
        status_color = colors.HexColor('#16A34A') if item['status'] == 'baik' else colors.HexColor('#DC2626')
        status_text = 'Baik' if item['status'] == 'baik' else 'Perlu Perbaikan'
        critical_badge = ' [KRITIS]' if item['is_critical'] else ''
        
        item_data.append([
            Paragraph(str(item['display_order'] or idx), styles['CertTableCellCenter']),
            Paragraph(f"{item['name']}{critical_badge}", styles['CertTableCell']),
            Paragraph(item['description'][:45] + ('...' if len(item['description']) > 45 else ''), styles['CertTableCell']),
            Paragraph(f'<font color="{status_color.hexval()}"><b>{status_text}</b></font>', styles['CertTableCellCenter'])
        ])
    
    item_table = Table(item_data, colWidths=[1*cm, 4.5*cm, 7.5*cm, 3*cm])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
    ]))
    story.append(item_table)
    story.append(Spacer(1, 0.2*cm))

# Footer
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph('<b>AutoMarket Inspection Service</b>', styles['CertCenter']))
story.append(Paragraph('Sertifikat ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah', styles['CertFooter']))
story.append(Paragraph('2026 AutoMarket - All rights reserved', styles['CertFooter']))

# Build PDF
doc.build(story)

print(f"PDF created successfully: {pdf_path}")
