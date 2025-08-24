const mineflayer = require('mineflayer');
const yggdrasil = require('node-yggdrasil');

class BotInstance {
    constructor(botName, botData, serverInfo) {
        this.botName = botName;
        this.botData = botData;
        this.serverInfo = serverInfo;
        this.bot = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 seconds
    }
    
    async connect() {
        try {
            console.log(`Connecting bot ${this.botName} to donutsmp.net via ${this.serverInfo.name}...`);
            
            const auth = await this.getAuth();
            if (!auth) {
                throw new Error('Authentication failed');
            }
            
            // Create bot instance
            this.bot = mineflayer.createBot({
                host: process.env.MINECRAFT_HOST || 'donutsmp.net',
                port: parseInt(process.env.MINECRAFT_PORT) || 25565, // Default Minecraft port
                username: auth.username,
                auth: auth.type,
                password: auth.password,
                version: '1.20.1', // Adjust version as needed
                authTitle: 'DonutBets Bot',
                skipValidation: false,
                client: {
                    username: auth.username,
                    version: '1.20.1'
                }
            });
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Wait for connection
            await this.waitForConnection();
            
            this.isConnected = true;
            console.log(`Bot ${this.botName} connected successfully as ${auth.username} via ${this.serverInfo.name}`);
            
        } catch (error) {
            console.error(`Error connecting bot ${this.botName}:`, error);
            throw error;
        }
    }
    
    async getAuth() {
        const loginType = this.botData.login_type;
        
        if (loginType === 'mineflyer') {
            return await this.getMineflyerAuth();
        } else if (loginType === 'thealtening') {
            return await this.getTheAlteningAuth();
        } else {
            throw new Error(`Unsupported login type: ${loginType}`);
        }
    }
    
    async getMineflyerAuth() {
        // For Mineflyer, we need to authenticate with Microsoft/Mojang
        const email = this.botData.mineflyer_email;
        const password = this.botData.mineflyer_password;
        
        if (!email || !password) {
            throw new Error('Mineflyer email and password are required');
        }
        
        try {
            // Authenticate with Microsoft/Mojang
            const authResult = await yggdrasil.authenticate({
                username: email,
                password: password,
                clientToken: 'donutbets-bot-client'
            });
            
            return {
                type: 'microsoft',
                username: this.botData.player_username || authResult.selectedProfile.name,
                accessToken: authResult.accessToken,
                clientToken: authResult.clientToken,
                selectedProfile: authResult.selectedProfile
            };
            
        } catch (error) {
            console.error('Mineflyer authentication error:', error);
            throw new Error('Mineflyer authentication failed: ' + error.message);
        }
    }
    
    async getTheAlteningAuth() {
        // For TheAltening, we need to authenticate with their API first
        const token = this.botData.thealtening_token;
        
        if (!token) {
            throw new Error('TheAltening token is required');
        }
        
        try {
            // TheAltening API authentication
            const response = await fetch('https://api.thealtening.com/v1/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                return {
                    type: 'offline',
                    username: this.botData.player_username || data.username || 'TheAlteningBot',
                    password: token
                };
            } else {
                throw new Error('TheAltening API authentication failed');
            }
            
        } catch (error) {
            console.error('TheAltening authentication error:', error);
            // Fallback to offline mode with stored username
            return {
                type: 'offline',
                username: this.botData.player_username || 'TheAlteningBot',
                password: token
            };
        }
    }
    
    setupEventHandlers() {
        if (!this.bot) return;
        
        // Connection events
        this.bot.on('spawn', () => {
            console.log(`Bot ${this.botName} spawned in the world via ${this.serverInfo.name}`);
            this.onSpawn();
        });
        
        this.bot.on('kicked', (reason, loggedIn) => {
            console.log(`Bot ${this.botName} was kicked via ${this.serverInfo.name}:`, reason);
            this.handleDisconnect('kicked', reason);
        });
        
        this.bot.on('end', () => {
            console.log(`Bot ${this.botName} connection ended via ${this.serverInfo.name}`);
            this.handleDisconnect('end');
        });
        
        this.bot.on('error', (error) => {
            console.error(`Bot ${this.botName} error via ${this.serverInfo.name}:`, error);
            this.handleDisconnect('error', error.message);
        });
        
        // Chat events
        this.bot.on('chat', (username, message, translate, matchMsg) => {
            if (username === this.bot.username) return; // Ignore own messages
            
            console.log(`[${this.botName}@${this.serverInfo.name}] ${username}: ${message}`);
            this.handleChat(username, message);
        });
        
        this.bot.on('playerJoined', (player) => {
            console.log(`[${this.botName}@${this.serverInfo.name}] Player joined: ${player.username}`);
        });
        
        this.bot.on('playerLeft', (player) => {
            console.log(`[${this.botName}@${this.serverInfo.name}] Player left: ${player.username}`);
        });
        
        // Health and position events
        this.bot.on('health', () => {
            const health = this.bot.health;
            const food = this.bot.food;
            console.log(`[${this.botName}@${this.serverInfo.name}] Health: ${health}, Food: ${food}`);
        });
        
        this.bot.on('move', () => {
            const pos = this.bot.entity.position;
            console.log(`[${this.botName}@${this.serverInfo.name}] Position: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`);
        });
    }
    
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 30000); // 30 second timeout
            
            this.bot.once('spawn', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            this.bot.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
            
            this.bot.once('kicked', (reason) => {
                clearTimeout(timeout);
                reject(new Error(`Kicked: ${reason}`));
            });
        });
    }
    
    onSpawn() {
        // Bot successfully spawned, can start performing actions
        console.log(`Bot ${this.botName} is ready to perform actions via ${this.serverInfo.name}`);
        
        // Example: Send a welcome message
        setTimeout(() => {
            this.sendChat(`/msg DonutBets Bot is online via ${this.serverInfo.name}!`);
        }, 2000);
    }
    
    handleChat(username, message) {
        // Handle incoming chat messages
        // You can implement custom logic here for bot responses
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            setTimeout(() => {
                this.sendChat(`Hello ${username}! I'm ${this.botName}, a DonutBets bot running on ${this.serverInfo.name}.`);
            }, 1000);
        }
    }
    
    handleDisconnect(reason, details = '') {
        this.isConnected = false;
        console.log(`Bot ${this.botName} disconnected via ${this.serverInfo.name}: ${reason} ${details}`);
        
        // Attempt to reconnect if not manually stopped
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect bot ${this.botName} via ${this.serverInfo.name} (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error(`Reconnection attempt ${this.reconnectAttempts} failed via ${this.serverInfo.name}:`, error);
                });
            }, this.reconnectDelay);
        } else {
            console.log(`Bot ${this.botName} max reconnection attempts reached via ${this.serverInfo.name}`);
        }
    }
    
    sendChat(message) {
        if (this.bot && this.isConnected) {
            this.bot.chat(message);
        }
    }
    
    async disconnect() {
        if (this.bot) {
            this.isConnected = false;
            this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
            this.bot.quit();
            this.bot = null;
        }
    }
    
    // Bot actions
    async moveTo(x, y, z) {
        if (this.bot && this.isConnected) {
            try {
                await this.bot.pathfinder.goto(new this.bot.pathfinder.goals.GoalBlock(x, y, z));
            } catch (error) {
                console.error(`Error moving bot ${this.botName} via ${this.serverInfo.name}:`, error);
            }
        }
    }
    
    async lookAt(x, y, z) {
        if (this.bot && this.isConnected) {
            try {
                await this.bot.lookAt(x, y, z);
            } catch (error) {
                console.error(`Error looking at target for bot ${this.botName} via ${this.serverInfo.name}:`, error);
            }
        }
    }
    
    getPosition() {
        if (this.bot && this.isConnected) {
            const pos = this.bot.entity.position;
            return { x: pos.x, y: pos.y, z: pos.z };
        }
        return null;
    }
    
    getHealth() {
        if (this.bot && this.isConnected) {
            return {
                health: this.bot.health,
                food: this.bot.food,
                saturation: this.bot.foodSaturation
            };
        }
        return null;
    }
    
    getServerInfo() {
        return {
            server_id: this.serverInfo.id,
            server_name: this.serverInfo.name,
            port: this.serverInfo.port
        };
    }
}

module.exports = BotInstance; 