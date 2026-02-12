from pypdf import PdfReader
import os

files = [
    "AI-Enabled Smart Grid Management System Hackathon.pdf",
    "AI-Enabled Smart Grid Management System Hackathon Roadmap.pdf"
]

output_file = "requirements.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for file_path in files:
        if os.path.exists(file_path):
            try:
                reader = PdfReader(file_path)
                f.write(f"--- Content of {file_path} ---\n")
                for i, page in enumerate(reader.pages):
                    f.write(f"Page {i+1}:\n")
                    text = page.extract_text()
                    f.write(text if text else "(No text on this page)")
                    f.write("\n\n")
            except Exception as e:
                f.write(f"Error reading {file_path}: {e}\n\n")
        else:
            f.write(f"File not found: {file_path}\n\n")

print(f"Extracted text to {output_file}")
