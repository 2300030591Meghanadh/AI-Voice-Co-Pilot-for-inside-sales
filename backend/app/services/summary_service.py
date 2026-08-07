import json
from app.core.config import settings

class SummaryService:
    @staticmethod
    def generate_summary(transcript: str, intent: str = "Interested") -> dict:
        """
        Generates structured call summary from transcript & intent.
        Uses OpenAI GPT model if API key is present, else rule-based summary synthesizer.
        """
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 5:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = f"""
Analyze the following sales call transcript and intent:

Intent: {intent}
Transcript:
"{transcript}"

Generate a structured summary JSON with keys:
- "customer_intent": (string)
- "key_discussion_points": (list of 3 bullet strings)
- "next_best_action": (string action for sales agent)
- "follow_up_recommendation": (string recommendation with timeline)
- "summary_text": (string paragraph summary)
"""
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                res_data = json.loads(response.choices[0].message.content)
                return {
                    "customer_intent": res_data.get("customer_intent", intent),
                    "key_discussion_points": res_data.get("key_discussion_points", [
                        "Inquired about Pay-in-3 zero cost EMI benefits",
                        "Asked about documentation and KYC process",
                        "Requested digital approval link"
                    ]),
                    "next_best_action": res_data.get("next_best_action", "Send instant onboarding WhatsApp link and verify PAN"),
                    "follow_up_recommendation": res_data.get("follow_up_recommendation", "Schedule callback within 24 hours to assist with e-NACH setup"),
                    "summary_text": res_data.get("summary_text", "Call completed. Customer informed about zero-cost Pay-in-3 benefits and agreed to complete KYC.")
                }
            except Exception as e:
                print(f"OpenAI summary generation failed, using rule-based summary generator: {e}")

        # Rule-based fallback summary synthesizer
        lines = [l.strip() for l in transcript.split("\n") if l.strip()]
        
        discussion_points = []
        if any("zero" in l.lower() or "interest" in l.lower() for l in lines):
            discussion_points.append("Explained 0% interest and zero processing fees structure for Pay-in-3.")
        if any("kyc" in l.lower() or "pan" in l.lower() or "aadhaar" in l.lower() for l in lines):
            discussion_points.append("Clarified KYC requirements (PAN + Aadhaar OTP verification).")
        if any("link" in l.lower() or "whatsapp" in l.lower() or "sms" in l.lower() for l in lines):
            discussion_points.append("Customer requested instant digital onboarding link.")
        if not discussion_points:
            discussion_points = [
                "Discussed Pay-in-3 3-month zero-cost installment plan.",
                "Answered customer questions regarding payment schedule and eligibility.",
                "Confirmed customer willingness to proceed with digital KYC."
            ]

        if intent in ["Interested", "EMI Query", "Eligibility Query"]:
            next_best_action = "Send WhatsApp instant approval link & guide customer through DigiLocker KYC."
            followup_rec = "Schedule callback in 24 hours to confirm order checkout and auto-debit setup."
        elif intent in ["Wants Callback"]:
            next_best_action = "Set callback reminder in CRM for agreed timestamp."
            followup_rec = "Call customer at scheduled time with eligibility pre-calculation."
        elif intent in ["KYC Query"]:
            next_best_action = "Guide customer to resolve PAN/Aadhaar mismatch or upload alternative document."
            followup_rec = "Follow up within 12 hours to verify KYC approval status in CRM."
        else:
            next_best_action = "Log customer objection in CRM and send promotional comparison sheet."
            followup_rec = "Re-engage in 7 days with special merchant discount offer."

        summary_text = (
            f"Customer call logged with classified intent '{intent}'. "
            f"Key discussion centered around Pay-in-3 zero-cost EMI options. "
            f"Next step: {next_best_action}"
        )

        return {
            "customer_intent": intent,
            "key_discussion_points": discussion_points,
            "next_best_action": next_best_action,
            "follow_up_recommendation": followup_rec,
            "summary_text": summary_text
        }
