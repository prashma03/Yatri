from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem, Preformatted

ROOT = Path(r"C:/Users/ghimi/OneDrive/Desktop/Yatri/Yatri")
SRC = ROOT / "docs" / "YATRI_ROADMAP_INTERVIEW_GUIDE.md"
OUT = ROOT / "output" / "pdf" / "Yatri_Roadmap_Interview_Guide.pdf"
text = SRC.read_text(encoding="utf-8")
for a, b in {"→":"->", "‑":"-", "–":"-", "—":"-", "“":"\"", "”":"\"", "‘":"'", "’":"'", "…":"..."}.items():
    text = text.replace(a, b)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=30, leading=36, textColor=colors.HexColor("#1F2937"), alignment=TA_CENTER, spaceAfter=14))
styles.add(ParagraphStyle(name="CoverSubtitle", parent=styles["BodyText"], fontName="Helvetica", fontSize=13, leading=20, textColor=colors.HexColor("#4B5563"), alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1Custom", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=colors.HexColor("#0F766E"), spaceBefore=18, spaceAfter=8))
styles.add(ParagraphStyle(name="H2Custom", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=20, textColor=colors.HexColor("#92400E"), spaceBefore=14, spaceAfter=6))
styles.add(ParagraphStyle(name="H3Custom", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=12.5, leading=17, textColor=colors.HexColor("#111827"), spaceBefore=10, spaceAfter=4))
styles.add(ParagraphStyle(name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.6, leading=14.2, textColor=colors.HexColor("#1F2937"), spaceAfter=6))
styles.add(ParagraphStyle(name="QuoteCustom", parent=styles["BodyText"], fontName="Helvetica-Oblique", fontSize=10.2, leading=15, leftIndent=18, rightIndent=10, borderColor=colors.HexColor("#F59E0B"), borderWidth=1.2, borderPadding=7, textColor=colors.HexColor("#374151"), backColor=colors.HexColor("#FFFBEB"), spaceBefore=5, spaceAfter=9))
styles.add(ParagraphStyle(name="CodeCustom", parent=styles["Code"], fontName="Courier", fontSize=8, leading=10.5, leftIndent=8, rightIndent=8, borderColor=colors.HexColor("#D1D5DB"), borderWidth=0.7, borderPadding=7, backColor=colors.HexColor("#F9FAFB"), spaceBefore=5, spaceAfter=8))
styles.add(ParagraphStyle(name="BulletCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13.6, leftIndent=4, textColor=colors.HexColor("#1F2937")))
styles.add(ParagraphStyle(name="SmallMeta", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#6B7280")))

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def inline_md(s):
    s = esc(s)
    s = re.sub(r"\x60([^\x60]+)\x60", r"<font name='Courier'>\1</font>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    return s

story = []
story.append(Spacer(1, 1.2*inch))
story.append(Paragraph("Yatri App Roadmap", styles["CoverTitle"]))
story.append(Paragraph("Interview Guide", styles["CoverTitle"]))
story.append(Spacer(1, 0.25*inch))
story.append(Paragraph("Offline-first Nepal travel safety companion", styles["CoverSubtitle"]))
story.append(Paragraph("Scam alerts · SOS · District packs · Fair prices · AI assistant", styles["CoverSubtitle"]))
story.append(Spacer(1, 0.25*inch))
story.append(Paragraph("Prepared from the project roadmap · July 6, 2026", styles["SmallMeta"]))
story.append(PageBreak())

lines = text.splitlines()
in_code = False
code_buf = []
bullets = []

def flush_bullets():
    global bullets
    if bullets:
        story.append(ListFlowable([ListItem(Paragraph(inline_md(b), styles["BulletCustom"]), bulletColor=colors.HexColor("#0F766E")) for b in bullets], bulletType="bullet", leftIndent=18, bulletFontSize=7))
        story.append(Spacer(1, 3))
        bullets = []

def flush_code():
    global code_buf
    if code_buf:
        story.append(Preformatted("\n".join(code_buf).strip(), styles["CodeCustom"], maxLineLength=90))
        code_buf = []

skip_first_h1 = True
for raw in lines:
    line = raw.rstrip()
    if line.startswith("~~~"):
        if in_code:
            flush_code(); in_code = False
        else:
            flush_bullets(); in_code = True; code_buf = []
        continue
    if in_code:
        code_buf.append(line); continue
    if not line.strip():
        flush_bullets(); continue
    if line.startswith("# "):
        if skip_first_h1:
            skip_first_h1 = False; continue
        flush_bullets(); story.append(Paragraph(inline_md(line[2:]), styles["H1Custom"]))
    elif line.startswith("## "):
        flush_bullets(); title = line[3:]
        if title.startswith(("5.", "12.", "13.", "14.", "15.", "16.")):
            story.append(PageBreak())
        story.append(Paragraph(inline_md(title), styles["H1Custom"]))
    elif line.startswith("### "):
        flush_bullets(); story.append(Paragraph(inline_md(line[4:]), styles["H2Custom"]))
    elif line.startswith("#### "):
        flush_bullets(); story.append(Paragraph(inline_md(line[5:]), styles["H3Custom"]))
    elif line.startswith("- "):
        bullets.append(line[2:])
    elif re.match(r"^\d+\.\s+", line):
        bullets.append(line)
    elif line.startswith("> "):
        flush_bullets(); story.append(Paragraph(inline_md(line[2:]), styles["QuoteCustom"]))
    else:
        flush_bullets(); story.append(Paragraph(inline_md(line), styles["BodyCustom"]))
flush_bullets(); flush_code()

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#E5E7EB"))
    canvas.line(doc.leftMargin, 0.55*inch, letter[0]-doc.rightMargin, 0.55*inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawString(doc.leftMargin, 0.35*inch, "Yatri App Roadmap and Interview Guide")
    canvas.drawRightString(letter[0]-doc.rightMargin, 0.35*inch, "Page %s" % doc.page)
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=0.65*inch, leftMargin=0.65*inch, topMargin=0.7*inch, bottomMargin=0.75*inch, title="Yatri App Roadmap and Interview Guide", author="Yatri")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
