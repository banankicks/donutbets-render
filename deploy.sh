#!/bin/bash

echo "🚀 Deploying DonutBets Render Bots..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the renderbots directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    
    echo "🔗 Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/donutbets-renderbots.git"
    echo "git push -u origin main"
    echo ""
    echo "Then manually create 5 Web Services on Render Dashboard"
    exit 0
fi

# Check if remote is set
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ Error: No remote repository set!"
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/donutbets-renderbots.git"
    exit 1
fi

# Deploy to Render
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Auto deploy $(date)"
git push origin main

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "🔧 Next Steps - Manual Service Creation:"
echo ""
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Create 5 Web Services manually:"
echo ""
echo "   Service 1:"
echo "   - Name: donutbets-bot-1"
echo "   - Build Command: npm install"
echo "   - Start Command: PORT_INDEX=0 node bot-manager.js"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT_INDEX=0"
echo "     MINECRAFT_HOST=donutsmp.net"
echo "     MINECRAFT_PORT=25565"
echo ""
echo "   Service 2:"
echo "   - Name: donutbets-bot-2"
echo "   - Build Command: npm install"
echo "   - Start Command: PORT_INDEX=1 node bot-manager.js"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT_INDEX=1"
echo "     MINECRAFT_HOST=donutsmp.net"
echo "     MINECRAFT_PORT=25565"
echo ""
echo "   Service 3:"
echo "   - Name: donutbets-bot-3"
echo "   - Build Command: npm install"
echo "   - Start Command: PORT_INDEX=2 node bot-manager.js"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT_INDEX=2"
echo "     MINECRAFT_HOST=donutsmp.net"
echo "     MINECRAFT_PORT=25565"
echo ""
echo "   Service 4:"
echo "   - Name: donutbets-bot-4"
echo "   - Build Command: npm install"
echo "   - Start Command: PORT_INDEX=3 node bot-manager.js"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT_INDEX=3"
echo "     MINECRAFT_HOST=donutsmp.net"
echo "     MINECRAFT_PORT=25565"
echo ""
echo "   Service 5:"
echo "   - Name: donutbets-bot-5"
echo "   - Build Command: npm install"
echo "   - Start Command: PORT_INDEX=4 node bot-manager.js"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT_INDEX=4"
echo "     MINECRAFT_HOST=donutsmp.net"
echo "     MINECRAFT_PORT=25565"
echo ""
echo "🌐 Bot Server URLs (after deploy):"
echo "  https://donutbets-bot-1.onrender.com"
echo "  https://donutbets-bot-2.onrender.com"
echo "  https://donutbets-bot-3.onrender.com"
echo "  https://donutbets-bot-4.onrender.com"
echo "  https://donutbets-bot-5.onrender.com"
echo ""
echo "📊 Monitor deployment at:"
echo "  https://dashboard.render.com"
echo ""
echo "🎯 Test commands:"
echo "  curl https://donutbets-bot-1.onrender.com/health"
echo "  curl -X POST https://donutbets-bot-1.onrender.com/api/start_bot \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"bot_name\":\"test_bot\"}'"
echo ""
echo "🔗 Weboldal config.php frissítése:"
echo "  define('BOT_SERVERS', ["
echo "    ['host' => 'donutbets-bot-1.onrender.com', 'port' => 443],"
echo "    ['host' => 'donutbets-bot-2.onrender.com', 'port' => 443],"
echo "    ['host' => 'donutbets-bot-3.onrender.com', 'port' => 443],"
echo "    ['host' => 'donutbets-bot-4.onrender.com', 'port' => 443],"
echo "    ['host' => 'donutbets-bot-5.onrender.com', 'port' => 443]"
echo "  ]);"
echo ""
echo "⚠️  Note: Blueprint is paid feature, so we create services manually!" 