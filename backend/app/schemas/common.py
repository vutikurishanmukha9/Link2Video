from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel, Field
from app.core.exceptions import ErrorCode

DataT = TypeVar("DataT")


class ErrorDetail(BaseModel):
    code: ErrorCode
    message: str
    details: Optional[Dict[str, Any]] = None


class APIResponse(BaseModel, Generic[DataT]):
    success: bool = True
    request_id: Optional[str] = None
    data: Optional[DataT] = None
    error: Optional[ErrorDetail] = None
