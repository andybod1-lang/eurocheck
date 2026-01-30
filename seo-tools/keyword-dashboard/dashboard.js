// Keyword Tracking Dashboard - EuroCheck SEO Tools
// Stores data in localStorage, uses Chart.js for visualization

const STORAGE_KEY = 'eurocheck_keyword_data';

// Sample data for initial load
const SAMPLE_DATA = [
    {
        keyword: 'eurocheck extension',
        history: [15, 12, 10, 8, 9, 7, 6],
        dates: generateLast7Days()
    },
    {
        keyword: 'euro price tracker',
        history: [25, 22, 20, 18, 15, 14, 12],
        dates: generateLast7Days()
    },
    {
        keyword: 'currency converter chrome',
        history: [45, 42, 38, 35, 33, 30, 28],
        dates: generateLast7Days()
    },
    {
        keyword: 'eu price comparison',
        history: [60, 55, 52, 48, 45, 42, 40],
        dates: generateLast7Days()
    },
    {
        keyword: 'shopping price euro',
        history: [80, 75, 70, 68, 65, 60, 55],
        dates: generateLast7Days()
    }
];

// Generate last 7 days as date strings
function generateLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

// State
let keywords = [];
let historyChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderTable();
    renderChart();
    updateStats();
    setupEventListeners();
    loadThemePreference();
});

// Load data from localStorage or use sample
function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        keywords = JSON.parse(stored);
    } else {
        keywords = SAMPLE_DATA;
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
}

// Render the keywords table
function renderTable() {
    const tbody = document.getElementById('keywordsBody');
    
    if (keywords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No keywords tracked yet. Add your first keyword above!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = keywords.map((kw, index) => {
        const current = kw.history[kw.history.length - 1];
        const previous = kw.history.length > 1 ? kw.history[kw.history.length - 2] : current;
        const change = previous - current; // Positive = improved (lower rank is better)
        
        let changeClass = 'change-neutral';
        let changeIcon = '→';
        if (change > 0) {
            changeClass = 'change-positive';
            changeIcon = '↑';
        } else if (change < 0) {
            changeClass = 'change-negative';
            changeIcon = '↓';
        }

        return `
            <tr>
                <td><strong>${escapeHtml(kw.keyword)}</strong></td>
                <td>#${current}</td>
                <td>${previous !== current ? '#' + previous : '-'}</td>
                <td class="${changeClass}">
                    ${changeIcon} ${Math.abs(change) > 0 ? Math.abs(change) : '-'}
                </td>
                <td>
                    <canvas class="sparkline" id="spark-${index}"></canvas>
                </td>
                <td>
                    <button class="btn btn-secondary update-btn" onclick="updatePosition(${index})">
                        📝
                    </button>
                    <button class="btn btn-danger update-btn" onclick="removeKeyword(${index})">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render sparklines
    keywords.forEach((kw, index) => {
        renderSparkline(index, kw.history);
    });
}

// Render sparkline mini chart
function renderSparkline(index, history) {
    const canvas = document.getElementById(`spark-${index}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 80;
    const height = 30;
    canvas.width = width;
    canvas.height = height;

    if (history.length < 2) return;

    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = history[history.length - 1] < history[0] ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2;

    history.forEach((val, i) => {
        const x = (i / (history.length - 1)) * width;
        // Invert Y since lower rank = better = higher on chart
        const y = height - ((max - val) / range) * (height - 4) - 2;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

// Render main history chart
function renderChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    const datasets = keywords.slice(0, 5).map((kw, index) => {
        const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
        return {
            label: kw.keyword,
            data: kw.history,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            tension: 0.3,
            fill: false
        };
    });

    const labels = keywords.length > 0 ? keywords[0].dates : generateLast7Days();

    if (historyChart) {
        historyChart.destroy();
    }

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: #${context.parsed.y}`
                    }
                }
            },
            scales: {
                y: {
                    reverse: true, // Lower rank = better, so flip the axis
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Position (lower is better)'
                    }
                }
            }
        }
    });
}

// Update stats
function updateStats() {
    const total = keywords.length;
    document.getElementById('totalKeywords').textContent = total;

    if (total === 0) {
        document.getElementById('avgPosition').textContent = '-';
        document.getElementById('improvedCount').textContent = '0';
        document.getElementById('declinedCount').textContent = '0';
        return;
    }

    const currentPositions = keywords.map(kw => kw.history[kw.history.length - 1]);
    const avg = Math.round(currentPositions.reduce((a, b) => a + b, 0) / total);
    document.getElementById('avgPosition').textContent = `#${avg}`;

    let improved = 0, declined = 0;
    keywords.forEach(kw => {
        if (kw.history.length > 1) {
            const current = kw.history[kw.history.length - 1];
            const previous = kw.history[kw.history.length - 2];
            if (current < previous) improved++;
            else if (current > previous) declined++;
        }
    });

    document.getElementById('improvedCount').textContent = improved;
    document.getElementById('declinedCount').textContent = declined;
}

// Setup event listeners
function setupEventListeners() {
    // Add keyword form
    document.getElementById('addKeywordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = document.getElementById('keywordInput').value.trim();
        const position = parseInt(document.getElementById('positionInput').value);

        if (keyword && position) {
            addKeyword(keyword, position);
            document.getElementById('keywordInput').value = '';
            document.getElementById('positionInput').value = '';
        }
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // Import
    document.getElementById('importFile').addEventListener('change', importData);
}

// Add new keyword
function addKeyword(keyword, position) {
    // Check if keyword already exists
    const existing = keywords.find(kw => kw.keyword.toLowerCase() === keyword.toLowerCase());
    if (existing) {
        alert('Keyword already exists! Use the update button to change its position.');
        return;
    }

    keywords.push({
        keyword: keyword,
        history: [position],
        dates: [new Date().toISOString().split('T')[0]]
    });

    saveData();
    renderTable();
    renderChart();
    updateStats();
}

// Update keyword position
function updatePosition(index) {
    const newPosition = prompt(`Enter new position for "${keywords[index].keyword}":`, 
        keywords[index].history[keywords[index].history.length - 1]);
    
    if (newPosition && !isNaN(parseInt(newPosition))) {
        const pos = parseInt(newPosition);
        const today = new Date().toISOString().split('T')[0];
        
        // If last entry was today, update it; otherwise add new entry
        if (keywords[index].dates[keywords[index].dates.length - 1] === today) {
            keywords[index].history[keywords[index].history.length - 1] = pos;
        } else {
            keywords[index].history.push(pos);
            keywords[index].dates.push(today);
            
            // Keep only last 30 days
            if (keywords[index].history.length > 30) {
                keywords[index].history.shift();
                keywords[index].dates.shift();
            }
        }

        saveData();
        renderTable();
        renderChart();
        updateStats();
    }
}

// Remove keyword
function removeKeyword(index) {
    if (confirm(`Remove keyword "${keywords[index].keyword}"?`)) {
        keywords.splice(index, 1);
        saveData();
        renderTable();
        renderChart();
        updateStats();
    }
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('eurocheck_theme', isDark ? 'dark' : 'light');
    document.getElementById('themeToggle').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    // Redraw chart with updated colors
    renderChart();
}

function loadThemePreference() {
    const theme = localStorage.getItem('eurocheck_theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeToggle').textContent = '☀️ Light Mode';
    }
}

// Export data as JSON
function exportData() {
    const data = JSON.stringify(keywords, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-rankings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                if (confirm(`Import ${imported.length} keywords? This will replace existing data.`)) {
                    keywords = imported;
                    saveData();
                    renderTable();
                    renderChart();
                    updateStats();
                }
            } else {
                alert('Invalid file format. Expected an array of keywords.');
            }
        } catch (err) {
            alert('Error parsing JSON file: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
