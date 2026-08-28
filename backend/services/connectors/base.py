from abc import ABC, abstractmethod
from typing import List
from backend.models.product import IntentPayload, NormalizedProduct

class BaseShoppingConnector(ABC):
    """
    Shared connector interface for shopping data providers.
    All data connectors must implement `search(intent: IntentPayload) -> List[NormalizedProduct]`.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Connector unique identifier (e.g. 'serpapi', 'serper')"""
        pass

    @abstractmethod
    async def search(self, intent: IntentPayload) -> List[NormalizedProduct]:
        """
        Execute shopping search for given intent payload and return
        a normalized list of products.
        Must fail safely without throwing unhandled exceptions.
        """
        pass
