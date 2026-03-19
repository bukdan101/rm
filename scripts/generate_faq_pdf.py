#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AutoMarket FAQ PDF Generator - VERSION 2
FAQ tentang Workflow Listing Mobil dengan Sistem Kredit Token
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font family for bold support
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Define colors
PRIMARY_BLUE = colors.HexColor('#1F4E79')
SECONDARY_BLUE = colors.HexColor('#2E86AB')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
DARK_GRAY = colors.HexColor('#333333')
GREEN_COLOR = colors.HexColor('#28A745')
ORANGE_COLOR = colors.HexColor('#FF8C00')
RED_COLOR = colors.HexColor('#DC3545')

def create_faq_pdf():
    # Setup document
    output_path = '/home/z/my-project/public/docs/AutoMarket_FAQ_Listing.pdf'
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title='AutoMarket FAQ - Panduan Listing Mobil',
        author='Z.ai',
        creator='Z.ai',
        subject='FAQ tentang workflow listing mobil di AutoMarket dengan sistem kredit token'
    )
    
    # Setup styles
    styles = getSampleStyleSheet()
    
    # Cover title style
    cover_title_style = ParagraphStyle(
        name='CoverTitle',
        fontName='Microsoft YaHei',
        fontSize=36,
        leading=44,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    # Cover subtitle style
    cover_subtitle_style = ParagraphStyle(
        name='CoverSubtitle',
        fontName='SimHei',
        fontSize=18,
        leading=26,
        alignment=TA_CENTER,
        textColor=SECONDARY_BLUE,
        spaceAfter=40
    )
    
    # Section header style
    section_style = ParagraphStyle(
        name='SectionHeader',
        fontName='Microsoft YaHei',
        fontSize=18,
        leading=26,
        alignment=TA_LEFT,
        textColor=PRIMARY_BLUE,
        spaceBefore=24,
        spaceAfter=12
    )
    
    # Subsection style
    subsection_style = ParagraphStyle(
        name='SubsectionHeader',
        fontName='Microsoft YaHei',
        fontSize=14,
        leading=20,
        alignment=TA_LEFT,
        textColor=SECONDARY_BLUE,
        spaceBefore=16,
        spaceAfter=8
    )
    
    # Body text style
    body_style = ParagraphStyle(
        name='BodyText',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        spaceBefore=6,
        spaceAfter=6,
        wordWrap='CJK'
    )
    
    # Question style
    question_style = ParagraphStyle(
        name='Question',
        fontName='Microsoft YaHei',
        fontSize=12,
        leading=18,
        alignment=TA_LEFT,
        textColor=PRIMARY_BLUE,
        spaceBefore=12,
        spaceAfter=6,
        wordWrap='CJK'
    )
    
    # Answer style
    answer_style = ParagraphStyle(
        name='Answer',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        spaceBefore=4,
        spaceAfter=8,
        leftIndent=20,
        wordWrap='CJK'
    )
    
    # Bullet style
    bullet_style = ParagraphStyle(
        name='BulletText',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        leftIndent=30,
        wordWrap='CJK'
    )
    
    # Important note style
    note_style = ParagraphStyle(
        name='NoteText',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        textColor=RED_COLOR,
        spaceBefore=8,
        spaceAfter=8,
        leftIndent=20,
        wordWrap='CJK'
    )
    
    # Table header style
    table_header_style = ParagraphStyle(
        name='TableHeader',
        fontName='Microsoft YaHei',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white
    )
    
    # Table cell style
    table_cell_style = ParagraphStyle(
        name='TableCell',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        wordWrap='CJK'
    )
    
    # Table cell center style
    table_cell_center_style = ParagraphStyle(
        name='TableCellCenter',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=DARK_GRAY,
        wordWrap='CJK'
    )
    
    # Build story
    story = []
    
    # ========== COVER PAGE ==========
    story.append(Spacer(1, 80))
    story.append(Paragraph('<b>AutoMarket</b>', cover_title_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph('Panduan Lengkap Listing Mobil', cover_subtitle_style))
    story.append(Spacer(1, 40))
    story.append(Paragraph('FAQ - Frequently Asked Questions', ParagraphStyle(
        name='CoverInfo',
        fontName='SimHei',
        fontSize=14,
        leading=20,
        alignment=TA_CENTER,
        textColor=DARK_GRAY
    )))
    story.append(Spacer(1, 30))
    
    # Cover info box
    cover_info_data = [[
        Paragraph('<b>Tentang Dokumen Ini</b>', ParagraphStyle(
            name='CoverInfoTitle',
            fontName='Microsoft YaHei',
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=PRIMARY_BLUE
        ))],
        [Paragraph('Dokumen ini menjelaskan 3 metode listing mobil di AutoMarket:<br/><br/>'
                   '<b>1. Dealer Marketplace</b> - Sistem bidding untuk dealer (pakai token)<br/>'
                   '<b>2. Marketplace Umum</b> - Kontak langsung via WhatsApp (pakai token)<br/>'
                   '<b>3. Tawar via Chat Platform</b> - Terdokumentasi dengan escrow (pakai token)<br/><br/>'
                   '<font color="#DC3545"><b>SEMUA LISTING MENGGUNAKAN KREDIT TOKEN</b></font>',
                   ParagraphStyle(
                       name='CoverInfoContent',
                       fontName='SimHei',
                       fontSize=11,
                       leading=16,
                       alignment=TA_CENTER,
                       textColor=DARK_GRAY
                   ))]]
    
    cover_table = Table(cover_info_data, colWidths=[14*cm])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(cover_table)
    
    story.append(Spacer(1, 60))
    story.append(Paragraph('Versi 2.0 | 2025', ParagraphStyle(
        name='CoverVersion',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey
    )))
    
    story.append(PageBreak())
    
    # ========== SECTION 1: SISTEM KREDIT TOKEN ==========
    story.append(Paragraph('<b>1. Sistem Kredit Token</b>', section_style))
    
    # Important notice box
    notice_data = [[
        Paragraph('<font color="#DC3545"><b>⚠ PENTING: SEMUA LISTING BERBAYAR</b></font><br/><br/>'
                  'AutoMarket menggunakan sistem Kredit Token untuk semua jenis listing. '
                  'Tidak ada listing gratis di platform ini. Setiap listing akan memotong saldo token Anda.',
                  ParagraphStyle(
                      name='NoticeText',
                      fontName='SimHei',
                      fontSize=11,
                      leading=16,
                      alignment=TA_LEFT,
                      textColor=DARK_GRAY
                  ))
    ]]
    
    notice_table = Table(notice_data, colWidths=[14*cm])
    notice_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFF3CD')),
        ('BOX', (0, 0), (-1, -1), 2, ORANGE_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(notice_table)
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph('<b>1.1 Apa itu Kredit Token?</b>', question_style))
    story.append(Paragraph(
        'Kredit Token adalah sistem pembayaran internal AutoMarket. Setiap token bernilai Rp 10.000. '
        'Token digunakan untuk membayar berbagai layanan di platform termasuk listing mobil, '
        'inspeksi, dan fitur premium lainnya.',
        answer_style
    ))
    
    story.append(Paragraph('<b>1.2 Bagaimana cara membeli Token?</b>', question_style))
    story.append(Paragraph('Cara membeli Token:', answer_style))
    story.append(Paragraph('1. Login ke akun AutoMarket Anda', bullet_style))
    story.append(Paragraph('2. Klik menu "Token" atau "Top Up"', bullet_style))
    story.append(Paragraph('3. Pilih paket token yang diinginkan', bullet_style))
    story.append(Paragraph('4. Pembayaran via transfer bank, e-wallet, atau kartu kredit', bullet_style))
    story.append(Paragraph('5. Token otomatis masuk ke saldo akun Anda', bullet_style))
    
    story.append(Spacer(1, 8))
    
    # Token pricing table
    story.append(Paragraph('<b>Paket Token Tersedia:</b>', subsection_style))
    
    token_data = [
        [
            Paragraph('<b>Paket</b>', table_header_style),
            Paragraph('<b>Jumlah Token</b>', table_header_style),
            Paragraph('<b>Harga</b>', table_header_style),
            Paragraph('<b>Bonus</b>', table_header_style)
        ],
        [
            Paragraph('Starter', table_cell_center_style),
            Paragraph('10 Token', table_cell_center_style),
            Paragraph('Rp 100.000', table_cell_center_style),
            Paragraph('-', table_cell_center_style)
        ],
        [
            Paragraph('Basic', table_cell_center_style),
            Paragraph('50 Token', table_cell_center_style),
            Paragraph('Rp 500.000', table_cell_center_style),
            Paragraph('+5 Token', table_cell_center_style)
        ],
        [
            Paragraph('Premium', table_cell_center_style),
            Paragraph('100 Token', table_cell_center_style),
            Paragraph('Rp 1.000.000', table_cell_center_style),
            Paragraph('+15 Token', table_cell_center_style)
        ],
        [
            Paragraph('Dealer', table_cell_center_style),
            Paragraph('500 Token', table_cell_center_style),
            Paragraph('Rp 5.000.000', table_cell_center_style),
            Paragraph('+100 Token', table_cell_center_style)
        ]
    ]
    
    token_table = Table(token_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    token_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 12))
    story.append(token_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Tabel 1. Paket token yang tersedia', ParagraphStyle(
        name='TableCaption',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey
    )))
    
    story.append(Paragraph('<b>1.3 Berapa biaya token untuk setiap jenis listing?</b>', question_style))
    
    listing_cost_data = [
        [
            Paragraph('<b>Jenis Listing</b>', table_header_style),
            Paragraph('<b>Biaya Token</b>', table_header_style),
            Paragraph('<b>Nilai Rupiah</b>', table_header_style),
            Paragraph('<b>Durasi Tayang</b>', table_header_style)
        ],
        [
            Paragraph('Marketplace Umum (WA)', table_cell_center_style),
            Paragraph('3 Token', table_cell_center_style),
            Paragraph('Rp 30.000', table_cell_center_style),
            Paragraph('30 hari', table_cell_center_style)
        ],
        [
            Paragraph('Dealer Marketplace', table_cell_center_style),
            Paragraph('5 Token', table_cell_center_style),
            Paragraph('Rp 50.000', table_cell_center_style),
            Paragraph('7 hari bidding', table_cell_center_style)
        ],
        [
            Paragraph('Chat Platform', table_cell_center_style),
            Paragraph('4 Token', table_cell_center_style),
            Paragraph('Rp 40.000', table_cell_center_style),
            Paragraph('30 hari', table_cell_center_style)
        ],
        [
            Paragraph('Inspeksi 160 Titik', table_cell_center_style),
            Paragraph('10 Token', table_cell_center_style),
            Paragraph('Rp 100.000', table_cell_center_style),
            Paragraph('Sekali inspeksi', table_cell_center_style)
        ],
        [
            Paragraph('Featured/Promoted', table_cell_center_style),
            Paragraph('+5 Token', table_cell_center_style),
            Paragraph('+Rp 50.000', table_cell_center_style),
            Paragraph('7 hari highlight', table_cell_center_style)
        ]
    ]
    
    listing_cost_table = Table(listing_cost_data, colWidths=[4*cm, 3*cm, 3.5*cm, 4*cm])
    listing_cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 12))
    story.append(listing_cost_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Tabel 2. Biaya token untuk setiap jenis layanan', ParagraphStyle(
        name='TableCaption',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey
    )))
    
    story.append(Spacer(1, 18))
    
    # ========== SECTION 2: MARKETPLACE UMUM (WHATSAPP) ==========
    story.append(Paragraph('<b>2. Marketplace Umum (Via WhatsApp Aktif)</b>', section_style))
    
    story.append(Paragraph(
        'Marketplace Umum adalah metode listing standar dimana seller dapat dihubungi langsung '
        'melalui WhatsApp yang terdaftar dan aktif. Metode ini cocok untuk seller yang ingin '
        'negosiasi langsung tanpa perantara platform.',
        body_style
    ))
    
    story.append(Paragraph('<b>2.1 Bagaimana cara membuat listing di Marketplace Umum?</b>', question_style))
    story.append(Paragraph('Langkah-langkah:', answer_style))
    story.append(Paragraph('1. Pastikan saldo token mencukupi (minimal 3 token)', bullet_style))
    story.append(Paragraph('2. Klik "Jual Mobil" di dashboard', bullet_style))
    story.append(Paragraph('3. Pilih metode "Marketplace Umum"', bullet_style))
    story.append(Paragraph('4. Upload foto mobil (minimal 5 foto)', bullet_style))
    story.append(Paragraph('5. Isi detail lengkap mobil', bullet_style))
    story.append(Paragraph('6. Masukkan nomor WhatsApp AKTIF', bullet_style))
    story.append(Paragraph('7. Konfirmasi dan bayar dengan token', bullet_style))
    story.append(Paragraph('8. Listing tayang selama 30 hari', bullet_style))
    
    story.append(Paragraph('<b>2.2 Mengapa nomor WhatsApp harus aktif?</b>', question_style))
    story.append(Paragraph(
        'Nomor WhatsApp yang Anda daftarkan akan ditampilkan di halaman listing. Pembeli potensial '
        'akan menghubungi Anda langsung melalui nomor tersebut. Pastikan nomor aktif dan dapat '
        'diakses agar Anda tidak kehilangan calon pembeli.',
        answer_style
    ))
    
    # Warning box
    warning_data = [[
        Paragraph('<font color="#DC3545"><b>⚠ PERHATIAN</b></font><br/><br/>'
                  '- Nomor WhatsApp tidak dapat diubah setelah listing tayang<br/>'
                  '- Jika nomor tidak aktif, listing akan di-nonaktifkan setelah 3x laporan<br/>'
                  '- Token yang sudah digunakan TIDAK DAPAT dikembalikan',
                  ParagraphStyle(
                      name='WarningText',
                      fontName='SimHei',
                      fontSize=10,
                      leading=14,
                      alignment=TA_LEFT,
                      textColor=DARK_GRAY
                  ))
    ]]
    
    warning_table = Table(warning_data, colWidths=[14*cm])
    warning_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8D7DA')),
        ('BOX', (0, 0), (-1, -1), 2, RED_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(Spacer(1, 12))
    story.append(warning_table)
    
    story.append(Paragraph('<b>2.3 Apa keuntungan Marketplace Umum?</b>', question_style))
    story.append(Paragraph('Keuntungan:', answer_style))
    story.append(Paragraph('- Biaya termurah: Hanya 3 token (Rp 30.000)', bullet_style))
    story.append(Paragraph('- Komunikasi langsung: Negosiasi real-time via WhatsApp', bullet_style))
    story.append(Paragraph('- Fleksibel: Atur jadwal pertemuan sendiri', bullet_style))
    story.append(Paragraph('- Tidak ada fee transaksi: Negosiasi harga tanpa potongan', bullet_style))
    
    story.append(Paragraph('<b>2.4 Apa risiko Marketplace Umum?</b>', question_style))
    story.append(Paragraph('Risiko yang perlu dipahami:', answer_style))
    story.append(Paragraph('- Tidak ada dokumentasi: Platform tidak mencatat negosiasi', bullet_style))
    story.append(Paragraph('- Tanpa escrow: Pembayaran di luar platform, risiko penipuan', bullet_style))
    story.append(Paragraph('- Tidak ada mediasi: Jika ada sengketa, platform tidak dapat membantu', bullet_style))
    story.append(Paragraph('- Privasi nomor: Nomor WhatsApp Anda tampil publik', bullet_style))
    
    story.append(Paragraph('<b>2.5 Tips aman bertransaksi via WhatsApp</b>', question_style))
    story.append(Paragraph('Untuk keamanan transaksi:', answer_style))
    story.append(Paragraph('1. Verifikasi identitas pembeli sebelum pertemuan', bullet_style))
    story.append(Paragraph('2. Minta foto KTP pembeli sebelum deal', bullet_style))
    story.append(Paragraph('3. Pertemuan di tempat ramai atau kantor polisi', bullet_style))
    story.append(Paragraph('4. Gunakan transfer bank bukan cash untuk jejak transaksi', bullet_style))
    story.append(Paragraph('5. Jangan serahkan dokkendaraan sebelum pembayaran cair', bullet_style))
    story.append(Paragraph('6. Catat nomor rekening pembeli untuk keamanan', bullet_style))
    
    story.append(Spacer(1, 12))
    
    # ========== SECTION 3: DEALER MARKETPLACE ==========
    story.append(Paragraph('<b>3. Dealer Marketplace</b>', section_style))
    
    story.append(Paragraph(
        'Dealer Marketplace adalah fitur khusus untuk seller yang ingin menjual mobilnya ke dealer '
        'terverifikasi melalui sistem bidding. Metode ini ideal untuk seller yang menginginkan '
        'proses jual cepat dengan harga kompetitif dan keamanan transaksi terjamin.',
        body_style
    ))
    
    story.append(Paragraph('<b>3.1 Bagaimana cara kerja Dealer Marketplace?</b>', question_style))
    story.append(Paragraph('Alur proses:', answer_style))
    story.append(Paragraph('1. Bayar 5 token untuk listing Dealer Marketplace', bullet_style))
    story.append(Paragraph('2. Mobil diajukan untuk inspeksi 160 titik (+10 token)', bullet_style))
    story.append(Paragraph('3. Hasil inspeksi menjadi referensi dealer', bullet_style))
    story.append(Paragraph('4. Listing ditampilkan ke dealer terverifikasi', bullet_style))
    story.append(Paragraph('5. Dealer mengajukan penawaran (bid)', bullet_style))
    story.append(Paragraph('6. Seller memilih penawaran terbaik', bullet_style))
    story.append(Paragraph('7. Transaksi via escrow platform', bullet_style))
    
    story.append(Paragraph('<b>3.2 Apa keuntungan menjual ke Dealer?</b>', question_style))
    story.append(Paragraph('Keuntungan:', answer_style))
    story.append(Paragraph('- Proses cepat: Dealer siap dana, closing 1-3 hari', bullet_style))
    story.append(Paragraph('- Aman: Semua dealer terverifikasi dan terdaftar', bullet_style))
    story.append(Paragraph('- Harga kompetitif: Bidding system memastikan harga terbaik', bullet_style))
    story.append(Paragraph('- Transparan: Semua penawaran tercatat dan dapat dibandingkan', bullet_style))
    story.append(Paragraph('- Escrow: Pembayaran dijamin aman', bullet_style))
    story.append(Paragraph('- Tidak ada fee seller: Komisi dibebankan ke dealer', bullet_style))
    
    story.append(Paragraph('<b>3.3 Berapa durasi bidding?</b>', question_style))
    story.append(Paragraph(
        'Durasi default adalah 7 hari. Jika belum ada penawaran yang cocok, seller dapat '
        'memperpanjang dengan membayar 2 token per 7 hari tambahan. Minimal 3 penawaran '
        'harus terkumpul sebelum seller dapat memilih untuk closing.',
        answer_style
    ))
    
    story.append(Paragraph('<b>3.4 Apakah inspeksi wajib untuk Dealer Marketplace?</b>', question_style))
    story.append(Paragraph(
        'Ya, inspeksi 160 titik WAJIB untuk Dealer Marketplace. Ini memberikan kepercayaan '
        'kepada dealer bahwa kondisi mobil sesuai deskripsi. Biaya inspeksi: 10 token (Rp 100.000).',
        answer_style
    ))
    
    story.append(Spacer(1, 12))
    
    # ========== SECTION 4: CHAT PLATFORM ==========
    story.append(Paragraph('<b>4. Tawar via Chat Platform</b>', section_style))
    
    story.append(Paragraph(
        'Chat Platform adalah solusi hybrid yang menggabungkan kemudahan komunikasi langsung '
        'dengan keamanan transaksi terdokumentasi. Fitur ini direkomendasikan untuk seller '
        'yang menginginkan perlindungan dan transparansi.',
        body_style
    ))
    
    story.append(Paragraph('<b>4.1 Apa itu Chat Platform?</b>', question_style))
    story.append(Paragraph(
        'Chat Platform adalah sistem chat in-app yang memungkinkan seller dan buyer bernegosiasi '
        'dalam platform AutoMarket. Semua percakapan tercatat dan dapat diakses kapan saja. '
        'Fitur escrow tersedia untuk keamanan transaksi.',
        answer_style
    ))
    
    story.append(Paragraph('<b>4.2 Bagaimana cara menggunakan Chat Platform?</b>', question_style))
    story.append(Paragraph('Langkah penggunaan:', answer_style))
    story.append(Paragraph('1. Bayar 4 token untuk listing Chat Platform', bullet_style))
    story.append(Paragraph('2. Listing ditampilkan dengan tombol "Chat" bukan "WhatsApp"', bullet_style))
    story.append(Paragraph('3. Pembeli mengirim pesan melalui platform', bullet_style))
    story.append(Paragraph('4. Negosiasi berlangsung dalam chat (tercatat otomatis)', bullet_style))
    story.append(Paragraph('5. Jika deal, aktifkan escrow (fee 1.5%)', bullet_style))
    story.append(Paragraph('6. Setelah transaksi selesai, berikan rating', bullet_style))
    
    story.append(Paragraph('<b>4.3 Apa keunggulan Chat Platform?</b>', question_style))
    story.append(Paragraph('Keunggulan:', answer_style))
    story.append(Paragraph('- Terdokumentasi: Semua riwayat chat tersimpan aman', bullet_style))
    story.append(Paragraph('- Bukti negosiasi: Dapat digunakan jika ada sengketa', bullet_style))
    story.append(Paragraph('- Escrow opsional: Dana ditahan sampai transaksi selesai', bullet_style))
    story.append(Paragraph('- Privasi terjaga: Nomor pribadi tidak ditampilkan', bullet_style))
    story.append(Paragraph('- Verifikasi: Identitas pembeli dan seller terverifikasi', bullet_style))
    story.append(Paragraph('- Rating system: Review dari transaksi sebelumnya', bullet_style))
    
    story.append(Paragraph('<b>4.4 Berapa biaya Chat Platform?</b>', question_style))
    story.append(Paragraph(
        'Biaya listing: 4 token (Rp 40.000) untuk 30 hari. Jika menggunakan escrow, dikenakan '
        'fee tambahan 1.5% dari nilai transaksi (minimal Rp 50.000) yang dibayar oleh pembeli.',
        answer_style
    ))
    
    story.append(Paragraph('<b>4.5 Bagaimana cara kerja Escrow?</b>', question_style))
    story.append(Paragraph(
        'Escrow adalah sistem penitipan dana. Pembeli transfer ke rekening escrow AutoMarket, '
        'dana ditahan sampai seller menyerahkan mobil dan pembeli mengkonfirmasi. Setelah '
        'konfirmasi, dana dicairkan ke rekening seller dalam 1x24 jam.',
        answer_style
    ))
    
    story.append(Spacer(1, 12))
    
    # ========== SECTION 5: PERBANDINGAN ==========
    story.append(Paragraph('<b>5. Perbandingan Lengkap</b>', section_style))
    
    # Comparison table
    comparison_data = [
        [
            Paragraph('<b>Fitur</b>', table_header_style),
            Paragraph('<b>Marketplace Umum</b>', table_header_style),
            Paragraph('<b>Dealer Marketplace</b>', table_header_style),
            Paragraph('<b>Chat Platform</b>', table_header_style)
        ],
        [
            Paragraph('Biaya Token', table_cell_style),
            Paragraph('3 Token', table_cell_center_style),
            Paragraph('5 Token', table_cell_center_style),
            Paragraph('4 Token', table_cell_center_style)
        ],
        [
            Paragraph('Nilai Rupiah', table_cell_style),
            Paragraph('Rp 30.000', table_cell_center_style),
            Paragraph('Rp 50.000', table_cell_center_style),
            Paragraph('Rp 40.000', table_cell_center_style)
        ],
        [
            Paragraph('Inspeksi', table_cell_style),
            Paragraph('Opsional', table_cell_center_style),
            Paragraph('Wajib', table_cell_center_style),
            Paragraph('Opsional', table_cell_center_style)
        ],
        [
            Paragraph('Komunikasi', table_cell_style),
            Paragraph('WhatsApp langsung', table_cell_center_style),
            Paragraph('Bidding system', table_cell_center_style),
            Paragraph('Chat in-app', table_cell_center_style)
        ],
        [
            Paragraph('Dokumentasi', table_cell_style),
            Paragraph('Tidak ada', table_cell_center_style),
            Paragraph('Lengkap', table_cell_center_style),
            Paragraph('Lengkap', table_cell_center_style)
        ],
        [
            Paragraph('Escrow', table_cell_style),
            Paragraph('Tidak', table_cell_center_style),
            Paragraph('Ya', table_cell_center_style),
            Paragraph('Opsional', table_cell_center_style)
        ],
        [
            Paragraph('Privasi Nomor', table_cell_style),
            Paragraph('Publik', table_cell_center_style),
            Paragraph('Terlindungi', table_cell_center_style),
            Paragraph('Terlindungi', table_cell_center_style)
        ],
        [
            Paragraph('Target Pembeli', table_cell_style),
            Paragraph('Semua', table_cell_center_style),
            Paragraph('Dealer saja', table_cell_center_style),
            Paragraph('Semua', table_cell_center_style)
        ],
        [
            Paragraph('Mediasi Sengketa', table_cell_style),
            Paragraph('Tidak', table_cell_center_style),
            Paragraph('Ya', table_cell_center_style),
            Paragraph('Ya', table_cell_center_style)
        ],
        [
            Paragraph('Durasi', table_cell_style),
            Paragraph('30 hari', table_cell_center_style),
            Paragraph('7 hari', table_cell_center_style),
            Paragraph('30 hari', table_cell_center_style)
        ]
    ]
    
    comparison_table = Table(comparison_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('BACKGROUND', (0, 9), (-1, 9), colors.white),
        ('BACKGROUND', (0, 10), (-1, 10), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 12))
    story.append(comparison_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Tabel 3. Perbandingan lengkap ketiga metode listing', ParagraphStyle(
        name='TableCaption',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey
    )))
    
    story.append(Spacer(1, 18))
    
    # ========== SECTION 6: PANDUAN PEMILIHAN ==========
    story.append(Paragraph('<b>6. Panduan Memilih Metode Listing</b>', section_style))
    
    # Decision flow table
    flow_data = [
        [
            Paragraph('<b>Kebutuhan Seller</b>', table_header_style),
            Paragraph('<b>Rekomendasi</b>', table_header_style),
            Paragraph('<b>Alasan</b>', table_header_style)
        ],
        [
            Paragraph('Ingin jual cepat 1-3 hari', table_cell_style),
            Paragraph('Dealer Marketplace', table_cell_style),
            Paragraph('Dealer siap dana, proses cepat', table_cell_style)
        ],
        [
            Paragraph('Budget minimal', table_cell_style),
            Paragraph('Marketplace Umum', table_cell_style),
            Paragraph('Hanya 3 token, paling murah', table_cell_style)
        ],
        [
            Paragraph('Menginginkan keamanan maksimal', table_cell_style),
            Paragraph('Chat Platform + Escrow', table_cell_style),
            Paragraph('Dana ditahan, terdokumentasi lengkap', table_cell_style)
        ],
        [
            Paragraph('Ingin privasi nomor HP', table_cell_style),
            Paragraph('Chat Platform', table_cell_style),
            Paragraph('Nomor tidak ditampilkan publik', table_cell_style)
        ],
        [
            Paragraph('Negosiasi langsung tanpa ribet', table_cell_style),
            Paragraph('Marketplace Umum', table_cell_style),
            Paragraph('Langsung via WhatsApp', table_cell_style)
        ],
        [
            Paragraph('Mobil kondisi prima, harga tinggi', table_cell_style),
            Paragraph('Dealer Marketplace', table_cell_style),
            Paragraph('Inspeksi 160 titik mendukung harga', table_cell_style)
        ],
        [
            Paragraph('Ingin dokumentasi tanpa escrow', table_cell_style),
            Paragraph('Chat Platform (tanpa escrow)', table_cell_style),
            Paragraph('Chat tercatat, tanpa fee transaksi', table_cell_style)
        ]
    ]
    
    flow_table = Table(flow_data, colWidths=[5*cm, 4*cm, 5*cm])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 12))
    story.append(flow_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Tabel 4. Panduan pemilihan metode berdasarkan kebutuhan', ParagraphStyle(
        name='TableCaption',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey
    )))
    
    story.append(Spacer(1, 18))
    
    # ========== SECTION 7: FAQ TAMBAHAN ==========
    story.append(Paragraph('<b>7. Pertanyaan Umum Lainnya</b>', section_style))
    
    story.append(Paragraph('<b>7.1 Apakah token bisa dikembalikan?</b>', question_style))
    story.append(Paragraph(
        'Token yang sudah digunakan untuk listing TIDAK DAPAT dikembalikan. Pastikan semua '
        'informasi sudah benar sebelum konfirmasi pembayaran token.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.2 Bagaimana jika listing tidak laku?</b>', question_style))
    story.append(Paragraph(
        'Anda dapat memperpanjang listing dengan membayar token tambahan: Marketplace Umum '
        'dan Chat Platform = 2 token per 30 hari. Dealer Marketplace = 2 token per 7 hari.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.3 Apakah ada biaya transaksi untuk seller?</b>', question_style))
    story.append(Paragraph(
        'Untuk Dealer Marketplace: Tidak ada fee seller, komisi ditanggung dealer.<br/>'
        'Untuk Chat Platform dengan escrow: Fee 1.5% ditanggung pembeli.<br/>'
        'Untuk Marketplace Umum: Tidak ada fee, transaksi di luar platform.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.4 Bagaimana jika ada sengketa transaksi?</b>', question_style))
    story.append(Paragraph(
        'Untuk Dealer Marketplace dan Chat Platform dengan escrow: AutoMarket menyediakan '
        'layanan mediasi berdasarkan dokumentasi yang tersimpan.<br/>'
        'Untuk Marketplace Umum: Platform TIDAK DAPAT membantu karena transaksi di luar sistem.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.5 Bisakah mengganti metode listing setelah publish?</b>', question_style))
    story.append(Paragraph(
        'Ya, selama belum ada transaksi aktif. Anda harus membayar token ulang untuk metode baru. '
        'Token dari listing sebelumnya tidak dapat dikembalikan.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.6 Apakah token punya masa berlaku?</b>', question_style))
    story.append(Paragraph(
        'Token tidak punya masa kedaluwarsa. Anda dapat menggunakannya kapan saja.',
        answer_style
    ))
    
    story.append(Paragraph('<b>7.7 Bagaimana cara upgrade listing menjadi Featured?</b>', question_style))
    story.append(Paragraph(
        'Bayar 5 token tambahan untuk mengaktifkan Featured selama 7 hari. Listing akan '
        'muncul di bagian atas hasil pencarian dan mendapat badge khusus.',
        answer_style
    ))
    
    story.append(Spacer(1, 24))
    
    # ========== FOOTER/CLOSING ==========
    closing_data = [[
        Paragraph('<b>Butuh bantuan lebih lanjut?</b><br/><br/>'
                  'Hubungi Customer Service AutoMarket:<br/>'
                  'WhatsApp: +62 857-1541-4856<br/>'
                  'Email: support@automarket.id<br/><br/>'
                  'Tim kami siap membantu 24/7!',
                  ParagraphStyle(
                      name='ClosingText',
                      fontName='SimHei',
                      fontSize=11,
                      leading=16,
                      alignment=TA_CENTER,
                      textColor=DARK_GRAY
                  ))
    ]]
    
    closing_table = Table(closing_data, colWidths=[14*cm])
    closing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(closing_table)
    
    # Build PDF
    doc.build(story)
    print(f"PDF generated successfully: {output_path}")
    return output_path

if __name__ == '__main__':
    create_faq_pdf()
