#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AutoMarket Complete Workflow Documentation PDF Generator
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Colors
PRIMARY_COLOR = colors.HexColor('#6366F1')
SECONDARY_COLOR = colors.HexColor('#8B5CF6')
HEADER_BG = colors.HexColor('#1F4E79')
ROW_ODD = colors.HexColor('#F5F5F5')

def create_styles():
    styles = getSampleStyleSheet()
    
    # Cover title
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Microsoft YaHei',
        fontSize=36,
        leading=44,
        alignment=TA_CENTER,
        textColor=PRIMARY_COLOR,
        spaceAfter=20
    ))
    
    # Cover subtitle
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='SimHei',
        fontSize=18,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666'),
        spaceAfter=12
    ))
    
    # Section heading (H1)
    styles.add(ParagraphStyle(
        name='SectionHeading',
        fontName='Microsoft YaHei',
        fontSize=20,
        leading=26,
        alignment=TA_LEFT,
        textColor=PRIMARY_COLOR,
        spaceBefore=20,
        spaceAfter=12
    ))
    
    # Subsection heading (H2)
    styles.add(ParagraphStyle(
        name='SubsectionHeading',
        fontName='Microsoft YaHei',
        fontSize=16,
        leading=22,
        alignment=TA_LEFT,
        textColor=SECONDARY_COLOR,
        spaceBefore=16,
        spaceAfter=10
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='Body',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        spaceBefore=4,
        spaceAfter=8,
        wordWrap='CJK'
    ))
    
    # Bullet text
    styles.add(ParagraphStyle(
        name='BulletText',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        leftIndent=20,
        spaceBefore=2,
        spaceAfter=4,
        wordWrap='CJK'
    ))
    
    # Table header
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white,
        wordWrap='CJK'
    ))
    
    # Table cell
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='SimHei',
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        wordWrap='CJK'
    ))
    
    # Table cell left
    styles.add(ParagraphStyle(
        name='TableCellLeft',
        fontName='SimHei',
        fontSize=9,
        leading=13,
        alignment=TA_LEFT,
        wordWrap='CJK'
    ))
    
    # Flow text (for diagrams)
    styles.add(ParagraphStyle(
        name='FlowText',
        fontName='SimHei',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#444444'),
        wordWrap='CJK'
    ))
    
    return styles

def create_cover_page(story, styles):
    story.append(Spacer(1, 3*cm))
    
    story.append(Paragraph('AutoMarket', styles['CoverTitle']))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph('Complete System Documentation', styles['CoverSubtitle']))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph('Workflow & API Reference', styles['CoverSubtitle']))
    
    story.append(Spacer(1, 2*cm))
    
    # Info table
    info_data = [
        [Paragraph('Version', styles['Body']), Paragraph('1.0.0', styles['Body'])],
        [Paragraph('Last Updated', styles['Body']), Paragraph('March 2026', styles['Body'])],
        [Paragraph('Tech Stack', styles['Body']), Paragraph('Next.js 16, React 19, Supabase', styles['Body'])],
        [Paragraph('Database', styles['Body']), Paragraph('76+ Tables with UUID', styles['Body'])],
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 8*cm])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 2*cm))
    
    # Features list
    story.append(Paragraph('<b>Key Features:</b>', styles['Body']))
    features = [
        'User Authentication (Google OAuth)',
        'KYC Verification System',
        'Credit System with BNI VA Payment',
        'Car Listing Management',
        '160-Point Inspection System',
        'Boost Features (Highlight, Top Search, Featured)',
        'Dealer Registration & Profile',
        'Admin Dashboard APIs',
    ]
    for f in features:
        story.append(Paragraph(f'• {f}', styles['BulletText']))
    
    story.append(PageBreak())

def create_user_journey_section(story, styles):
    story.append(Paragraph('1. User Journey Workflow', styles['SectionHeading']))
    
    story.append(Paragraph(
        'Berikut adalah alur lengkap pengguna dari registrasi hingga dapat memposting iklan:',
        styles['Body']
    ))
    
    # Journey flow table
    flow_data = [
        [Paragraph('<b>Step</b>', styles['TableHeader']),
         Paragraph('<b>Page</b>', styles['TableHeader']),
         Paragraph('<b>Action</b>', styles['TableHeader']),
         Paragraph('<b>Result</b>', styles['TableHeader'])],
        [Paragraph('1', styles['TableCell']),
         Paragraph('/auth', styles['TableCell']),
         Paragraph('Google OAuth Login', styles['TableCellLeft']),
         Paragraph('Profile created (role: buyer)', styles['TableCellLeft'])],
        [Paragraph('2', styles['TableCell']),
         Paragraph('/credits', styles['TableCell']),
         Paragraph('First access', styles['TableCellLeft']),
         Paragraph('Auto 500 credits (first 500 users)', styles['TableCellLeft'])],
        [Paragraph('3', styles['TableCell']),
         Paragraph('/listing/create', styles['TableCell']),
         Paragraph('KYC verification', styles['TableCellLeft']),
         Paragraph('Submit KTP + Selfie', styles['TableCellLeft'])],
        [Paragraph('4', styles['TableCell']),
         Paragraph('/credits', styles['TableCell']),
         Paragraph('Buy credits (if needed)', styles['TableCellLeft']),
         Paragraph('BNI VA payment', styles['TableCellLeft'])],
        [Paragraph('5', styles['TableCell']),
         Paragraph('/listing/create', styles['TableCell']),
         Paragraph('Create listing form', styles['TableCellLeft']),
         Paragraph('-1 credit, status: pending', styles['TableCellLeft'])],
        [Paragraph('6', styles['TableCell']),
         Paragraph('/listing/[id]/inspection', styles['TableCell']),
         Paragraph('Inspection (optional)', styles['TableCellLeft']),
         Paragraph('Grade A-E, PDF cert', styles['TableCellLeft'])],
        [Paragraph('7', styles['TableCell']),
         Paragraph('/credits', styles['TableCell']),
         Paragraph('Boost listing (optional)', styles['TableCellLeft']),
         Paragraph('Highlight/Top/Featured', styles['TableCellLeft'])],
    ]
    
    flow_table = Table(flow_data, colWidths=[1.5*cm, 3.5*cm, 4.5*cm, 5*cm])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (2, 1), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), ROW_ODD),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), ROW_ODD),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 0.5*cm))

def create_kyc_section(story, styles):
    story.append(Paragraph('2. KYC Verification System', styles['SectionHeading']))
    
    story.append(Paragraph(
        'KYC (Know Your Customer) wajib dilakukan sebelum user dapat menjual mobil. '
        'Proses verifikasi membutuhkan 1-2 hari kerja.',
        styles['Body']
    ))
    
    story.append(Paragraph('2.1 KYC Form (4 Steps)', styles['SubsectionHeading']))
    
    kyc_steps = [
        [Paragraph('<b>Step</b>', styles['TableHeader']),
         Paragraph('<b>Fields</b>', styles['TableHeader'])],
        [Paragraph('1. Data Pribadi', styles['TableCellLeft']),
         Paragraph('Nama Lengkap, NIK (16 digit), Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Nomor HP', styles['TableCellLeft'])],
        [Paragraph('2. Alamat', styles['TableCellLeft']),
         Paragraph('Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan, Alamat Lengkap, Kode Pos', styles['TableCellLeft'])],
        [Paragraph('3. Dokumen', styles['TableCellLeft']),
         Paragraph('Upload KTP (image, max 5MB), Upload Selfie dengan KTP (image, max 5MB)', styles['TableCellLeft'])],
        [Paragraph('4. Review', styles['TableCellLeft']),
         Paragraph('Konfirmasi data, Setujui syarat & ketentuan, Submit untuk verifikasi', styles['TableCellLeft'])],
    ]
    
    kyc_table = Table(kyc_steps, colWidths=[3.5*cm, 11*cm])
    kyc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), ROW_ODD),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kyc_table)
    
    story.append(Paragraph('2.2 KYC Status Workflow', styles['SubsectionHeading']))
    story.append(Paragraph('not_submitted → pending → approved ✓', styles['Body']))
    story.append(Paragraph('                    ↓', styles['Body']))
    story.append(Paragraph('               rejected ✗ (dapat ajukan ulang)', styles['Body']))
    story.append(Spacer(1, 0.3*cm))

def create_credit_section(story, styles):
    story.append(Paragraph('3. Credit System', styles['SectionHeading']))
    
    story.append(Paragraph('3.1 Registration Bonus', styles['SubsectionHeading']))
    story.append(Paragraph(
        '500 Kredit GRATIS untuk 500 pendaftar pertama! '
        'Otomatis dikreditkan saat user akses /credits pertama kali.',
        styles['Body']
    ))
    
    story.append(Paragraph('3.2 User Credit Packages', styles['SubsectionHeading']))
    
    user_packages = [
        [Paragraph('<b>Paket</b>', styles['TableHeader']),
         Paragraph('<b>Harga</b>', styles['TableHeader']),
         Paragraph('<b>Kredit</b>', styles['TableHeader']),
         Paragraph('<b>Bonus</b>', styles['TableHeader']),
         Paragraph('<b>Total</b>', styles['TableHeader'])],
        [Paragraph('Starter', styles['TableCell']), Paragraph('Rp 50.000', styles['TableCell']),
         Paragraph('50', styles['TableCell']), Paragraph('0', styles['TableCell']), Paragraph('50', styles['TableCell'])],
        [Paragraph('Basic', styles['TableCell']), Paragraph('Rp 100.000', styles['TableCell']),
         Paragraph('100', styles['TableCell']), Paragraph('+10', styles['TableCell']), Paragraph('110', styles['TableCell'])],
        [Paragraph('Standard', styles['TableCell']), Paragraph('Rp 250.000', styles['TableCell']),
         Paragraph('250', styles['TableCell']), Paragraph('+30', styles['TableCell']), Paragraph('280', styles['TableCell'])],
        [Paragraph('Premium ★', styles['TableCell']), Paragraph('Rp 500.000', styles['TableCell']),
         Paragraph('500', styles['TableCell']), Paragraph('+75', styles['TableCell']), Paragraph('575', styles['TableCell'])],
        [Paragraph('Ultimate', styles['TableCell']), Paragraph('Rp 1.000.000', styles['TableCell']),
         Paragraph('1000', styles['TableCell']), Paragraph('+200', styles['TableCell']), Paragraph('1200', styles['TableCell'])],
    ]
    
    user_table = Table(user_packages, colWidths=[2.5*cm, 2.8*cm, 2*cm, 2*cm, 2*cm])
    user_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#E8F4FD')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(user_table)
    story.append(Spacer(1, 0.3*cm))
    
    story.append(Paragraph('3.3 Dealer Credit Packages (Bonus 20-70% lebih banyak)', styles['SubsectionHeading']))
    
    dealer_packages = [
        [Paragraph('<b>Paket</b>', styles['TableHeader']),
         Paragraph('<b>Harga</b>', styles['TableHeader']),
         Paragraph('<b>Kredit</b>', styles['TableHeader']),
         Paragraph('<b>Bonus</b>', styles['TableHeader']),
         Paragraph('<b>Total</b>', styles['TableHeader'])],
        [Paragraph('Dealer Starter', styles['TableCell']), Paragraph('Rp 200.000', styles['TableCell']),
         Paragraph('250', styles['TableCell']), Paragraph('+50', styles['TableCell']), Paragraph('300', styles['TableCell'])],
        [Paragraph('Dealer Pro ★', styles['TableCell']), Paragraph('Rp 500.000', styles['TableCell']),
         Paragraph('700', styles['TableCell']), Paragraph('+150', styles['TableCell']), Paragraph('850', styles['TableCell'])],
        [Paragraph('Dealer Enterprise', styles['TableCell']), Paragraph('Rp 1.000.000', styles['TableCell']),
         Paragraph('1500', styles['TableCell']), Paragraph('+500', styles['TableCell']), Paragraph('2000', styles['TableCell'])],
        [Paragraph('Dealer Unlimited', styles['TableCell']), Paragraph('Rp 2.500.000', styles['TableCell']),
         Paragraph('4000', styles['TableCell']), Paragraph('+1500', styles['TableCell']), Paragraph('5500', styles['TableCell'])],
    ]
    
    dealer_table = Table(dealer_packages, colWidths=[3.2*cm, 2.8*cm, 2*cm, 2*cm, 2*cm])
    dealer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E8F4FD')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(dealer_table)
    story.append(Spacer(1, 0.3*cm))
    
    story.append(Paragraph('3.4 BNI VA Payment Flow', styles['SubsectionHeading']))
    
    payment_steps = [
        'User pilih paket kredit',
        'Sistem generate VA Number (8808XXXXXXXXXX)',
        'Sistem generate Invoice (INV-YYYYMMDD-XXXX)',
        'Tampilkan instruksi pembayaran (valid 24 jam)',
        'User transfer via BNI ATM/Mobile Banking',
        'User upload bukti transfer',
        'Status → paid (menunggu verifikasi admin)',
        'Admin verifikasi → Status → verified',
        'Credits ditambahkan ke saldo user',
    ]
    
    for i, step in enumerate(payment_steps, 1):
        story.append(Paragraph(f'{i}. {step}', styles['BulletText']))
    
    story.append(Spacer(1, 0.3*cm))

def create_listing_section(story, styles):
    story.append(PageBreak())
    story.append(Paragraph('4. Listing Creation', styles['SectionHeading']))
    
    story.append(Paragraph(
        'Listing form menggunakan 7-step wizard. Setiap listing membutuhkan 1 kredit '
        'dan aktif selama 30 hari.',
        styles['Body']
    ))
    
    listing_steps = [
        [Paragraph('<b>Step</b>', styles['TableHeader']),
         Paragraph('<b>Fields</b>', styles['TableHeader'])],
        [Paragraph('1. Vehicle Info', styles['TableCellLeft']),
         Paragraph('Brand, Model, Variant, Auto-generate title', styles['TableCellLeft'])],
        [Paragraph('2. Details', styles['TableCellLeft']),
         Paragraph('Year, Mileage, Transmission, Fuel, Engine CC, Seats, Colors, Plate, VIN, Condition', styles['TableCellLeft'])],
        [Paragraph('3. Location', styles['TableCellLeft']),
         Paragraph('Province (38), City (514), Address', styles['TableCellLeft'])],
        [Paragraph('4. Pricing', styles['TableCellLeft']),
         Paragraph('Transaction Type, Cash Price, Credit Price, Negotiable, Rental Prices', styles['TableCellLeft'])],
        [Paragraph('5. Images', styles['TableCellLeft']),
         Paragraph('Multiple upload (max 10), Set primary, Reorder', styles['TableCellLeft'])],
        [Paragraph('6. Inspection', styles['TableCellLeft']),
         Paragraph('Optional 160-point inspection (can do later)', styles['TableCellLeft'])],
        [Paragraph('7. Review', styles['TableCellLeft']),
         Paragraph('Review all data, Description, Terms, Publish (-1 kredit)', styles['TableCellLeft'])],
    ]
    
    listing_table = Table(listing_steps, colWidths=[3*cm, 11.5*cm])
    listing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), ROW_ODD),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), ROW_ODD),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(listing_table)
    
    story.append(Paragraph('4.1 Listing Status Workflow', styles['SubsectionHeading']))
    story.append(Paragraph('draft → pending → active ✓', styles['Body']))
    story.append(Paragraph('            ↓         ↓', styles['Body']))
    story.append(Paragraph('        rejected    sold', styles['Body']))
    story.append(Paragraph('            ↓', styles['Body']))
    story.append(Paragraph('      Refund 1 Kredit', styles['Body']))
    story.append(Spacer(1, 0.3*cm))

def create_inspection_section(story, styles):
    story.append(Paragraph('5. Inspection System (160-Point)', styles['SectionHeading']))
    
    story.append(Paragraph(
        'Sistem inspeksi menggunakan 160 item dalam 13 kategori. '
        'Setiap item memiliki 4 status dan akan dihitung otomatis grade dan risk level.',
        styles['Body']
    ))
    
    story.append(Paragraph('5.1 Inspection Categories', styles['SubsectionHeading']))
    
    categories = [
        [Paragraph('<b>#</b>', styles['TableHeader']),
         Paragraph('<b>Category</b>', styles['TableHeader']),
         Paragraph('<b>Items</b>', styles['TableHeader']),
         Paragraph('<b>Critical Items</b>', styles['TableHeader'])],
        [Paragraph('1', styles['TableCell']), Paragraph('Eksterior', styles['TableCell']),
         Paragraph('20', styles['TableCell']), Paragraph('Cat Body, Atap, Kaca', styles['TableCellLeft'])],
        [Paragraph('2', styles['TableCell']), Paragraph('Interior', styles['TableCell']),
         Paragraph('20', styles['TableCell']), Paragraph('AC, Odometer', styles['TableCellLeft'])],
        [Paragraph('3', styles['TableCell']), Paragraph('Mesin', styles['TableCell']),
         Paragraph('25', styles['TableCell']), Paragraph('Start, Suara, Aki', styles['TableCellLeft'])],
        [Paragraph('4', styles['TableCell']), Paragraph('Transmisi', styles['TableCell']),
         Paragraph('10', styles['TableCell']), Paragraph('Pergeseran Gigi', styles['TableCellLeft'])],
        [Paragraph('5', styles['TableCell']), Paragraph('Rangka & Suspensi', styles['TableCell']),
         Paragraph('15', styles['TableCell']), Paragraph('Chassis, Ball Joint', styles['TableCellLeft'])],
        [Paragraph('6', styles['TableCell']), Paragraph('Rem', styles['TableCell']),
         Paragraph('10', styles['TableCell']), Paragraph('Rem Depan, ABS', styles['TableCellLeft'])],
        [Paragraph('7', styles['TableCell']), Paragraph('Ban & Velg', styles['TableCell']),
         Paragraph('8', styles['TableCell']), Paragraph('Semua Ban', styles['TableCellLeft'])],
        [Paragraph('8', styles['TableCell']), Paragraph('Listrik & Elektronik', styles['TableCell']),
         Paragraph('12', styles['TableCell']), Paragraph('Lampu Utama, Rem', styles['TableCellLeft'])],
        [Paragraph('9', styles['TableCell']), Paragraph('Dokumen', styles['TableCell']),
         Paragraph('8', styles['TableCell']), Paragraph('STNK, BPKB', styles['TableCellLeft'])],
        [Paragraph('10', styles['TableCell']), Paragraph('Safety', styles['TableCell']),
         Paragraph('12', styles['TableCell']), Paragraph('Airbag, ESP', styles['TableCellLeft'])],
        [Paragraph('11', styles['TableCell']), Paragraph('Test Drive', styles['TableCell']),
         Paragraph('10', styles['TableCell']), Paragraph('Handling, Rem', styles['TableCellLeft'])],
        [Paragraph('12', styles['TableCell']), Paragraph('Undercarriage', styles['TableCell']),
         Paragraph('5', styles['TableCell']), Paragraph('Chassis', styles['TableCellLeft'])],
        [Paragraph('13', styles['TableCell']), Paragraph('Accident History', styles['TableCell']),
         Paragraph('5', styles['TableCell']), Paragraph('Ex Tabrak, Ex Banjir', styles['TableCellLeft'])],
    ]
    
    cat_table = Table(categories, colWidths=[1*cm, 3.5*cm, 1.5*cm, 5*cm])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(cat_table)
    
    story.append(Paragraph('5.2 Status Options', styles['SubsectionHeading']))
    
    status_data = [
        [Paragraph('<b>Status</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader']),
         Paragraph('<b>Score</b>', styles['TableHeader'])],
        [Paragraph('Istimewa', styles['TableCell']), Paragraph('Like New, kondisi sempurna', styles['TableCellLeft']),
         Paragraph('100%', styles['TableCell'])],
        [Paragraph('Baik', styles['TableCell']), Paragraph('Good, kondisi normal', styles['TableCellLeft']),
         Paragraph('75%', styles['TableCell'])],
        [Paragraph('Sedang', styles['TableCell']), Paragraph('Fair, ada keausan normal', styles['TableCellLeft']),
         Paragraph('50%', styles['TableCell'])],
        [Paragraph('Perlu Perbaikan', styles['TableCell']), Paragraph('Needs Repair', styles['TableCellLeft']),
         Paragraph('25%', styles['TableCell'])],
    ]
    
    status_table = Table(status_data, colWidths=[3*cm, 6*cm, 2*cm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(status_table)
    
    story.append(Paragraph('5.3 Grade Calculation', styles['SubsectionHeading']))
    
    grade_data = [
        [Paragraph('<b>Grade</b>', styles['TableHeader']),
         Paragraph('<b>Score</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader'])],
        [Paragraph('A+', styles['TableCell']), Paragraph('95-100', styles['TableCell']), Paragraph('Istimewa', styles['TableCell'])],
        [Paragraph('A', styles['TableCell']), Paragraph('85-94', styles['TableCell']), Paragraph('Sangat Baik', styles['TableCell'])],
        [Paragraph('B+', styles['TableCell']), Paragraph('75-84', styles['TableCell']), Paragraph('Baik', styles['TableCell'])],
        [Paragraph('B', styles['TableCell']), Paragraph('65-74', styles['TableCell']), Paragraph('Cukup Baik', styles['TableCell'])],
        [Paragraph('C', styles['TableCell']), Paragraph('50-64', styles['TableCell']), Paragraph('Sedang', styles['TableCell'])],
        [Paragraph('D', styles['TableCell']), Paragraph('35-49', styles['TableCell']), Paragraph('Kurang Baik', styles['TableCell'])],
        [Paragraph('E', styles['TableCell']), Paragraph('0-34', styles['TableCell']), Paragraph('Perlu Perbaikan', styles['TableCell'])],
    ]
    
    grade_table = Table(grade_data, colWidths=[2*cm, 2.5*cm, 6*cm])
    grade_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(grade_table)

def create_boost_section(story, styles):
    story.append(PageBreak())
    story.append(Paragraph('6. Boost Features', styles['SectionHeading']))
    
    story.append(Paragraph(
        'Boost features meningkatkan visibilitas listing. Bisa di-stack (kombinasi multiple boost).',
        styles['Body']
    ))
    
    boost_data = [
        [Paragraph('<b>Boost</b>', styles['TableHeader']),
         Paragraph('<b>Kredit</b>', styles['TableHeader']),
         Paragraph('<b>Durasi</b>', styles['TableHeader']),
         Paragraph('<b>Benefits</b>', styles['TableHeader'])],
        [Paragraph('Highlight', styles['TableCell']), Paragraph('3', styles['TableCell']),
         Paragraph('7 hari', styles['TableCell']),
         Paragraph('Background kuning, Lebih mudah dilihat', styles['TableCellLeft'])],
        [Paragraph('Top Search', styles['TableCell']), Paragraph('5', styles['TableCell']),
         Paragraph('7 hari', styles['TableCell']),
         Paragraph('Posisi teratas, Visibilitas 3x lipat', styles['TableCellLeft'])],
        [Paragraph('Featured', styles['TableCell']), Paragraph('10', styles['TableCell']),
         Paragraph('14 hari', styles['TableCell']),
         Paragraph('Home page, Badge eksklusif, Eksposur maksimal', styles['TableCellLeft'])],
    ]
    
    boost_table = Table(boost_data, colWidths=[2.5*cm, 2*cm, 2*cm, 7*cm])
    boost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(boost_table)
    
    story.append(Paragraph('6.1 Refund Policy', styles['SubsectionHeading']))
    story.append(Paragraph('• Boost dibatalkan dengan sisa > 50% → Refund proporsional', styles['BulletText']))
    story.append(Paragraph('• Boost dibatalkan dengan sisa ≤ 50% → No refund', styles['BulletText']))
    story.append(Spacer(1, 0.3*cm))

def create_cost_section(story, styles):
    story.append(Paragraph('7. Cost Summary', styles['SectionHeading']))
    
    cost_data = [
        [Paragraph('<b>Action</b>', styles['TableHeader']),
         Paragraph('<b>Credit Cost</b>', styles['TableHeader']),
         Paragraph('<b>Duration</b>', styles['TableHeader'])],
        [Paragraph('Post Listing', styles['TableCell']), Paragraph('1 kredit', styles['TableCell']),
         Paragraph('30 hari', styles['TableCell'])],
        [Paragraph('Extend Listing', styles['TableCell']), Paragraph('1 kredit', styles['TableCell']),
         Paragraph('30 hari', styles['TableCell'])],
        [Paragraph('Highlight Boost', styles['TableCell']), Paragraph('3 kredit', styles['TableCell']),
         Paragraph('7 hari', styles['TableCell'])],
        [Paragraph('Top Search Boost', styles['TableCell']), Paragraph('5 kredit', styles['TableCell']),
         Paragraph('7 hari', styles['TableCell'])],
        [Paragraph('Featured Boost', styles['TableCell']), Paragraph('10 kredit', styles['TableCell']),
         Paragraph('14 hari', styles['TableCell'])],
    ]
    
    cost_table = Table(cost_data, colWidths=[4*cm, 3.5*cm, 3*cm])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cost_table)
    story.append(Spacer(1, 0.5*cm))

def create_api_section(story, styles):
    story.append(Paragraph('8. API Reference', styles['SectionHeading']))
    
    # Credit APIs
    story.append(Paragraph('8.1 Credit APIs', styles['SubsectionHeading']))
    
    credit_apis = [
        [Paragraph('<b>Endpoint</b>', styles['TableHeader']),
         Paragraph('<b>Method</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader'])],
        [Paragraph('/api/credits/balance', styles['TableCellLeft']), Paragraph('GET', styles['TableCell']),
         Paragraph('Get user credit balance', styles['TableCellLeft'])],
        [Paragraph('/api/credits/packages', styles['TableCellLeft']), Paragraph('GET', styles['TableCell']),
         Paragraph('Get credit packages', styles['TableCellLeft'])],
        [Paragraph('/api/credits/transactions', styles['TableCellLeft']), Paragraph('GET', styles['TableCell']),
         Paragraph('Get transaction history', styles['TableCellLeft'])],
        [Paragraph('/api/credits/payments', styles['TableCellLeft']), Paragraph('GET/POST/PUT', styles['TableCell']),
         Paragraph('Payment management', styles['TableCellLeft'])],
        [Paragraph('/api/credits/deduct', styles['TableCellLeft']), Paragraph('POST', styles['TableCell']),
         Paragraph('Deduct credits', styles['TableCellLeft'])],
        [Paragraph('/api/credits/boosts', styles['TableCellLeft']), Paragraph('GET/POST/DELETE', styles['TableCell']),
         Paragraph('Boost management', styles['TableCellLeft'])],
    ]
    
    credit_table = Table(credit_apis, colWidths=[4.5*cm, 2.5*cm, 5.5*cm])
    credit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(credit_table)
    
    # Listing APIs
    story.append(Paragraph('8.2 Listing APIs', styles['SubsectionHeading']))
    
    listing_apis = [
        [Paragraph('<b>Endpoint</b>', styles['TableHeader']),
         Paragraph('<b>Method</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader'])],
        [Paragraph('/api/listings', styles['TableCellLeft']), Paragraph('GET/POST', styles['TableCell']),
         Paragraph('Get/Create listings', styles['TableCellLeft'])],
        [Paragraph('/api/listings/[id]', styles['TableCellLeft']), Paragraph('GET/PUT/DELETE', styles['TableCell']),
         Paragraph('Single listing CRUD', styles['TableCellLeft'])],
        [Paragraph('/api/inspections', styles['TableCellLeft']), Paragraph('GET/POST', styles['TableCell']),
         Paragraph('Inspection CRUD', styles['TableCellLeft'])],
        [Paragraph('/api/inspections/export-pdf', styles['TableCellLeft']), Paragraph('POST', styles['TableCell']),
         Paragraph('Export PDF certificate', styles['TableCellLeft'])],
    ]
    
    listing_api_table = Table(listing_apis, colWidths=[4.5*cm, 2.5*cm, 5.5*cm])
    listing_api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(listing_api_table)
    
    # Admin APIs
    story.append(Paragraph('8.3 Admin APIs', styles['SubsectionHeading']))
    
    admin_apis = [
        [Paragraph('<b>Endpoint</b>', styles['TableHeader']),
         Paragraph('<b>Method</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader'])],
        [Paragraph('/api/admin/payments', styles['TableCellLeft']), Paragraph('GET/PUT', styles['TableCell']),
         Paragraph('Payment verification', styles['TableCellLeft'])],
        [Paragraph('/api/admin/credits', styles['TableCellLeft']), Paragraph('GET/PUT', styles['TableCell']),
         Paragraph('Credit adjustment', styles['TableCellLeft'])],
    ]
    
    admin_table = Table(admin_apis, colWidths=[4.5*cm, 2.5*cm, 5.5*cm])
    admin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(admin_table)

def create_pages_section(story, styles):
    story.append(PageBreak())
    story.append(Paragraph('9. Pages Reference', styles['SectionHeading']))
    
    pages_data = [
        [Paragraph('<b>Path</b>', styles['TableHeader']),
         Paragraph('<b>Description</b>', styles['TableHeader'])],
        [Paragraph('/', styles['TableCellLeft']), Paragraph('Landing page with featured listings', styles['TableCellLeft'])],
        [Paragraph('/auth', styles['TableCellLeft']), Paragraph('Login/Register with Google OAuth', styles['TableCellLeft'])],
        [Paragraph('/listing/create', styles['TableCellLeft']), Paragraph('Create new listing (KYC + Credit check)', styles['TableCellLeft'])],
        [Paragraph('/listing/[id]/edit', styles['TableCellLeft']), Paragraph('Edit existing listing', styles['TableCellLeft'])],
        [Paragraph('/listing/[id]/inspection', styles['TableCellLeft']), Paragraph('160-point inspection form', styles['TableCellLeft'])],
        [Paragraph('/credits', styles['TableCellLeft']), Paragraph('Credit management, packages, boost, history', styles['TableCellLeft'])],
        [Paragraph('/dealer/[slug]', styles['TableCellLeft']), Paragraph('Dealer profile with map', styles['TableCellLeft'])],
        [Paragraph('/user/[id]', styles['TableCellLeft']), Paragraph('User profile', styles['TableCellLeft'])],
        [Paragraph('/onboarding', styles['TableCellLeft']), Paragraph('Dealer registration with documents', styles['TableCellLeft'])],
    ]
    
    pages_table = Table(pages_data, colWidths=[4*cm, 9*cm])
    pages_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(pages_table)
    story.append(Spacer(1, 0.5*cm))

def main():
    output_path = '/home/z/my-project/download/AutoMarket_Workflow_Documentation.pdf'
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=2*cm,
        bottomMargin=2*cm,
        leftMargin=2*cm,
        rightMargin=2*cm,
        title='AutoMarket Workflow Documentation',
        author='Z.ai',
        creator='Z.ai',
        subject='Complete system workflow documentation for AutoMarket car marketplace'
    )
    
    styles = create_styles()
    story = []
    
    # Create sections
    create_cover_page(story, styles)
    create_user_journey_section(story, styles)
    create_kyc_section(story, styles)
    create_credit_section(story, styles)
    create_listing_section(story, styles)
    create_inspection_section(story, styles)
    create_boost_section(story, styles)
    create_cost_section(story, styles)
    create_api_section(story, styles)
    create_pages_section(story, styles)
    
    # Build PDF
    doc.build(story)
    
    print(f'PDF generated successfully: {output_path}')
    return output_path

if __name__ == '__main__':
    main()
