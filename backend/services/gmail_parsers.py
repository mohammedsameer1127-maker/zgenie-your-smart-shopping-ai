import re
from typing import Optional, Dict, Any, List
from datetime import datetime
from bs4 import BeautifulSoup

def clean_text(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.split()).strip()

def extract_price(text: str) -> Optional[float]:
    if not text:
        return None
    # Match ₹ 1,499.00, Rs. 1499, INR 1,499, Rs 1499.50
    matches = re.findall(r"(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)", text, re.IGNORECASE)
    if matches:
        try:
            val_str = matches[0].replace(",", "")
            return float(val_str)
        except (ValueError, IndexError):
            pass
    return None

def extract_product_image_from_html(html_body: str) -> Optional[str]:
    if not html_body:
        return None
    try:
        soup = BeautifulSoup(html_body, "html.parser")
        # Look for images with product-like sources or alt text, ignoring tiny icons/trackers
        for img in soup.find_all("img"):
            src = img.get("src", "")
            alt = img.get("alt", "")
            width = img.get("width")
            height = img.get("height")
            
            # Skip tracking pixels
            if "spacer" in src or "tracker" in src or "1x1" in src or "pixel" in src:
                continue
            if width and height:
                try:
                    if int(width) < 30 or int(height) < 30:
                        continue
                except ValueError:
                    pass
            
            # Identify product images from common CDNs
            if any(domain in src for domain in ["media-amazon", "rukminim", "images.meesho", "assets.myntassets", "croma.com", "reliancedigital"]):
                return src
            if alt and len(alt) > 5 and not any(x in alt.lower() for x in ["logo", "icon", "star", "social", "banner"]):
                if src.startswith("http"):
                    return src
    except Exception:
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
        return "amazon" in sender.lower() or "amazon.in" in sender.lower() or "amazon.com" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        # 1. Order Number: 408-1234567-1234567
        order_match = re.search(r"\b(\d{3}-\d{7}-\d{7})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        # 2. Lifecycle status
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        
        # 3. Product name extraction
        product_name = None
        # Try extracting product title from subject (e.g., "Your Amazon.in order of 'Apple iPhone 16 Pro'...")
        subj_match = re.search(r"order of \"?([^\"]+?)\"? has been", subject, re.IGNORECASE)
        if subj_match:
            product_name = clean_text(subj_match.group(1))
        elif "ordered" in subject.lower():
            subj_match2 = re.search(r"ordered:?\s*\"?([^\"]+?)\"?(?:\.|$)", subject, re.IGNORECASE)
            if subj_match2:
                product_name = clean_text(subj_match2.group(1))
        
        if not product_name:
            # Fallback to snippet/body parsing
            lines = [l.strip() for l in body_text.splitlines() if l.strip()]
            for line in lines[:15]:
                if any(kw in line.lower() for kw in ["view or manage order", "sold by", "condition: new", "qty:"]):
                    continue
                if len(line) > 10 and not any(kw in line.lower() for kw in ["amazon", "order #", "delivery", "track your package"]):
                    product_name = clean_text(line)
                    break
        
        if not product_name:
            product_name = "Amazon Order Item"
            
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Amazon",
            "product_name": product_name,
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class FlipkartParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "flipkart" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        order_match = re.search(r"\b(OD\d{15,20})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        
        product_name = None
        subj_match = re.search(r"for\s+(.+?)(?:is|has|placed|confirmed|delivered)", subject, re.IGNORECASE)
        if subj_match:
            product_name = clean_text(subj_match.group(1))
        
        if not product_name:
            product_name = "Flipkart Order Item"
            
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Flipkart",
            "product_name": product_name,
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class MeeshoParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "meesho" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        order_match = re.search(r"\b(?:order|sub-?order)\s*(?:id|#)?\s*:?\s*([a-zA-Z0-9_-]+)", f"{subject} {snippet} {body_text}", re.IGNORECASE)
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Meesho",
            "product_name": "Meesho Order Item",
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class MyntraParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "myntra" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        order_match = re.search(r"\b(1\d{9,13})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Myntra",
            "product_name": "Myntra Fashion Order",
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class CromaParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "croma" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        order_match = re.search(r"\b(\d{8,14})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Croma",
            "product_name": "Croma Electronics Item",
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class RelianceDigitalParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        return "reliancedigital" in sender.lower() or "reliance" in sender.lower() or "ril.com" in sender.lower()

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        order_match = re.search(r"\b((?:RD|RN|ORD)?\d{8,14})\b", f"{subject} {snippet} {body_text}")
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": "Reliance Digital",
            "product_name": "Reliance Digital Product",
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

class GenericOrderParser:
    @staticmethod
    def matches(sender: str, subject: str) -> bool:
        combined = f"{sender} {subject}".lower()
        return any(k in combined for k in ["order", "invoice", "receipt", "shipped", "delivered", "refund", "purchase"])

    @staticmethod
    def parse(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
        # Infer retailer from sender
        retailer = "Retailer"
        sender_clean = sender.split("<")[0].strip().replace('"', '')
        if sender_clean and len(sender_clean) > 2:
            retailer = sender_clean
        elif "@" in sender:
            domain = sender.split("@")[-1].split(">")[0].split(".")[0].capitalize()
            retailer = domain
            
        order_match = re.search(r"(?:order|invoice|receipt)\s*(?:#|id|no\.?)?\s*:?\s*([A-Za-z0-9_-]{5,20})", f"{subject} {snippet} {body_text}", re.IGNORECASE)
        order_number = order_match.group(1) if order_match else None
        
        lifecycle = detect_lifecycle_status(subject, snippet, body_text)
        amount = extract_price(f"{subject} {snippet} {body_text}")
        image_url = extract_product_image_from_html(body_html)
        
        return {
            "retailer": retailer,
            "product_name": clean_text(subject) or f"{retailer} Order",
            "product_image": image_url,
            "order_number": order_number,
            "amount": amount,
            "currency": "INR",
            "status": lifecycle["status"],
            "delivered": lifecycle["delivered"],
            "returned": lifecycle["returned"],
            "refunded": lifecycle["refunded"],
            "refund_amount": amount if lifecycle["refunded"] else None,
            "source": "gmail",
            "email_message_id": msg_id,
            "email_subject": subject,
        }

PARSERS = [
    AmazonParser,
    FlipkartParser,
    MeeshoParser,
    MyntraParser,
    CromaParser,
    RelianceDigitalParser,
    GenericOrderParser,
]

def parse_order_email(msg_id: str, sender: str, subject: str, snippet: str, body_text: str, body_html: str, date_str: Optional[str]) -> Optional[Dict[str, Any]]:
    for parser in PARSERS:
        if parser.matches(sender, subject):
            result = parser.parse(msg_id, sender, subject, snippet, body_text, body_html, date_str)
            if result:
                # Format dates
                if date_str:
                    try:
                        # Parse RFC 2822 / standard email dates
                        from email.utils import parsedate_to_datetime
                        dt = parsedate_to_datetime(date_str)
                        result["order_date"] = dt.strftime("%Y-%m-%d")
                        result["order_time"] = dt.strftime("%H:%M:%S")
                    except Exception:
                        pass
                if not result.get("order_date"):
                    result["order_date"] = datetime.utcnow().strftime("%Y-%m-%d")
                if not result.get("order_time"):
                    result["order_time"] = datetime.utcnow().strftime("%H:%M:%S")
                return result
    return None
