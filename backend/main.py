from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import asyncio
import logging
from datetime import datetime

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CopyBot Web - Copy Trading API",
    version="1.0.0",
    description="API pour bot de copy trading automatisé de meme coins",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:80",
        "http://127.0.0.1:3000",
        "*"  # À restreindre en production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ============= MODELS =============
class WalletConnection(BaseModel):
    address: str = Field(..., min_length=10, description="Adresse du wallet")
    network: str = Field(..., description="Réseau blockchain")
    balance: Optional[float] = Field(None, ge=0, description="Solde optionnel")

class WalletResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class NetworkInfo(BaseModel):
    id: str
    name: str
    currency: str
    priority: int
    rpc_url: Optional[str] = None
    explorer_url: Optional[str] = None

class WalletToTrack(BaseModel):
    address: str
    network: str
    nickname: Optional[str] = None
    copy_mode: str = Field(default="full", description="full, buy_only, sell_only")
    budget_per_trade: Optional[float] = Field(None, gt=0)
    stop_loss_percentage: Optional[float] = Field(None, gt=0, le=100)

# ============= STORAGE =============
# Store temporaire (en production, utiliser une vraie DB)
connected_wallets: Dict[str, Dict] = {}
tracked_wallets: Dict[str, Dict] = {}
bot_status = {
    "is_running": False,
    "wallets_tracked": 0,
    "trades_today": 0,
    "last_activity": None,
    "version": "1.0.0"
}

# ============= ENDPOINTS =============
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Endpoint de santé de l'API"""
    return {
        "message": "CopyBot Web - Copy Trading API",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now(),
        "description": "Bot de copy trading automatisé pour meme coins",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "wallet_connect": "/api/wallet/connect",
            "networks": "/api/networks"
        }
    }

@app.get("/health")
async def health_check():
    """Health check pour Docker"""
    return {
        "status": "healthy",
        "service": "copybot-web",
        "timestamp": datetime.now(),
        "uptime": "running",
        "connected_wallets": len(connected_wallets),
        "tracked_wallets": len(tracked_wallets),
        "bot_running": bot_status["is_running"]
    }

@app.post("/api/wallet/connect", response_model=WalletResponse)
async def connect_wallet(wallet: WalletConnection):
    """Connecter un wallet au bot CopyBot"""
    try:
        logger.info(f"[CopyBot] Tentative de connexion wallet: {wallet.address[:6]}...{wallet.address[-4:]}")

        # Validation du réseau
        supported_networks = ["solana", "ethereum", "base", "bnb"]
        if wallet.network not in supported_networks:
            raise HTTPException(
                status_code=400,
                detail=f"Réseau non supporté. Réseaux supportés: {supported_networks}"
            )

        # Validation basique de l'adresse par réseau
        if wallet.network == "solana":
            if len(wallet.address) < 32:
                raise HTTPException(status_code=400, detail="Adresse Solana invalide (trop courte)")
        elif wallet.network in ["ethereum", "base", "bnb"]:
            if not wallet.address.startswith("0x") or len(wallet.address) != 42:
                raise HTTPException(status_code=400, detail="Adresse EVM invalide (format 0x...)")

        # Stockage de la connexion
        wallet_data = {
            "address": wallet.address,
            "network": wallet.network,
            "connected_at": datetime.now(),
            "balance": wallet.balance or 0.0,
            "is_active": True,
            "type": "personal"  # Personnel ou tracked
        }

        connected_wallets[wallet.address] = wallet_data

        logger.info(f"[CopyBot] Wallet connecté: {wallet.network} - {wallet.address[:6]}...")

        return WalletResponse(
            status="success",
            message=f"Wallet connecté avec succès sur {wallet.network}",
            data={
                "address": wallet.address,
                "network": wallet.network,
                "connected": True,
                "short_address": f"{wallet.address[:6]}...{wallet.address[-4:]}",
                "type": "personal"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CopyBot] Erreur connexion wallet: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@app.get("/api/wallet/{address}/balance", response_model=WalletResponse)
async def get_wallet_balance(address: str, network: str = "solana"):
    """Récupérer le solde d'un wallet"""
    try:
        # TODO: Intégration vraie API blockchain (Solscan, Etherscan, etc.)

        # Mock data réaliste pour la démo
        mock_balances = {
            "solana": {
                "native": round(2.45 + (hash(address) % 100) / 100, 3),
                "usdc": round(850.0 + (hash(address) % 1000), 2),
                "usdt": round((hash(address) % 500), 2)
            },
            "ethereum": {
                "native": round(0.75 + (hash(address) % 10) / 10, 4),
                "usdc": round(1200.0 + (hash(address) % 800), 2),
                "usdt": round(500.0 + (hash(address) % 300), 2)
            },
            "base": {
                "native": round(1.2 + (hash(address) % 5) / 10, 4),
                "usdc": round(600.0 + (hash(address) % 400), 2),
                "usdt": round(200.0 + (hash(address) % 200), 2)
            },
            "bnb": {
                "native": round(3.8 + (hash(address) % 20) / 10, 3),
                "usdc": round(400.0 + (hash(address) % 600), 2),
                "usdt": round(100.0 + (hash(address) % 150), 2)
            }
        }

        balances = mock_balances.get(network, mock_balances["solana"])

        balance_data = {
            "address": address,
            "network": network,
            "balances": balances,
            "last_updated": datetime.now(),
            "usd_value": round(sum(balances.values()) * 1.05, 2),  # Mock conversion USD
            "currency_symbol": {
                "solana": "SOL",
                "ethereum": "ETH",
                "base": "ETH",
                "bnb": "BNB"
            }.get(network, "SOL")
        }

        return WalletResponse(
            status="success",
            message="Solde récupéré avec succès",
            data=balance_data
        )

    except Exception as e:
        logger.error(f"[CopyBot] Erreur récupération solde: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/networks", response_model=Dict[str, List[NetworkInfo]])
async def get_supported_networks():
    """Liste des réseaux blockchain supportés par CopyBot"""
    networks = [
        NetworkInfo(
            id="solana",
            name="Solana",
            currency="SOL",
            priority=1,
            rpc_url="https://api.mainnet-beta.solana.com",
            explorer_url="https://explorer.solana.com"
        ),
        NetworkInfo(
            id="ethereum",
            name="Ethereum",
            currency="ETH",
            priority=2,
            rpc_url="https://mainnet.infura.io/v3/",
            explorer_url="https://etherscan.io"
        ),
        NetworkInfo(
            id="base",
            name="Base",
            currency="ETH",
            priority=3,
            rpc_url="https://mainnet.base.org",
            explorer_url="https://basescan.org"
        ),
        NetworkInfo(
            id="bnb",
            name="BNB Chain",
            currency="BNB",
            priority=4,
            rpc_url="https://bsc-dataseed.binance.org",
            explorer_url="https://bscscan.com"
        )
    ]

    return {"networks": networks}

@app.post("/api/tracking/add", response_model=WalletResponse)
async def add_wallet_to_track(wallet_track: WalletToTrack):
    """Ajouter un wallet à suivre pour le copy trading"""
    try:
        # Validation
        if wallet_track.address in tracked_wallets:
            raise HTTPException(status_code=400, detail="Ce wallet est déjà suivi")

        # Stockage
        tracked_data = {
            "address": wallet_track.address,
            "network": wallet_track.network,
            "nickname": wallet_track.nickname or f"Wallet-{wallet_track.address[:6]}",
            "copy_mode": wallet_track.copy_mode,
            "budget_per_trade": wallet_track.budget_per_trade,
            "stop_loss_percentage": wallet_track.stop_loss_percentage,
            "added_at": datetime.now(),
            "is_active": True,
            "trades_copied": 0,
            "total_pnl": 0.0
        }

        tracked_wallets[wallet_track.address] = tracked_data

        logger.info(f"[CopyBot] Wallet ajouté au tracking: {wallet_track.address[:6]}... ({wallet_track.network})")

        return WalletResponse(
            status="success",
            message="Wallet ajouté au copy trading",
            data=tracked_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CopyBot] Erreur ajout tracking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tracking/list")
async def list_tracked_wallets():
    """Liste des wallets suivis"""
    return {
        "status": "success",
        "data": {
            "tracked_wallets": list(tracked_wallets.values()),
            "total_count": len(tracked_wallets)
        }
    }

@app.delete("/api/tracking/remove/{address}")
async def remove_tracked_wallet(address: str):
    """Retirer un wallet du suivi"""
    if address not in tracked_wallets:
        raise HTTPException(status_code=404, detail="Wallet non trouvé dans le suivi")

    removed = tracked_wallets.pop(address)
    logger.info(f"[CopyBot] Wallet retiré du tracking: {address[:6]}...")

    return {
        "status": "success",
        "message": "Wallet retiré du suivi",
        "data": removed
    }

@app.get("/api/bot/status")
async def get_bot_status():
    """Status du bot CopyBot"""
    global bot_status

    bot_status.update({
        "wallets_tracked": len(tracked_wallets),
        "connected_wallets": len(connected_wallets),
        "tracked_addresses": list(tracked_wallets.keys())
    })

    return {
        "status": "success",
        "data": bot_status
    }

@app.post("/api/bot/start")
async def start_bot(background_tasks: BackgroundTasks):
    """Démarrer le bot de copy trading"""
    global bot_status

    if bot_status["is_running"]:
        return {"message": "CopyBot déjà en cours d'exécution", "status": bot_status}

    if len(tracked_wallets) == 0:
        raise HTTPException(
            status_code=400,
            detail="Aucun wallet à suivre. Ajoutez des wallets avant de démarrer."
        )

    bot_status["is_running"] = True
    bot_status["last_activity"] = datetime.now()

    # TODO: Démarrer la surveillance des wallets en arrière-plan
    # background_tasks.add_task(start_wallet_monitoring)

    logger.info(f"[CopyBot] Bot démarré - Suivi de {len(tracked_wallets)} wallets")
    return {
        "status": "success",
        "message": f"CopyBot démarré - Suivi de {len(tracked_wallets)} wallets",
        "data": bot_status
    }

@app.post("/api/bot/stop")
async def stop_bot():
    """Arrêter le bot"""
    global bot_status

    bot_status["is_running"] = False
    bot_status["last_activity"] = datetime.now()

    logger.info("[CopyBot] Bot arrêté")
    return {
        "status": "success",
        "message": "CopyBot arrêté",
        "data": bot_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
