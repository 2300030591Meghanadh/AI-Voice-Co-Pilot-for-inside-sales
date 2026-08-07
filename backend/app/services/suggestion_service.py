class SuggestionService:
    @staticmethod
    def get_suggestions(transcript: str, intent: str = "Interested") -> dict:
        """
        Generates real-time actionable sales suggestions for sales agents.
        """
        text_lower = transcript.lower()

        suggestions = []
        talking_points = []

        # Core mandatory suggestions tailored to context
        if "interest" not in text_lower and "fee" not in text_lower:
            suggestions.append("Mention Zero-Cost EMI: Highlight 0% APR and 0 processing fees.")
            talking_points.append("Say: 'You pay 0% interest and 0 hidden fees across all 3 installments.'")
        else:
            suggestions.append("Explain Pay-in-3 benefits: 3 equal monthly installments, no down payment burden.")
            talking_points.append("Say: 'Pay only 33% today, and split the rest smoothly over 60 days.'")

        if "eligibility" in text_lower or "cibil" in text_lower or "salary" in text_lower:
            suggestions.append("Explain eligibility criteria: Age 21-60, Min Salary INR 25k/mo, CIBIL 670+.")
            talking_points.append("Say: 'Instant pre-approval with zero paperwork if you have valid PAN & Aadhaar.'")

        if "kyc" in text_lower or "document" in text_lower or "aadhaar" in text_lower:
            suggestions.append("Ask customer to complete digital KYC: V-KYC or DigiLocker OTP authentication.")
            talking_points.append("Say: 'I can send you a 60-second DigiLocker link right now on WhatsApp.'")

        if "later" in text_lower or "busy" in text_lower or "callback" in text_lower or intent == "Wants Callback":
            suggestions.append("Offer a structured follow-up: Agree on exact date and time for callback.")
            talking_points.append("Say: 'What time tomorrow works best for a quick 2-minute confirmation call?'")

        # Always ensure minimum 4 rich suggestions are present
        default_suggestions = [
            "Explain Pay-in-3 benefits: Split purchase price into 3 simple equal payments.",
            "Mention zero-cost EMI: Highlight zero interest rates and zero processing charges.",
            "Explain eligibility: Instant pre-approval with PAN and Aadhaar.",
            "Ask customer to complete KYC: Guide customer to complete digital verification.",
            "Offer follow-up: Lock in callback date in CRM for warm conversion."
        ]

        for s in default_suggestions:
            if s not in suggestions:
                suggestions.append(s)

        default_talking_points = [
            "Highlight: 'No credit card needed - works directly with your active bank account auto-debit.'",
            "Urgency: 'Pre-approved limit is valid for 48 hours for immediate merchant checkout.'",
            "Trust: '100% RBI regulated digital lending partners.'"
        ]
        for tp in default_talking_points:
            if tp not in talking_points:
                talking_points.append(tp)

        return {
            "suggestions": suggestions[:5],
            "talking_points": talking_points[:4]
        }
