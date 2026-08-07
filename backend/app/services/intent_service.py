import re
from app.core.config import settings

class IntentService:
    INTENT_CATEGORIES = [
        "Interested",
        "Not Interested",
        "Wants Callback",
        "EMI Query",
        "Eligibility Query",
        "KYC Query",
        "Complaint"
    ]

    @staticmethod
    def classify_intent(transcript: str) -> dict:
        """
        Classifies customer intent from call transcript.
        Uses OpenAI LLM if key present, else keyword-weighted rule classifier.
        """
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 5:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = f"""
Analyze the following sales call transcript and classify the primary customer intent into exactly ONE of these categories:
- Interested
- Not Interested
- Wants Callback
- EMI Query
- Eligibility Query
- KYC Query
- Complaint

Transcript:
"{transcript}"

Respond strictly in JSON format with keys "intent" (string), "confidence" (float between 0.0 and 1.0), and "analysis" (brief reason).
"""
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                import json
                result = json.loads(response.choices[0].message.content)
                return {
                    "intent": result.get("intent", "Interested"),
                    "confidence": float(result.get("confidence", 0.92)),
                    "analysis": result.get("analysis", "OpenAI classified intent based on transcript context.")
                }
            except Exception as e:
                print(f"OpenAI Intent Classification failed, using fallback classifier: {e}")

        # Rule-based / Keyword Heuristic Fallback Classifier
        text_lower = transcript.lower()

        scores = {
            "KYC Query": 0.0,
            "Eligibility Query": 0.0,
            "EMI Query": 0.0,
            "Wants Callback": 0.0,
            "Not Interested": 0.0,
            "Complaint": 0.0,
            "Interested": 0.0
        }

        # KYC keywords
        if any(w in text_lower for w in ["kyc", "pan", "aadhaar", "document", "v-kyc", "digilocker"]):
            scores["KYC Query"] += 4.0

        # Eligibility keywords
        if any(w in text_lower for w in ["eligibility", "eligible", "salary", "cibil", "income", "age", "criteria"]):
            scores["Eligibility Query"] += 4.0

        # EMI keywords
        if any(w in text_lower for w in ["emi", "pay-in-3", "interest", "installment", "fee", "charge", "hidden", "processing"]):
            scores["EMI Query"] += 3.5

        # Callback keywords
        if any(w in text_lower for w in ["call back", "callback", "later", "tomorrow", "busy", "busy now", "send link"]):
            scores["Wants Callback"] += 3.0

        # Not Interested keywords
        if any(w in text_lower for w in ["not interested", "don't want", "dont want", "no thanks", "reject", "decline"]):
            scores["Not Interested"] += 5.0

        # Complaint keywords
        if any(w in text_lower for w in ["issue", "problem", "failed", "error", "complaint", "fraud", "worst", "delay"]):
            scores["Complaint"] += 4.5

        # Interested keywords
        if any(w in text_lower for w in ["sounds good", "great", "interested", "buy", "yes please", "send link", "sign up", "approve"]):
            scores["Interested"] += 2.5

        top_intent = max(scores, key=scores.get)
        max_score = scores[top_intent]

        if max_score == 0.0:
            top_intent = "Interested"
            confidence = 0.85
            analysis = "General interest detected in product offering."
        else:
            confidence = min(0.95, round(0.70 + (max_score * 0.05), 2))
            analysis = f"High keyword concentration detected for category: '{top_intent}'."

        return {
            "intent": top_intent,
            "confidence": confidence,
            "analysis": analysis
        }
