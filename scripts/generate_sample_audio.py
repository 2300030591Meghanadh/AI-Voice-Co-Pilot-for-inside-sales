import os
import wave
import struct
import math

def generate_sample_audio():
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    wav_path = os.path.join(uploads_dir, "sample_sales_call.wav")
    txt_path = os.path.join(uploads_dir, "sample_sales_call.txt")

    sample_transcript = (
        "Agent: Hello, good afternoon! Am I speaking with Mr. Rahul Sharma?\n"
        "Customer: Yes, speaking. Who is this?\n"
        "Agent: Hi Mr. Sharma, I am calling from AffordAI Financial Services. "
        "I noticed you were checking out a smartphone worth 45,000 rupees on our merchant app. "
        "I wanted to share that you are pre-approved for our Pay-in-3 Zero-Cost EMI product.\n"
        "Customer: Oh, Pay-in-3? How does that work? Are there any hidden interest charges or processing fees?\n"
        "Agent: Great question! Pay-in-3 has absolute zero interest and zero processing fee. "
        "You only pay 15,000 rupees today as the first installment, 15,000 next month, and 15,000 in the 3rd month.\n"
        "Customer: That sounds really good! What documents do I need to complete the KYC and get started?\n"
        "Agent: You just need your PAN card and Aadhaar linked to your mobile number. "
        "The digital KYC takes less than 60 seconds. Should I send you the instant approval link on WhatsApp?\n"
        "Customer: Yes please, send me the link. I will complete the KYC right away."
    )

    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(sample_transcript)

    # Generate a simple 5-second PCM WAV file with synthesized audio tones
    sample_rate = 16000
    duration_sec = 5.0
    num_samples = int(sample_rate * duration_sec)

    with wave.open(wav_path, "w") as wav_file:
        wav_file.setnchannels(1)     # Mono
        wav_file.setsampwidth(2)     # 16-bit
        wav_file.setframerate(sample_rate)
        
        frames = []
        for i in range(num_samples):
            t = i / sample_rate
            # Synthesize voice-like harmonic tone sequence
            freq = 220.0 + 80.0 * math.sin(2 * math.pi * 1.5 * t)
            value = int(16000 * math.sin(2 * math.pi * freq * t) * (0.5 + 0.5 * math.sin(2 * math.pi * 0.5 * t)))
            frames.append(struct.pack('<h', value))
            
        wav_file.writeframes(b''.join(frames))

    print(f"Generated sample audio WAV at: {wav_path}")
    print(f"Generated sample audio transcript text at: {txt_path}")

if __name__ == "__main__":
    generate_sample_audio()
