// Konfigurasi Misi
const CONFIG = {
    daily: [
        { id: 'd1', title: 'The Scribe', desc: 'Tulis 5 kalimat Jepang', xp: 20 },
        { id: 'd2', title: 'The Memorizer', desc: 'Hafal 3 Kanji baru', xp: 30 },
        { id: 'd3', title: 'Echo Chamber', desc: 'Listening 10 menit', xp: 15 },
        { id: 'd4', title: 'The Solver', desc: 'Kerjakan 5 soal', xp: 25 }
    ],
    weekly: [
        { id: 'w1', title: 'Weekly Raid: Kanji', desc: 'Hafal 20 Kanji baru', xp: 150 },
        { id: 'w2', title: 'The Architect', desc: 'Tulis 1 paragraf cerita', xp: 100 },
        { id: 'w3', title: 'Loyalty Bonus', desc: 'Belajar 5 hari dalam seminggu', xp: 200 }
    ],
    ranks: [
        { min: 0, title: 'VILLAGER' },
        { min: 300, title: 'STUDENT' },
        { min: 1000, title: 'RONIN' },
        { min: 2500, title: 'SAMURAI' },
        { min: 5000, title: 'SHOGUN' }
    ]
};

// State Management
let state = JSON.parse(localStorage.getItem('shogun_data')) || {
    xp: 0,
    dailyDone: [],
    weeklyDone: [],
    lastDailyDate: new Date().toDateString(),
    lastWeeklyDate: getMonday(new Date()).toDateString()
};

function getMonday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function init() {
    checkAutoResets();
    updateTimers();
    setInterval(updateTimers, 60000); // Update tiap menit
    render();
}

function checkAutoResets() {
    const now = new Date();
    // Daily Reset
    if (state.lastDailyDate !== now.toDateString()) {
        state.dailyDone = [];
        state.lastDailyDate = now.toDateString();
    }
    // Weekly Reset (Senin)
    if (state.lastWeeklyDate !== getMonday(now).toDateString()) {
        state.weeklyDone = [];
        state.lastWeeklyDate = getMonday(now).toDateString();
    }
    save();
}

function updateTimers() {
    const now = new Date();
    // Daily
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diffD = tomorrow - now;
    document.getElementById('daily-timer').innerText = `Resets in: ${Math.floor(diffD/3600000)}h ${Math.floor((diffD%3600000)/60000)}m`;
    
    // Weekly
    const nextMon = new Date(getMonday(now));
    nextMon.setDate(nextMon.getDate() + 7);
    const diffW = nextMon - now;
    document.getElementById('weekly-timer').innerText = `${Math.floor(diffW/86400000)} Days left`;
}

function render() {
    document.getElementById('xp-val').innerText = state.xp;
    
    // Rank & Bar
    const currentRank = [...CONFIG.ranks].reverse().find(r => state.xp >= r.min);
    document.getElementById('rank-title').innerText = currentRank.title;
    const progress = ((state.xp % 500) / 500) * 100;
    document.getElementById('xp-progress').style.width = progress + '%';

    // Containers
    renderList('daily-container', CONFIG.daily, state.dailyDone, 'daily');
    renderList('weekly-container', CONFIG.weekly, state.weeklyDone, 'weekly');
}

function renderList(containerId, data, completedList, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = data.map(q => {
        const isDone = completedList.includes(q.id);
        return `
            <div class="quest-card ${isDone ? 'completed' : ''}">
                <div class="quest-info">
                    <h4>${q.title}</h4>
                    <p>${q.desc} (+${q.xp} XP)</p>
                </div>
                <button class="btn-claim" 
                    onclick="toggleQuest('${q.id}', ${q.xp}, '${type}')"
                    style="background: ${isDone ? 'var(--danger)' : 'var(--primary)'}; color: ${isDone ? 'white' : 'black'}">
                    ${isDone ? 'UNDO' : 'GO'}
                </button>
            </div>
        `;
    }).join('');
}

window.toggleQuest = function(id, xp, type) {
    const list = type === 'daily' ? state.dailyDone : state.weeklyDone;
    const idx = list.indexOf(id);

    if (idx > -1) {
        state.xp -= xp;
        list.splice(idx, 1);
    } else {
        state.xp += xp;
        list.push(id);
        if(state.xp % 500 < xp) showLevelUp();
    }
    save();
    render();
};

function showLevelUp() {
    const t = document.getElementById('toast');
    t.style.top = '20px';
    setTimeout(() => t.style.top = '-100px', 3000);
}

window.resetProgress = function() {
    if(confirm("Reset misi hari ini? XP tetap aman.")) {
        state.dailyDone = [];
        save();
        render();
    }
};

window.resetAllXP = function() {
    if(confirm("HAPUS SEMUA DATA XP & RANK?") && confirm("Benar-benar yakin?")) {
        state = {
            xp: 0,
            dailyDone: [],
            weeklyDone: [],
            lastDailyDate: new Date().toDateString(),
            lastWeeklyDate: getMonday(new Date()).toDateString()
        };
        save();
        render();
    }
};

function save() { localStorage.setItem('shogun_data', JSON.stringify(state)); }

init();