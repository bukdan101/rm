#!/usr/bin/env python3
"""
Generate Car Inspection Report PDF with 150 inspection items
AutoMarket - Professional Car Marketplace
"""

import os
import random
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

# Register font families for bold support
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Inspection categories with items (total 150 items)
INSPECTION_CATEGORIES = {
    "Eksterior": [
        "Bumper Depan", "Bumper Belakang", "Grille Depan", "Kap Mesin", "Lampu Utama Kiri",
        "Lampu Utama Kanan", "Lampu Kabut Depan", "Lampu Belakang Kiri", "Lampu Belakang Kanan",
        "Lampu Rem Ketiga", "Kaca Depan", "Kaca Belakang", "Kaca Jendela Kiri Depan",
        "Kaca Jendela Kanan Depan", "Kaca Jendela Kiri Belakang", "Kaca Jendela Kanan Belakang",
        "Spion Kiri", "Spion Kanan", "Pintu Depan Kiri", "Pintu Depan Kanan"
    ],  # 20 items
    "Interior": [
        "Dashboard", "Panel Instrumen", "Lampu Dashboard", "Klakson", "Setir/Steering Wheel",
        "Tuas Persneling", "Tuas Rem Tangan", "Pedal Gas", "Pedal Rem", "Pedal Kopling",
        "Kursi Depan Kiri", "Kursi Depan Kanan", "Kursi Belakang", "Jok Kursi", "Cover Jok",
        "Karpet Lantai", "Headliner/Plafon", "AC Sentral"
    ],  # 18 items
    "Mesin": [
        "Blok Mesin", "Kepala Silinder", "Oli Mesin", "Filter Oli", "Radiator",
        "Coolant/Cairan Pendingin", "Selang Radiator", "Kipas Radiator", "Water Pump",
        "Alternator", "Starter Motor", "Belt/V-Belt", "Timing Belt/Chain",
        "Fuel Pump", "Fuel Filter", "Fuel Injector/Karburator", "Air Filter", "Intake Manifold",
        "Exhaust Manifold", "Turbocharger", "Engine Mount Kiri", "Engine Mount Kanan"
    ],  # 22 items
    "Transmisi": [
        "Transmisi Manual/Auto", "Kopling", "Master Kopling", "Slave Kopling", "Flywheel",
        "Gardan/Differential", "Persneling 1", "Persneling 2", "Persneling 3", "Persneling 4",
        "Persneling 5", "Gigi Mundur"
    ],  # 12 items
    "Suspensi": [
        "Shock Absorber Depan Kiri", "Shock Absorber Depan Kanan", "Shock Absorber Belakang Kiri",
        "Shock Absorber Belakang Kanan", "Per Keong Depan Kiri", "Per Keong Depan Kanan",
        "Per Keong Belakang Kiri", "Per Keong Belakang Kanan", "Ball Joint Kiri", "Ball Joint Kanan",
        "Tie Rod End Kiri", "Tie Rod End Kanan"
    ],  # 12 items
    "Rem": [
        "Disc Brake Depan Kiri", "Disc Brake Depan Kanan", "Disc Brake Belakang Kiri",
        "Disc Brake Belakang Kanan", "Brake Pad Depan Kiri", "Brake Pad Depan Kanan",
        "Brake Pad Belakang Kiri", "Brake Pad Belakang Kanan", "Master Rem", "Booster Rem",
        "ABS Sensor", "Brake Fluid"
    ],  # 12 items
    "Kelistrikan": [
        "Baterai/Aki", "Kabel Baterai", "Fuse Box Utama", "ECU/ECM", "Wiring Harness",
        "Ground Connection", "Alternator Output", "Starter Relay", "Ignition Coil"
    ],  # 9 items
    "Ban & Velg": [
        "Ban Depan Kiri", "Ban Depan Kanan", "Ban Belakang Kiri", "Ban Belakang Kanan",
        "Ban Cadangan", "Velg Depan Kiri", "Velg Depan Kanan", "Velg Belakang Kiri",
        "Tekanan Angin Ban", "Tread Depth Ban"
    ],  # 10 items
    "Sistem Kemudi": [
        "Rack & Pinion", "Power Steering Pump", "Power Steering Fluid", "Steering Column",
        "Steering Knuckle Kiri", "Steering Knuckle Kanan"
    ],  # 6 items
    "Exhaust": [
        "Muffler", "Catalytic Converter", "Exhaust Pipe", "Oxygen Sensor", "Tail Pipe"
    ],  # 5 items
    "Fitur Keselamatan": [
        "Airbag Pengemudi", "Airbag Penumpang", "Seatbelt Depan Kiri",
        "Seatbelt Depan Kanan", "Seatbelt Belakang", "ABS System", "EBD System",
        "ESP/Traction Control", "Hill Start Assist", "Immobilizer",
        "Alarm System", "Central Lock"
    ],  # 12 items
    "Fitur Hiburan": [
        "Head Unit", "Speaker Depan Kiri", "Speaker Depan Kanan", "Speaker Belakang Kiri",
        "Speaker Belakang Kanan", "USB Port", "Bluetooth Module", "Navigation System"
    ],  # 8 items
    "Dokumen": [
        "STNK", "BPKB", "Faktur Pembelian", "Buku Service", "Kunci Cadangan", "Manual Book"
    ]  # 6 items
}  # Total: 20+18+22+12+12+12+9+10+6+5+12+8+6 = 150 items

# Status options with Indonesian labels
STATUS_OPTIONS = {
    "istimewa": "Istimewa",
    "baik": "Baik",
    "sedang": "Sedang", 
    "perlu_perbaikan": "Perlu Perbaikan"
}

# Colors for status
STATUS_COLORS = {
    "istimewa": colors.HexColor('#8B5CF6'),  # Purple
    "baik": colors.HexColor('#10B981'),      # Green
    "sedang": colors.HexColor('#F59E0B'),    # Orange/Yellow
    "perlu_perbaikan": colors.HexColor('#EF4444')  # Red
}

# Generate realistic inspection results
def generate_inspection_results():
    """Generate realistic inspection results with random status"""
    results = {}
    total_items = 0
    
    for category, items in INSPECTION_CATEGORIES.items():
        category_results = []
        for item in items:
            # Weighted random status (more good/excellent, fewer problems)
            weights = [15, 55, 20, 10]  # istimewa, baik, sedang, perlu_perbaikan
            status = random.choices(
                ["istimewa", "baik", "sedang", "perlu_perbaikan"],
                weights=weights
            )[0]
            
            # Generate notes for items needing attention
            notes = ""
            if status == "perlu_perbaikan":
                notes_options = [
                    "Perlu diganti",
                    "Kondisi aus, segera ganti",
                    "Ada kebocoran",
                    "Tidak berfungsi optimal",
                    "Bearing berbunyi",
                    "Perlu pengecekan lebih lanjut",
                    "Ada keretakan",
                    "Kabel sudah aus"
                ]
                notes = random.choice(notes_options)
            elif status == "sedang":
                notes_options = [
                    "Masih layak pakai",
                    "Perlu perhatian",
                    "Kondisi cukup",
                    "Akan perlu diganti segera"
                ]
                notes = random.choice(notes_options)
            
            category_results.append({
                "name": item,
                "status": status,
                "notes": notes,
                "severity": "major" if status == "perlu_perbaikan" else ("moderate" if status == "sedang" else "minor")
            })
            total_items += 1
        
        results[category] = category_results
    
    return results, total_items

def calculate_stats(results):
    """Calculate inspection statistics"""
    stats = {"istimewa": 0, "baik": 0, "sedang": 0, "perlu_perbaikan": 0}
    
    for category, items in results.items():
        for item in items:
            stats[item["status"]] += 1
    
    return stats

def generate_pdf():
    """Generate the inspection report PDF"""
    
    # Generate inspection data
    inspection_results, total_items = generate_inspection_results()
    stats = calculate_stats(inspection_results)
    
    # Calculate score (istimewa=100, baik=75, sedang=50, perlu_perbaikan=25)
    total_score = (
        stats["istimewa"] * 100 +
        stats["baik"] * 75 +
        stats["sedang"] * 50 +
        stats["perlu_perbaikan"] * 25
    )
    max_score = total_items * 100
    score_percentage = (total_score / max_score) * 100
    
    # Determine grade
    if score_percentage >= 95:
        grade = "A+"
        risk_level = "low"
    elif score_percentage >= 90:
        grade = "A"
        risk_level = "low"
    elif score_percentage >= 85:
        grade = "B+"
        risk_level = "low"
    elif score_percentage >= 80:
        grade = "B"
        risk_level = "medium"
    elif score_percentage >= 70:
        grade = "C"
        risk_level = "medium"
    elif score_percentage >= 60:
        grade = "D"
        risk_level = "high"
    else:
        grade = "E"
        risk_level = "very_high"
    
    # Create output directory
    output_dir = "/home/z/my-project/upload"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "Inspection_Report_Toyota_Fortuner_2023.pdf")
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    cover_title_style = ParagraphStyle(
        name='CoverTitle',
        fontName='Microsoft YaHei',
        fontSize=28,
        leading=36,
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    cover_subtitle_style = ParagraphStyle(
        name='CoverSubtitle',
        fontName='SimHei',
        fontSize=16,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#64748B')
    )
    
    heading1_style = ParagraphStyle(
        name='CustomHeading1',
        fontName='Microsoft YaHei',
        fontSize=16,
        leading=24,
        alignment=TA_LEFT,
        spaceAfter=12,
        textColor=colors.HexColor('#1E293B')
    )
    
    heading2_style = ParagraphStyle(
        name='CustomHeading2',
        fontName='Microsoft YaHei',
        fontSize=13,
        leading=20,
        alignment=TA_LEFT,
        spaceBefore=16,
        spaceAfter=8,
        textColor=colors.HexColor('#334155')
    )
    
    body_style = ParagraphStyle(
        name='CustomBody',
        fontName='SimHei',
        fontSize=10,
        leading=16,
        alignment=TA_LEFT,
        wordWrap='CJK'
    )
    
    table_header_style = ParagraphStyle(
        name='TableHeader',
        fontName='Microsoft YaHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        name='TableCell',
        fontName='SimHei',
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
        wordWrap='CJK'
    )
    
    table_cell_center = ParagraphStyle(
        name='TableCellCenter',
        fontName='SimHei',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        wordWrap='CJK'
    )
    
    # Build story
    story = []
    
    # ======================= COVER PAGE =======================
    story.append(Spacer(1, 3*cm))
    
    # Logo/Brand
    story.append(Paragraph("<b>AUTOMARKET</b>", cover_title_style))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("Sertifikat Inspeksi Kendaraan", cover_subtitle_style))
    story.append(Spacer(1, 1.5*cm))
    
    # Certificate number
    cert_number = f"INS-{datetime.now().strftime('%Y%m%d')}-{random.randint(10000, 99999)}"
    story.append(Paragraph(f"No. Sertifikat: <b>{cert_number}</b>", ParagraphStyle(
        name='CertNum',
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#64748B')
    )))
    
    story.append(Spacer(1, 2*cm))
    
    # Car info box
    car_info_data = [
        [Paragraph("<b>INFORMASI KENDARAAN</b>", table_header_style)],
        [Paragraph("Toyota Fortuner VRZ 4x2 AT 2023", ParagraphStyle(
            name='CarName',
            fontName='Microsoft YaHei',
            fontSize=18,
            leading=24,
            alignment=TA_CENTER
        ))],
        [Paragraph("SUV | Automatic | 2.4L Diesel Turbo", ParagraphStyle(
            name='CarSpecs',
            fontName='SimHei',
            fontSize=11,
            leading=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#64748B')
        ))],
    ]
    
    car_info_table = Table(car_info_data, colWidths=[14*cm])
    car_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
    ]))
    story.append(car_info_table)
    
    story.append(Spacer(1, 1.5*cm))
    
    # Summary stats on cover
    summary_data = [
        [Paragraph("<b>Total Item</b>", table_cell_center), 
         Paragraph("<b>Istimewa</b>", table_cell_center),
         Paragraph("<b>Baik</b>", table_cell_center),
         Paragraph("<b>Sedang</b>", table_cell_center),
         Paragraph("<b>Perlu Perbaikan</b>", table_cell_center)],
        [Paragraph(str(total_items), table_cell_center),
         Paragraph(str(stats["istimewa"]), table_cell_center),
         Paragraph(str(stats["baik"]), table_cell_center),
         Paragraph(str(stats["sedang"]), table_cell_center),
         Paragraph(str(stats["perlu_perbaikan"]), table_cell_center)]
    ]
    
    summary_table = Table(summary_data, colWidths=[2.8*cm, 2.8*cm, 2.8*cm, 2.8*cm, 2.8*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(summary_table)
    
    story.append(Spacer(1, 1.5*cm))
    
    # Grade and risk level
    grade_box = [
        [Paragraph(f"<b>{grade}</b>", ParagraphStyle(
            name='GradeStyle',
            fontName='Times New Roman',
            fontSize=48,
            leading=56,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#10B981') if grade in ['A+', 'A', 'B+'] else colors.HexColor('#F59E0B')
        ))],
        [Paragraph(f"Skor Inspeksi: {score_percentage:.1f}%", ParagraphStyle(
            name='ScoreStyle',
            fontName='SimHei',
            fontSize=14,
            leading=20,
            alignment=TA_CENTER
        ))],
        [Paragraph(f"Tingkat Risiko: {risk_level.upper()}", ParagraphStyle(
            name='RiskStyle',
            fontName='SimHei',
            fontSize=12,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#10B981') if risk_level == 'low' else colors.HexColor('#F59E0B')
        ))]
    ]
    
    grade_table = Table(grade_box, colWidths=[10*cm])
    grade_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(grade_table)
    
    story.append(Spacer(1, 2*cm))
    
    # Inspection details
    inspector_name = "Ahmad Wijaya"
    inspection_date = datetime.now().strftime("%d %B %Y")
    inspection_place = "AutoMarket Inspection Center - Jakarta Selatan"
    
    details_style = ParagraphStyle(
        name='DetailsStyle',
        fontName='SimHei',
        fontSize=10,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#64748B')
    )
    
    story.append(Paragraph(f"Inspektor: <b>{inspector_name}</b>", details_style))
    story.append(Paragraph(f"Tanggal Inspeksi: <b>{inspection_date}</b>", details_style))
    story.append(Paragraph(f"Lokasi: <b>{inspection_place}</b>", details_style))
    
    story.append(Spacer(1, 1.5*cm))
    
    # Safety check badges
    safety_items = [
        ("Bebas Kecelakaan", random.choice([True, True, True, True, False])),
        ("Bebas Banjir", random.choice([True, True, True, True, False])),
        ("Bebas Kebakaran", random.choice([True, True, True, True, True])),
        ("Odometer Original", random.choice([True, True, True, True, False]))
    ]
    
    safety_data = []
    safety_row = []
    for item, passed in safety_items:
        color = '#10B981' if passed else '#EF4444'
        status_text = "OK" if passed else "PERLU CEK"
        safety_row.append(Paragraph(f"<font color='{color}'><b>{item}</b><br/>{status_text}</font>", table_cell_center))
    
    safety_data.append(safety_row)
    
    safety_table = Table(safety_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    safety_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(safety_table)
    
    story.append(PageBreak())
    
    # ======================= DETAILED INSPECTION =======================
    story.append(Paragraph("<b>DETAIL HASIL INSPEKSI 150 TITIK</b>", heading1_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Vehicle details table
    vehicle_details = [
        ["Merek", "Toyota", "Transmisi", "Automatic"],
        ["Model", "Fortuner", "Bahan Bakar", "Diesel"],
        ["Varian", "VRZ 4x2 AT", "Kapasitas Mesin", "2,393 cc"],
        ["Tahun", "2023", "Jarak Tempuh", "45,230 km"],
        ["Warna", "Silver Metallic", "Nomor Polisi", "B 1234 XYZ"],
        ["Kondisi", "Bekas", "Nomor Rangka", "MHFWM41Gxxx"],
    ]
    
    vehicle_table_data = []
    for row in vehicle_details:
        vehicle_table_data.append([
            Paragraph(f"<b>{row[0]}</b>", table_cell_style),
            Paragraph(row[1], table_cell_style),
            Paragraph(f"<b>{row[2]}</b>", table_cell_style),
            Paragraph(row[3], table_cell_style),
        ])
    
    vehicle_table = Table(vehicle_table_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    vehicle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F1F5F9')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(vehicle_table)
    story.append(Spacer(1, 0.8*cm))
    
    # Inspection results by category
    for category, items in inspection_results.items():
        # Category header
        story.append(Paragraph(f"<b>{category}</b> ({len(items)} item)", heading2_style))
        
        # Category results table
        cat_data = []
        # Header row
        cat_data.append([
            Paragraph("<b>No</b>", table_header_style),
            Paragraph("<b>Item Inspeksi</b>", table_header_style),
            Paragraph("<b>Status</b>", table_header_style),
            Paragraph("<b>Keterangan</b>", table_header_style)
        ])
        
        # Data rows
        for i, item in enumerate(items, 1):
            status_color = STATUS_COLORS[item["status"]]
            cat_data.append([
                Paragraph(str(i), table_cell_center),
                Paragraph(item["name"], table_cell_style),
                Paragraph(f"<font color='{status_color.hexval()}'><b>{STATUS_OPTIONS[item['status']]}</b></font>", table_cell_center),
                Paragraph(item["notes"] if item["notes"] else "-", table_cell_style)
            ])
        
        cat_table = Table(cat_data, colWidths=[1*cm, 5*cm, 3*cm, 5*cm])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            # Alternating row colors
            *[('BACKGROUND', (0, j), (-1, j), colors.HexColor('#F8FAFC') if j % 2 == 0 else colors.white) 
              for j in range(1, len(cat_data))],
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 0.5*cm))
    
    # ======================= SUMMARY PAGE =======================
    story.append(PageBreak())
    story.append(Paragraph("<b>RINGKASAN & REKOMENDASI</b>", heading1_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Summary statistics
    summary_stats_data = [
        [Paragraph("<b>Statistik Inspeksi</b>", table_header_style)],
        [Paragraph(f"Total Item Diperiksa: <b>{total_items}</b>", body_style)],
        [Paragraph(f"Istimewa: <b>{stats['istimewa']}</b> item ({stats['istimewa']/total_items*100:.1f}%)", body_style)],
        [Paragraph(f"Baik: <b>{stats['baik']}</b> item ({stats['baik']/total_items*100:.1f}%)", body_style)],
        [Paragraph(f"Sedang: <b>{stats['sedang']}</b> item ({stats['sedang']/total_items*100:.1f}%)", body_style)],
        [Paragraph(f"Perlu Perbaikan: <b>{stats['perlu_perbaikan']}</b> item ({stats['perlu_perbaikan']/total_items*100:.1f}%)", body_style)],
    ]
    
    summary_stats_table = Table(summary_stats_data, colWidths=[14*cm])
    summary_stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(summary_stats_table)
    story.append(Spacer(1, 0.8*cm))
    
    # Items needing repair
    repair_items = []
    for category, items in inspection_results.items():
        for item in items:
            if item["status"] == "perlu_perbaikan":
                repair_items.append(f"• {category}: {item['name']} - {item['notes']}")
    
    if repair_items:
        story.append(Paragraph("<b>Item yang Memerlukan Perbaikan:</b>", heading2_style))
        for repair in repair_items:
            story.append(Paragraph(repair, body_style))
        story.append(Spacer(1, 0.5*cm))
    
    # Recommendation
    story.append(Paragraph("<b>Rekomendasi:</b>", heading2_style))
    
    if score_percentage >= 90:
        recommendation = """
        Kendaraan dalam kondisi sangat baik dan layak untuk dibeli. Mayoritas komponen dalam 
        kondisi istimewa atau baik. Sedikit item yang memerlukan perhatian dapat ditangani 
        dengan biaya minimal. Kendaraan direkomendasikan untuk pembelian.
        """
    elif score_percentage >= 80:
        recommendation = """
        Kendaraan dalam kondisi baik dengan beberapa item yang memerlukan perhatian. 
        Disarankan untuk melakukan perbaikan pada item-item yang teridentifikasi sebelum 
        penggunaan jangka panjang. Secara umum kendaraan layak untuk dibeli dengan negosiasi harga.
        """
    else:
        recommendation = """
        Kendaraan memerlukan beberapa perbaikan sebelum digunakan. Disarankan untuk 
        memperhitungkan biaya perbaikan dalam negosiasi harga. Lakukan pengecekan lebih lanjut 
        pada item-item yang teridentifikasi bermasalah.
        """
    
    story.append(Paragraph(recommendation.strip(), body_style))
    story.append(Spacer(1, 1*cm))
    
    # Footer with signature
    footer_style = ParagraphStyle(
        name='FooterStyle',
        fontName='SimHei',
        fontSize=9,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#64748B')
    )
    
    story.append(Paragraph("_" * 80, footer_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Dokumen ini dihasilkan secara otomatis oleh sistem AutoMarket", footer_style))
    story.append(Paragraph(f"Tanggal: {inspection_date} | Sertifikat: {cert_number}", footer_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("<b>AUTOMARKET</b> - Platform Jual Beli Mobil Terpercaya", footer_style))
    story.append(Paragraph("www.automarket.id | support@automarket.id", footer_style))
    
    # Build PDF
    doc.build(story)
    
    print(f"PDF generated successfully: {output_path}")
    print(f"Total items: {total_items}")
    print(f"Grade: {grade}")
    print(f"Score: {score_percentage:.1f}%")
    print(f"Risk Level: {risk_level}")
    print(f"Stats: {stats}")
    
    return output_path

if __name__ == "__main__":
    generate_pdf()
