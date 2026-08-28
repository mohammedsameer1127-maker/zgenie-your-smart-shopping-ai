from backend.services.order_parsers.amazon import AmazonParser
from backend.services.order_parsers.flipkart import FlipkartParser
from backend.services.order_parsers.myntra import MyntraParser
from backend.services.order_parsers.meesho import MeeshoParser
from backend.services.order_parsers.blinkit import BlinkitParser

RETAILER_PARSERS = [
    AmazonParser,
    FlipkartParser,
    MyntraParser,
    MeeshoParser,
    BlinkitParser,
]

__all__ = [
    "AmazonParser",
    "FlipkartParser",
    "MyntraParser",
    "MeeshoParser",
    "BlinkitParser",
    "RETAILER_PARSERS",
]
