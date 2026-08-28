from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import httpx
import os
from backend.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

class StoreDealInput(BaseModel):
    platform: str
    price: Any
    original_price: Optional[Any] = None
    discount: Optional[str] = None
    delivery: Optional[str] = None
    qualityRating: Optional[float] = None
    qualityScore: Optional[str] = None
    regretRisk: Optional[str] = None
    sellerType: Optional[str] = None
    offers: Optional[List[str]] = None

class CompareProductInput(BaseModel):
    name: str
    category: Optional[str] = None
    rating: Optional[float] = None
    reviewsCount: Optional[int] = None
    platforms: List[StoreDealInput]

class CompareAnalysisRequest(BaseModel):
    products: List[CompareProductInput]
    userQuery: Optional[str] = None
    apiKey: Optional[str] = None
    model: Optional[str] = None

class ChatMessageInput(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageInput]
    apiKey: Optional[str] = None
    model: Optional[str] = None

def get_groq_url() -> str:
    return getattr(settings, "GROQ_API_URL", "") or os.getenv("GROQ_API_URL", "") or os.getenv("VITE_GROQ_API_URL", "") or "https://api.groq.com/openai/v1/chat/completions"

def get_groq_model(override_model: Optional[str] = None) -> str:
    return override_model or getattr(settings, "GROQ_MODEL", "") or os.getenv("GROQ_MODEL", "") or os.getenv("VITE_GROQ_MODEL", "") or "openai/gpt-oss-120b"

def get_groq_key(provided_key: Optional[str] = None) -> str:
    key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "") or os.getenv("VITE_GROQ_API_KEY", "") or provided_key or ""
    return key.strip()

@router.post("/compare-analysis")
async def analyze_comparison(request: CompareAnalysisRequest):
    """
    Analyzes and compares products/stores using ZGenie AI high-speed engine.
    Provides best purchase recommendation, store tradeoffs, and buyer regret analysis with 100% data consistency.
    """
    api_key = get_groq_key(request.apiKey)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZGenie AI API key not found. Please configure GROQ_API_KEY in backend/.env or in the request."
        )

    model_name = get_groq_model(request.model)

    # Construct clean prompt with structured pricing data
    product_summaries = []
    for p in request.products:
        deal_lines = []
        for d in p.platforms:
            deal_lines.append(
                f"- Store: {d.platform} | Price: ₹{d.price} (Original: ₹{d.original_price or 'N/A'}, Discount: {d.discount or 'N/A'}) | "
                f"Delivery: {d.delivery or 'Standard'} | Seller: {d.sellerType or 'Verified'} | Rating: {d.qualityRating or 'N/A'}/5.0 | "
                f"Regret Risk: {d.regretRisk or 'Low'} | Offers: {', '.join(d.offers or [])}"
            )
        deal_text = "\n".join(deal_lines)
        product_summaries.append(f"### Product: {p.name} (Category: {p.category or 'General'})\nAvailable Deals across Stores:\n{deal_text}")

    context_data = "\n\n".join(product_summaries)

    system_prompt = (
        "You are ZGenie AI, an elite smart shopping intelligence assistant.\n"
        "Analyze real-time product comparison data across verified, authorized Indian retailers (Amazon, Flipkart, Croma, Reliance Digital, Blinkit, Myntra, Meesho, Tata CLiQ, Swiggy Instamart, Zepto, etc.).\n\n"
        "STRICT ACCURACY RULES:\n"
        "1. ONLY quote the exact prices, store names, discounts, and regret risks given in the data table below. Do not guess, alter, or fabricate any numbers.\n"
        "2. Clearly identify which store has the lowest price.\n"
        "3. Provide a concise, actionable breakdown in clean Markdown:\n"
        "- 🏆 **Top Recommendation**: Best store deal (balancing exact price, delivery, and seller authenticity).\n"
        "- ⚖️ **Price & Store Tradeoffs**: Differences between the lowest price retailer and other retailers (warranty, delivery speed, return policy).\n"
        "- 💡 **Smart Savings Advice**: Best payment/card discount tips and value-for-money verdict.\n"
        "- 🛡️ **Buyer Protection & Regret Score**: Exact regret risk and warranty check.\n\n"
        "Keep it punchy, sharp, highly trustworthy, and under 250 words."
    )

    user_prompt = f"Here is the live verified comparison data for user search '{request.userQuery or 'Product Comparison'}':\n\n{context_data}\n\nPlease analyze and provide your buying verdict."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 2048
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(get_groq_url(), headers=headers, json=payload)
            
            if resp.status_code != 200:
                error_body = resp.text
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"ZGenie AI service error ({resp.status_code}): {error_body}"
                )

            data = resp.json()
            analysis_text = data["choices"][0]["message"]["content"]

            return {
                "success": True,
                "model": model_name,
                "analysis": analysis_text,
                "usage": data.get("usage", {})
            }
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to communicate with ZGenie AI service: {str(e)}"
        )

@router.post("/chat")
async def chat_with_groq(request: ChatRequest):
    """
    General AI Shopping Assistant chat powered by ZGenie AI.
    """
    api_key = get_groq_key(request.apiKey)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZGenie AI API key not found. Please configure GROQ_API_KEY in backend/.env."
        )

    model_name = get_groq_model(request.model)

    system_prompt = (
        "You are ZGenie AI, the dedicated smart shopping intelligence assistant for the ZGenie platform. "
        "Your task is to help Indian shoppers compare prices across verified authorized retailers: Amazon, Flipkart, Croma, Reliance Digital, Blinkit, Myntra, Meesho, and Tata CLiQ.\n\n"
        "STRICT GUARDRAILS & RESTRICTIONS:\n"
        "1. ONLY answer questions strictly related to shopping, products, prices, specifications, multi-store comparisons, deals, discounts, order history, and the ZGenie website.\n"
        "2. If the user asks ANY question unrelated to shopping or this website (e.g. coding/programming, math, history, geography, politics, general trivia, recipes, science, essays, jokes, personal advice, etc.), DO NOT ANSWER IT.\n"
        "3. When an unrelated query is asked, refuse politely in 1-2 sentences: 'I am ZGenie AI, your dedicated smart shopping assistant. I only answer questions related to products, prices, and deals across verified stores (Amazon, Flipkart, Croma, Reliance Digital, etc.). How can I help you find the best shopping deal today?'\n"
        "4. For valid shopping questions: Provide concise, direct answers under 120 words with live prices in ₹ (INR), recommended store, key specs, and regret score. Avoid fluff."
    )

    formatted_messages = [{"role": "system", "content": system_prompt}]
    for m in request.messages:
        formatted_messages.append({"role": m.role, "content": m.content})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model_name,
        "messages": formatted_messages,
        "temperature": 0.5,
        "max_tokens": 1500
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(get_groq_url(), headers=headers, json=payload)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"ZGenie AI error: {resp.text}")

            data = resp.json()
            reply = data["choices"][0]["message"]["content"]
            return {
                "success": True,
                "model": model_name,
                "message": reply,
                "usage": data.get("usage", {})
            }
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to communicate with ZGenie AI service: {str(e)}"
        )
