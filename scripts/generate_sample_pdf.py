import os
import sys

def create_sample_pdf():
    knowledge_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge_base")
    os.makedirs(knowledge_dir, exist_ok=True)
    pdf_path = os.path.join(knowledge_dir, "pay_in_3_product_guide.pdf")

    pdf_content_text = """AFFORDAI PAY-IN-3 ZERO-COST EMI PRODUCT GUIDE

1. PRODUCT OVERVIEW & BENEFITS
AffordAI Pay-in-3 is a revolutionary zero-cost EMI payment product that allows customers to split any transaction between INR 3,000 and INR 1,500,000 into 3 equal monthly installments.
- Interest Rate: 0% APR (Zero Interest).
- Processing Fee: INR 0 (No hidden charges).
- Down Payment: 1st installment paid at purchase time; 2nd installment at Day 30; 3rd installment at Day 60.
- Instant Approval: Under 60 seconds with digital KYC.

2. ELIGIBILITY CRITERIA
- Minimum Age: 21 years old.
- Maximum Age: 60 years old at loan maturity.
- Employment: Salaried professionals (Min monthly salary: INR 25,000) or Self-Employed individuals (Min annual ITR: INR 3,00,000).
- Credit Score: CIBIL score of 670 or higher (or equivalent Experian score).
- Documentation: Valid PAN Card, Aadhaar Card linked with mobile number, and active bank account with NetBanking/UPI auto-debit capability.

3. KYC & ONBOARDING PROCESS
Step 1: Mobile verification via OTP.
Step 2: Enter PAN details for instant credit limit calculation.
Step 3: Perform Video KYC (V-KYC) or DigiLocker Aadhaar authentication.
Step 4: Set up Auto-Debit (e-NACH / UPI Autopay) for seamless auto-repayments on due dates.
Step 5: Transaction approval and instant voucher / merchant payment release.

4. INTEREST & PENALTY POLICY
- Zero Interest: No interest is charged if installments are paid on or before the due date.
- Grace Period: 3 days grace period provided for monthly installments.
- Late Payment Fee: INR 250 flat fee per missed installment after grace period expiration.
- Foreclosure Charges: 0% foreclosure fee. Customers can prepay remaining installments anytime with zero penalty.

5. FREQUENTLY ASKED QUESTIONS (FAQ)
Q: Is there any hidden fee or interest for Pay-in-3?
A: No! Pay-in-3 is 100% zero-cost. You pay exactly the item purchase price divided into 3 equal payments.

Q: What happens if my payment fails on due date?
A: You get a 3-day grace period to clear the due amount via UPI or Debit Card without any penalty.

Q: Can I use Pay-in-3 for electronics, travel, and healthcare?
A: Yes, Pay-in-3 is supported across partner merchants in Electronics, Smartphones, Home Appliances, Travel, Education, and Healthcare.

Q: How can sales agents assist customers facing V-KYC drops?
A: Agents can send an SMS / WhatsApp link to complete DigiLocker offline XML verification as a hassle-free alternative to V-KYC.
"""

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor='#1E3A8A',
            spaceAfter=12
        )
        body_style = ParagraphStyle(
            'DocBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            spaceAfter=6
        )

        for line in pdf_content_text.split('\n'):
            if line.isupper() and len(line) > 3:
                story.append(Paragraph(f"<b>{line}</b>", title_style))
            elif line.strip():
                story.append(Paragraph(line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'), body_style))
            else:
                story.append(Spacer(1, 6))

        doc.build(story)
        print(f"Successfully generated PDF using reportlab at: {pdf_path}")
    except Exception as e:
        print(f"Reportlab not available ({e}), writing plain text format with PDF header/structure.")
        # Minimal valid PDF generator
        lines = pdf_content_text.split('\n')
        pdf_lines = []
        pdf_lines.append("%PDF-1.4")
        pdf_lines.append("1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj")
        pdf_lines.append("2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj")
        pdf_lines.append("3 0 obj <</Type /Page /Parent 2 0 R /Resources <</Font <</F1 4 0 R>>>> /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj")
        pdf_lines.append("4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj")

        stream_content = "BT /F1 10 Tf 50 750 Td 12 TL\n"
        for line in lines[:50]:
            clean_line = line.replace('(', '\\(').replace(')', '\\)')
            stream_content += f"({clean_line}) '\n"
        stream_content += "ET"

        pdf_lines.append(f"5 0 obj <</Length {len(stream_content)}>> stream\n{stream_content}\nendstream endobj")
        pdf_lines.append("xref\n0 6\n0000000000 65535 f \n")
        pdf_lines.append("trailer <</Size 6 /Root 1 0 R>>\nstartxref\n0\n%%EOF")

        with open(pdf_path, 'w', encoding='latin1') as f:
            f.write("\n".join(pdf_lines))
        print(f"Generated PDF file at: {pdf_path}")

    # Also save a txt version in knowledge_base for immediate RAG fallback
    txt_path = os.path.join(knowledge_dir, "pay_in_3_product_guide.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(pdf_content_text)
    print(f"Saved fallback text guide at: {txt_path}")

if __name__ == "__main__":
    create_sample_pdf()
