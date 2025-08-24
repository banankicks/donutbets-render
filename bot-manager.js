const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Bot instances storage
const activeBots = new Map();

// Bot server configuration - egy service-en belül több szerver
const BOT_SERVERS = [
    { id: 'server1', name: 'Szerver 1', port: 8080 },
    { id: 'server2', name: 'Szerver 2', port: 8081 },
    { id: 'server3', name: 'Szerver 3', port: 8082 },
    { id: 'server4', name: 'Szerver 4', port: 8083 },
    { id: 'server5', name: 'Szerver 5', port: 8084 }
];

// Current server selection (default: server1)
let currentServerId = process.env.CURRENT_SERVER || 'server1';
const currentServer = BOT_SERVERS.find(s => s.id === currentServerId);

// WebSocket server for communication with PHP
const wss = new WebSocket.Server({ 
    port: currentServer.port,
    host: '0.0.0.0' // Listen on all interfaces
});

console.log(`Bot Manager started on ${currentServer.name} (${currentServer.id})`);
console.log(`Port: ${currentServer.port}`);
console.log(`Available servers: ${BOT_SERVERS.map(s => s.name).join(', ')}`);

// Bot data storage (in memory)
let botData = {};

// Load bots from web server
async function loadBotsFromWebServer() {
    try {
        // This would be called by the web server to sync bot data
        // For now, we'll use in-memory storage
        return botData;
    } catch (error) {
        console.error('Error loading bots from web server:', error);
        return {};
    }
}

// Save bots to web server
async function saveBotsToWebServer(bots) {
    try {
        // This would sync bot data back to the web server
        botData = bots;
        return true;
    } catch (error) {
        console.error('Error saving bots to web server:', error);
        return false;
    }
}

// Load bots (compatibility function)
function loadBots() {
    return botData;
}

// Save bots (compatibility function)
function saveBots(bots) {
    botData = bots;
    saveBotsToWebServer(bots);
}

// Start a bot
async function startBot(botName) {
    const bots = loadBots();
    const botData = bots[botName];
    
    if (!botData) {
        throw new Error(`Bot ${botName} not found`);
    }
    
    if (activeBots.has(botName)) {
        throw new Error(`Bot ${botName} is already running`);
    }
    
    console.log(`Starting bot: ${botName} on ${currentServer.name}`);
    
    try {
        const Bot = require('./bot-instance.js');
        const bot = new Bot(botName, botData, currentServer);
        
        await bot.connect();
        activeBots.set(botName, bot);
        
        // Update bot status
        bots[botName].connected = true;
        bots[botName].server = currentServerId;
        saveBots(bots);
        
        console.log(`Bot ${botName} started successfully on ${currentServer.name}`);
        return { 
            success: true, 
            message: `Bot ${botName} started successfully on ${currentServer.name}`,
            server: currentServer.name
        };
        
    } catch (error) {
        console.error(`Error starting bot ${botName}:`, error);
        return { success: false, message: error.message };
    }
}

// Stop a bot
async function stopBot(botName) {
    const bots = loadBots();
    
    if (!activeBots.has(botName)) {
        throw new Error(`Bot ${botName} is not running`);
    }
    
    console.log(`Stopping bot: ${botName} from ${currentServer.name}`);
    
    try {
        const bot = activeBots.get(botName);
        await bot.disconnect();
        activeBots.delete(botName);
        
        // Update bot status
        if (bots[botName]) {
            bots[botName].connected = false;
            saveBots(bots);
        }
        
        console.log(`Bot ${botName} stopped successfully from ${currentServer.name}`);
        return { 
            success: true, 
            message: `Bot ${botName} stopped successfully from ${currentServer.name}`,
            server: currentServer.name
        };
        
    } catch (error) {
        console.error(`Error stopping bot ${botName}:`, error);
        return { success: false, message: error.message };
    }
}

// Get bot status
function getBotStatus(botName) {
    const isRunning = activeBots.has(botName);
    const bots = loadBots();
    const botData = bots[botName];
    
    return {
        name: botName,
        connected: isRunning,
        server: botData?.server || currentServerId,
        server_name: currentServer.name,
        login_type: botData?.login_type || 'unknown',
        player_username: botData?.player_username || '',
        created: botData?.created || ''
    };
}

// Get all bots status
function getAllBotsStatus() {
    const bots = loadBots();
    const status = {};
    
    for (const [botName, botData] of Object.entries(bots)) {
        status[botName] = getBotStatus(botName);
    }
    
    return status;
}

// Get available servers
function getAvailableServers() {
    return BOT_SERVERS.map(server => ({
        id: server.id,
        name: server.name,
        port: server.port,
        current: server.id === currentServerId
    }));
}

// Load bots from memory (synced from web server)
function loadBots() {
    return botData || {};
}

// Save bots to memory (will be synced to web server)
function saveBots(bots) {
    botData = bots;
    return true;
}

// Health check endpoint for Render
const http = require('http');
const healthServer = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            server: currentServer.name,
            server_id: currentServerId,
            port: currentServer.port,
            activeBots: activeBots.size,
            timestamp: new Date().toISOString()
        }));
    } else if (req.url.startsWith('/api/')) {
        // Handle API requests
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const action = req.url.replace('/api/', '');
                
                let result;
                switch (action) {
                    case 'start_bot':
                        // Store bot data if provided
                        if (data.bot_data) {
                            botData[data.bot_name] = data.bot_data;
                            console.log(`Stored bot data for ${data.bot_name}:`, data.bot_data);
                        }
                        result = await startBot(data.bot_name);
                        break;
                    case 'stop_bot':
                        result = await stopBot(data.bot_name);
                        break;
                    case 'get_bot_status':
                        result = { success: true, status: getBotStatus(data.bot_name) };
                        break;
                    case 'get_all_bots_status':
                        result = { success: true, bots: getAllBotsStatus() };
                        break;
                    case 'get_servers':
                        result = { success: true, servers: getAvailableServers() };
                        break;
                    case 'sync_bots':
                        // Sync bot data from web server
                        const webBots = data.bots || {};
                        botData = webBots;
                        result = { success: true, message: 'Bot data synced' };
                        break;
                    default:
                        result = { success: false, message: 'Unknown action' };
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

healthServer.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});

// WebSocket message handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.action) {
                case 'start_bot':
                    const startResult = await startBot(data.bot_name);
                    ws.send(JSON.stringify({
                        action: 'start_bot_response',
                        bot_name: data.bot_name,
                        ...startResult
                    }));
                    break;
                    
                case 'stop_bot':
                    const stopResult = await stopBot(data.bot_name);
                    ws.send(JSON.stringify({
                        action: 'stop_bot_response',
                        bot_name: data.bot_name,
                        ...stopResult
                    }));
                    break;
                    
                case 'get_bot_status':
                    const status = getBotStatus(data.bot_name);
                    ws.send(JSON.stringify({
                        action: 'bot_status_response',
                        bot_name: data.bot_name,
                        status: status
                    }));
                    break;
                    
                case 'get_all_bots_status':
                    const allStatus = getAllBotsStatus();
                    ws.send(JSON.stringify({
                        action: 'all_bots_status_response',
                        bots: allStatus
                    }));
                    break;
                    
                case 'get_servers':
                    const servers = getAvailableServers();
                    ws.send(JSON.stringify({
                        action: 'servers_response',
                        servers: servers
                    }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({
                        action: 'error',
                        message: 'Unknown action'
                    }));
            }
            
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                action: 'error',
                message: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down bot manager...');
    
    // Stop all active bots
    for (const [botName, bot] of activeBots) {
        try {
            await bot.disconnect();
            console.log(`Bot ${botName} disconnected`);
        } catch (error) {
            console.error(`Error disconnecting bot ${botName}:`, error);
        }
    }
    
    wss.close();
    process.exit(0);
});

module.exports = {
    startBot,
    stopBot,
    getBotStatus,
    getAllBotsStatus,
    getAvailableServers
}; 