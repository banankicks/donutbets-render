const { createBot } = require('mineflayer');

/* ===================================================
   Minecraft Bot Class
=================================================== */
class MinecraftBot {
    constructor(config) {
        this.minecraftConfig = config.minecraft;
        this.bot = null;
    }

    /* ---------- lifecycle ---------- */
    async startBot() {
        console.log('Starting bot...');
        try {
            const authOptions = {
                host: this.minecraftConfig.host,
                port: this.minecraftConfig.port || 25565,
                version: this.minecraftConfig.version || '1.20.1',
                keepAlive: true
            };
            
            if (this.minecraftConfig.auth === 'microsoft') {
                authOptions.username = this.minecraftConfig.email;
                authOptions.auth = 'microsoft';
            } else {
                authOptions.username = this.minecraftConfig.username;
                authOptions.auth = 'offline';
            }
            
            this.bot = createBot(authOptions);
            this.setupEventHandlers();
        } catch (err) {
            console.error('Auth failed:', err.message);
            console.log('Retrying in 30s...');
            setTimeout(() => this.startBot(), 30_000);
        }
    }

    setupEventHandlers() {
        this.bot.on('login', () => {
            console.log(`Logged in as ${this.bot.username}`);
        });

        this.bot.on('error', err => console.error('Error:', err.message));

        this.bot.on('end', reason => {
            console.log(`Disconnected: ${reason}`);
            setTimeout(() => this.startBot(), 30_000);
        });

        this.bot.on('spawn', () => {
            console.log('Spawned in the world');
        });

        // Handle chat messages for TPA requests
        this.bot.on('message', (message) => {
            const messageText = message.toString();
            console.log(`[${this.bot.username}] Chat: ${messageText}`);
            
            // Check for TPA request pattern: "PlayerName sent you a tpa request"
            const tpaMatch = messageText.match(/(\w+) sent you a tpa request/i);
            if (tpaMatch) {
                const fromPlayer = tpaMatch[1];
                console.log(`[${this.bot.username}] TPA request received from: ${fromPlayer}`);
                
                // Don't accept the TPA request - just log it for authentication
                console.log(`[${this.bot.username}] TPA request logged for authentication from: ${fromPlayer}`);
            }
        });
    }
}

/* ===================================================
   CONFIG
=================================================== */
const config = {
    minecraft: {
        host: 'donutsmp.net',
        port: 25565,
        email: '', // Will be set from admin panel
        auth: 'microsoft',
        version: '1.20.1'
    }
};

/* ===================================================
   STARTUP
=================================================== */
console.log("=== STARTING BOT ===");
const bot = new MinecraftBot(config);
bot.startBot(); 