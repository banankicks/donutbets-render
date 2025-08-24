# DonutBets Render Bots

Ez a mappa tartalmazza a **bot service** részt, ami Renderen fut és a botokat kezeli.

## 🏗️ **Architektúra**

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Weboldal      │ ◄────────────► │  Render Bot     │
│   (Admin Panel) │                │   Service       │
│                 │                │                 │
│ - Bot hozzáadás │                │ - Bot futtatás  │
│ - Szerver vál.  │                │ - Minecraft     │
│ - Bot kezelés   │                │   kapcsolat     │
└─────────────────┘                └─────────────────┘
```

## 🚀 Gyors Deploy

### **1. GitHub Repository**
```bash
# Új repository létrehozása
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/donutbets-renderbots.git
git push -u origin main
```

### **2. Render Dashboard - Bot Service**

#### **Bot Service:**
1. **New** → **Web Service**
2. **Repository**: `donutbets-renderbots`
3. **Name**: `donutbets-bot-manager`
4. **Build Command**: `npm install`
5. **Start Command**: `node bot-manager.js`
6. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `CURRENT_SERVER` = `server1` (vagy server2, server3, server4, server5)
   - `MINECRAFT_HOST` = `donutsmp.net`
   - `MINECRAFT_PORT` = `25565`

## 📁 Fájlstruktúra

```
renderbots/
├── package.json          # Node.js függőségek
├── bot-manager.js        # Bot manager (5 szerver támogatás)
├── bot-instance.js       # Bot instance (Mineflayer)
├── data/                 # Bot adatok (automatikusan létrejön)
│   └── bots.json
├── deploy.sh             # Automatikus deploy script
├── .gitignore            # Git ignore fájl
└── README.md
```

## 🔧 Szerver Kiválasztás

A rendszer **5 virtuális szervert** támogat egy service-en belül:

- **Szerver 1** (server1) - Port 8080
- **Szerver 2** (server2) - Port 8081  
- **Szerver 3** (server3) - Port 8082
- **Szerver 4** (server4) - Port 8083
- **Szerver 5** (server5) - Port 8084

### **Szerver Választás:**
```bash
# Environment variable beállítása
CURRENT_SERVER=server1  # vagy server2, server3, server4, server5
```

## 🌐 Bot Server URL

A deploy után ez lesz az URL:
- `https://donutbets-bot-manager.onrender.com`

## 🔗 Weboldal Integráció

A weboldalon használd ezt a konfigurációt:

```php
// config.php a weboldalon
define('BOT_SERVER_HOST', 'donutbets-bot-manager.onrender.com');
define('BOT_SERVER_PORT', 443);
```

## 📊 API Endpoints

### **Health Check**
```bash
curl https://donutbets-bot-manager.onrender.com/health
```

### **Bot API**
```bash
# Bot indítása
curl -X POST https://donutbets-bot-manager.onrender.com/api/start_bot \
  -H "Content-Type: application/json" \
  -d '{"bot_name":"test_bot", "server":"server1"}'

# Bot leállítása
curl -X POST https://donutbets-bot-manager.onrender.com/api/stop_bot \
  -H "Content-Type: application/json" \
  -d '{"bot_name":"test_bot", "server":"server1"}'

# Szerverek lekérése
curl https://donutbets-bot-manager.onrender.com/api/get_servers

# Bot adatok szinkronizálása
curl -X POST https://donutbets-bot-manager.onrender.com/api/sync_bots \
  -H "Content-Type: application/json" \
  -d '{"bots":{"bot1":{"login_type":"mineflyer",...}}}'
```

## 🎯 Használat

1. **Render deploy** - bot service fut
2. **Weboldal** - admin panel a bot kezeléshez
3. **Admin panel** - szerver kiválasztás (Szerver 1-5)
4. **Bot hozzáadása** - Microsoft/TheAltening fiók
5. **Bot indítása** - csatlakozás a Minecraft szerverhez

## 🔧 Environment Variables

Bot service-hez beállítandó:
```
NODE_ENV=production
CURRENT_SERVER=server1
MINECRAFT_HOST=donutsmp.net
MINECRAFT_PORT=25565
```

## 🚀 Deploy Script

```bash
# Automatikus deploy
chmod +x deploy.sh
./deploy.sh
```

## 📈 Előnyök

- ✅ **Ingyenes hosting** (750 óra/hó)
- ✅ **5 virtuális szerver** egy service-en belül
- ✅ **Automatikus SSL** tanúsítványok
- ✅ **Automatikus health checks**
- ✅ **Monitoring** és logok
- ✅ **GitHub integráció**
- ✅ **Weboldal integráció** HTTP API-n keresztül

## 🎮 Minecraft Bot Funkciók

- ✅ **Valós Microsoft auth** (email/jelszó)
- ✅ **Valós TheAltening auth** (API token)
- ✅ **Automatikus újracsatlakozás**
- ✅ **Chat üzenetek kezelése**
- ✅ **Pozíció követés**
- ✅ **Egészség monitorozás**
- ✅ **Szerver kiválasztás** admin panelben

## 🔗 Kapcsolat

- **Minecraft Szerver**: `donutsmp.net`
- **Bot Service**: Render automatikusan
- **Weboldal**: Bármilyen PHP hosting

## ⚠️ Fontos Megjegyzés

**Blueprint helyett manuálisan kell létrehozni a service-t, mert a Blueprint csak fizetős csomagokban érhető el.**

## 🎯 Weboldal Funkciók

- **Szerver kiválasztás**: Szerver 1-5 közül választhatsz
- **Bot hozzáadása**: Microsoft vagy TheAltening fiók
- **Teszt bejelentkezés**: Ellenőrzi a fiók érvényességét
- **Bot indítás/leállítás**: A kiválasztott szerveren
- **Bot törlés**: Eltávolítja a botot
- **Adat szinkronizálás**: A weboldal és bot service között

---

**Kész!** Csak push-old a GitHub-ra és manuálisan hozd létre a service-t Renderen! 🚀 