from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_current_user
from config import AGORA_APP_ID, AGORA_APP_CERTIFICATE
import time
from agora_token_builder import RtcTokenBuilder

router = APIRouter(prefix="/agora", tags=["agora"])

@router.get("/token/{channel_name}")
async def get_agora_token(channel_name: str, current_user: dict = Depends(get_current_user)):
    if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
        raise HTTPException(status_code=500, detail="Agora credentials not configured")
    expiration_seconds = 3600
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_seconds
    uid = 0
    token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel_name,
        uid,
        1,
        privilege_expired_ts
    )
    return {"token": token, "app_id": AGORA_APP_ID, "channel": channel_name}