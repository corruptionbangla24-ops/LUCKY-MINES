const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটোকল লক]
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 🔄 অ্যাক্টিভ গেম সেশন ট্র্যাকার মেমোরি পুল ভাই ভাই
const activeMinesGamesPool = new Map();

// 💰 মাইনস ডায়নামিক গুণিতক ওডস ম্যাট্রিক্স জেনারেটর ফাংশন চাবি (৯৫% RTP সুষম বর্ম লক ভাই ভাই)
function getMinesMultiplierMultiplier(totalMines, revealedDiamondsCount) {
    const totalCells = 25;
    let currentMultiplier = 1.0;
    
    for (let i = 0; i < revealedDiamondsCount; i++) {
        let availableCells = totalCells - i;
        let diamondCells = availableCells - totalMines;
        if (diamondCells <= 0) break;
        currentMultiplier = currentMultiplier * (availableCells / diamondCells);
    }
    // ৯৫% হাউস প্রফিট ও আরটিপি ব্যালেন্সড স্কেলিং চাবি
    return currentMultiplier * 0.95;
}

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/mines-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok" && response.data.balance !== undefined) {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. বাজি ধরে মাইনস গেম স্টার্ট করার Core API রাউট (POST - ২০০০০ লিমিট লক ভাই ভাই!)
app.post('/api/mines-start', async (req, res) => {
    const { userId, amount, wallet, mines } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const requestedMines = parseInt(mines) || 3;

    // 🔒 [বেট সিকিউরিটি ফিল্টার]: বাজি ১ টাকার কম বা ২০০০০ টাকার বেশি হলে ব্যাকএন্ড ডিরেক্ট ব্লক ভাই ভাই!
    if (reqAmount < 1 || reqAmount > 20000 || requestedMines < 1 || requestedMines > 24) {
        return res.json({ success: false, message: "🚨 Invalid Parameters (৳১ - ৳২০০০০, ১-২৪ 💣)" });
    }

    try {
        // 🔒 [ব্যালেন্স যাচাই প্রোটোকল]
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balResponse.data && balResponse.data.status === "ok" && balResponse.data.balance !== undefined) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            return res.json({ success: false, balance: 0, message: "❌ Database Sync Error! Please refresh." });
        }

        // 🔒 [ইনসাফিসিয়েন্ট প্রোটেকশন বর্ম]
        if (currentDbBalance < reqAmount) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge BDT." });
        }

        // 💣 ২৫টি ঘরের গ্রিডে বোমাগুলোর পজিশন র্যান্ডমাইজেশন লুপ
        const minesPositions = [];
        while (minesPositions.length < requestedMines) {
            let pos = Math.floor(Math.random() * 25);
            if (!minesPositions.includes(pos)) {
                minesPositions.push(pos);
            }
        }

        // ডাটাবেজে টাকা ডেবিট করার জন্য পিএইচপি এপিআই ফায়ার ভাই ভাই
        const debitResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: reqAmount,
            wallet: targetWallet
        }, { timeout: 30000 });

        if (debitResponse.data && debitResponse.data.status === "ok") {
            const token = crypto.randomBytes(16).toString('hex');
            
            // গেম সেশন ডাটা মেমরিতে সেভ লক ভাই ভাই
            activeMinesGamesPool.set(token, {
                userId,
                wallet: targetWallet,
                betAmount: reqAmount,
                totalMines: requestedMines,
                minesPositions,
                revealedCells: [],
                status: "active"
            });

            io.emit("balanceUpdate", { username: userId, balance: debitResponse.data.balance });

            return res.json({
                success: true,
                balance: debitResponse.data.balance,
                token: token,
                nextMultiplier: getMinesMultiplierMultiplier(requestedMines, 1)
            });
        } else {
            return res.json({ success: false, message: "❌ Bet Declined by Database!" });
        }
    } catch (e) {
        return res.json({ success: false, message: "⚠️ Timeout! Try again." });
    }
});

// 💎 ৩. স্লট ঘরে ক্লিকের ডাইনামিক রিভিল রাউট (POST Route)
app.post('/api/mines-reveal', (req, res) => {
    const { token, index } = req.body;
    const game = activeMinesGamesPool.get(token);

    if (!game || game.status !== "active" || game.revealedCells.includes(index)) {
        return res.json({ success: false, message: "🚨 Invalid Game Move!" });
    }

    game.revealedCells.push(index);

    // 🔍 চেক ১: প্লেয়ার বোমায় পা দিয়েছে কি না (ব্লাস্ট মেকানিজম ভাই ভাই)
    if (game.minesPositions.includes(index)) {
        game.status = "lost";
        activeMinesGamesPool.delete(token); // সেশন কিল
        return res.json({
            success: true,
            status: "blast",
            minesPositions: game.minesPositions
        });
    }

    // 🔍 চেক ২: ডায়মন্ড মিলেছে সাকসেস ভাই ভাই
    const currentDiamondsRevealed = game.revealedCells.length;
    const currentMult = getMinesMultiplierMultiplier(game.totalMines, currentDiamondsRevealed);
    const nextMult = getMinesMultiplierMultiplier(game.totalMines, currentDiamondsRevealed + 1);
    const currentWinAmount = game.betAmount * currentMult;

    // যদি প্লেয়ার সব ডায়মন্ড খুঁজে বের করে ফেলে তবে অটো ক্যাশআউট ভাই ভাই
    if (currentDiamondsRevealed === (25 - game.totalMines)) {
        game.status = "completed";
        return res.json({
            success: true,
            status: "diamond",
            currentWin: currentWinAmount,
            nextMultiplier: nextMult,
            autoCashout: true
        });
    }

    return res.json({
        success: true,
        status: "diamond",
        currentWin: currentWinAmount,
        nextMultiplier: nextMult
    });
});

// 💰 ৪. ক্যাশআউট মেরে মেইন ওয়ালেটে টাকা প্লাস করার চূড়ান্ত কোর রাউট (POST Route)
app.post('/api/mines-cashout', async (req, res) => {
    const { token } = req.body;
    const game = activeMinesGamesPool.get(token);

    if (!game || game.status !== "active") {
        return res.json({ success: false, message: "🚨 Game session already closed!" });
    }

    const currentDiamondsRevealed = game.revealedCells.length;
    if (currentDiamondsRevealed === 0) {
        return res.json({ success: false, message: "🚨 Reveal at least 1 diamond first!" });
    }

    game.status = "cashout";
    const finalMult = getMinesMultiplierMultiplier(game.totalMines, currentDiamondsRevealed);
    const finalWinAmount = Math.round(game.betAmount * finalMult); // রাউন্ডিং বুস্টার ভাই ভাই

    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "win",
            username: game.userId,
            amount: parseFloat(finalWinAmount),
            wallet: game.wallet,
            bet_amount: game.betAmount,
            multiplier: finalMult.toFixed(2),
            status: "win",
            type: "win",
            is_win: 1
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            activeMinesGamesPool.delete(token); // মেমোরি সাফ
            io.emit("balanceUpdate", { username: game.userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                winAmount: finalWinAmount,
                minesPositions: game.minesPositions
            });
        } else {
            return res.json({ success: false, message: "❌ Cashout Declined by Database!" });
        }
    } catch (e) {
        game.status = "active"; // রোলব্যাক সিকিউরিটি
        return res.json({ success: false, message: "⚠️ Timeout! Click CASH OUT again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => { console.log("Player connected to Royal Lucky Mines Engine!"); });

// লাকি মাইনস গেম স্বতন্ত্র পোর্টে কড়া নিয়নে অন ফায়ার ভাই ভাই!
const PORT = process.env.PORT || 16000; 
server.listen(PORT, () => { console.log(`🎡 Lucky Mines Engine Running on port ${PORT}`); });
