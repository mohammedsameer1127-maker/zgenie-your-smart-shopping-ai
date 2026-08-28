import re
from typing import Optional, Dict, Any, List
from bs4 import BeautifulSoup

def clean_text(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.split()).strip()

def extract_price(text: str) -> Optional[float]:
    if not text:
        return None
    matches = re.findall(r"(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)", text, re.IGNORECASE)
    if matches:
        try:
            val_str = matches[0].replace(",", "")
            return float(val_str)
        except (ValueError, IndexError):
            pass
    return None

def detect_lifecycle_status(subject: str, snippet: str, body: str) -> Dict[str, Any]:
    full = f"{subject} {snippet} {body}".lower()
    delivered = False
    returned = False
    refunded = False
    status = "Order Placed"
    
    if any(k in full for k in ["refund completed", "refund processed", "refund issued", "refund credited", "refund successful"]):
        status = "Refund Completed"
        refunded = True
    elif any(k in full for k in ["refund initiated", "processing refund", "refund in progress"]):
        status = "Refund Initiated"
        refunded = True
    elif any(k in full for k in ["return completed", "returned successfully", "pickup completed", "return received"]):
        status = "Returned"
        returned = True
    elif any(k in full for k in ["return initiated", "return requested", "return approved"]):
        status = "Return Initiated"
        returned = True
    elif any(k in full for k in ["delivered", "has been delivered", "delivered successfully"]):
        status = "Delivered"
        delivered = True
    elif any(k in full for k in ["out for delivery", "arriving today", "delivery today"]):
        status = "Out for Delivery"
    elif any(k in full for k in ["shipped", "dispatched", "on the way", "in transit"]):
        status = "Shipped"
    elif any(k in full for k in ["order confirmed", "confirmed", "payment received"]):
        status = "Confirmed"
    elif any(k in full for k in ["cancelled", "order cancelled"]):
        status = "Cancelled"
    elif any(k in full for k in ["order placed", "order received", "thank you for your order"]):
        status = "Order Placed"
        
    return {
        "status": status,
        "delivered": delivered,
        "returned": returned,
        "refunded": refunded
    }

class AmazonParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        s_lower = sender.lower()
        return "amazon" in s_lower or "amazon.in" in s_lower or "amazon.com" in s_lower

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        # 1. Order Number: 408-1234567-1234567 or 171-1234567-1234567
        order_match = re.search(r"\b(\d{3}-\d{7}-\d{7})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        # 2. Lifecycle status
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        
        # 3. Product name & items extraction
        product_name = None
        subj_match = re.search(r"order of \"?([^\"]+?)\"? has been", subject, re.IGNORECASE)
        if subj_match:
            product_name = clean_text(subj_match.group(1))
        elif "ordered" in subject.lower():
            subj_match2 = re.search(r"ordered:?\s*\"?([^\"]+?)\"?(?:\.|$)", subject, re.IGNORECASE)
            if subj_match2:
                product_name = clean_text(subj_match2.group(1))
        
        if not product_name:
            lines = [l.strip() for l in body_text.splitlines() if l.strip()]
            for line in lines[:15]:
                if any(kw in line.lower() for kw in ["view or manage order", "sold by", "condition: new", "qty:", "delivery", "track package"]):
                    continue
                if len(line) > 10 and not any(kw in line.lower() for kw in ["amazon", "order #", "auto-confirm", "subscribe"]):
                    product_name = clean_text(line)
                    break
        
        if not product_name:
            product_name = "Amazon Purchase Item"
            
        amount = extract_price(f"{subject} {snippet} {body_text}")
        
        # Extract image if available
        image_url = None
        if body_html:
            try:
                soup = BeautifulSoup(body_html, "html.parser")
                for img in soup.find_all("img"):
                    src = img.get("src", "")
                    if "media-amazon" in src or "images-amazon" in src:
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
            "retailer": "Amazon",
            "platform": "Amazon",
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
