import re
from typing import Optional, Dict, Any, List
from bs4 import BeautifulSoup
from backend.services.order_parsers.amazon import clean_text, extract_price, detect_lifecycle_status

class MyntraParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "myntra" in sender.lower() or "myntra.com" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        # Myntra Order Number: 123456789012 (10-14 digits)
        order_match = re.search(r"\b(1\d{9,13})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        
        product_name = None
        subj_match = re.search(r"(?:order for|item)\s+(.+?)(?:\s+has|\s+is|\s+confirmed|\s+shipped|\.|$)", subject, re.IGNORECASE)
        if subj_match:
            product_name = clean_text(subj_match.group(1))
        
        if not product_name:
            lines = [l.strip() for l in body_text.splitlines() if l.strip()]
            for line in lines[:10]:
                if any(kw in line.lower() for kw in ["myntra", "order id", "track package", "download invoice", "delivered to"]):
                    continue
                if len(line) > 8:
                    product_name = clean_text(line)
                    break
                    
        if not product_name:
            product_name = "Myntra Fashion Order"
            
        amount = extract_price(f"{subject} {snippet} {body_text}")
        
        image_url = None
        if body_html:
            try:
                soup = BeautifulSoup(body_html, "html.parser")
                for img in soup.find_all("img"):
                    src = img.get("src", "")
                    if "myntassets" in src:
                        image_url = src
                        break
            except Exception:
                pass

        items = [{
            "name": product_name,
            "price": amount,
            "quantity": 1,
            "image": image_url,
        }]

        return {
            "retailer": "Myntra",
            "platform": "Myntra",
            "product_name": product_name,
            "product_image": image_url,
            "order_number": order_number,
            "order_id": order_number,
            "items": items,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "source_email_id": msg_id,
            "email_subject": subject,
        }
