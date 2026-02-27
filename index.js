
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = '01';
const charArray = chars.split('');
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = window.matrixColor || '#33D7FF';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 35);
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function openLesson(title, url) {
    const cacheBustUrl = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
    document.getElementById('lessonTitle').textContent = title;
    document.getElementById('lessonFrame').src = cacheBustUrl;
    document.getElementById('lessonPage').classList.add('active');
    document.getElementById('main-container').classList.add('slide-down');
}

function openLessonFromCDN(title, url) {
    document.getElementById('lessonTitle').textContent = title;
    // Add cache-busting parameter
    const cacheBustUrl = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
    fetch(cacheBustUrl)
        .then(response => response.text())
        .then(html => {
            const iframe = document.getElementById('lessonFrame');
            iframe.srcdoc = html;
        })
        .catch(error => console.error('Error loading content:', error));
    document.getElementById('lessonPage').classList.add('active');
    document.getElementById('main-container').classList.add('slide-down');
}

function closeLesson() {
    document.getElementById('main-container').classList.remove('slide-down');
    setTimeout(function () {
        document.getElementById('lessonPage').classList.remove('active', 'slide-down');
        document.getElementById('lessonFrame').src = '';
        document.getElementById('lessonFrame').srcdoc = '';
        document.getElementById('lessonFrame').classList.remove('fullscreen');
    }, 500);
}

function toggleFullscreen() {
    const lessonFrame = document.getElementById('lessonFrame');
    const isEnteringFullscreen = !lessonFrame.classList.contains('fullscreen');


    document.getElementById('lessonTitle').textContent

    if (document.fullscreenElement || document.webkitFullscreenElement ||
        document.msFullscreenElement || document.mozFullScreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    } else {
        if (lessonFrame.requestFullscreen) {
            lessonFrame.requestFullscreen();
        } else if (lessonFrame.webkitRequestFullscreen) {
            lessonFrame.webkitRequestFullscreen();
        } else if (lessonFrame.msRequestFullscreen) {
            lessonFrame.msRequestFullscreen();
        } else if (lessonFrame.mozRequestFullScreen) {
            lessonFrame.mozRequestFullScreen();
        }
    }
}

let searchTimer;
document.getElementById('searchInput').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const lessonCards = document.querySelectorAll('#allLessonsGrid .lesson-card');
    let visibleCount = 0;

    lessonCards.forEach(card => {
        const title = card.querySelector('.lesson-title').textContent.toLowerCase();
        const desc = card.querySelector('.lesson-desc').textContent.toLowerCase();
        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const searchStats = document.getElementById('searchStats');
    if (searchTerm.length > 0) {
        searchStats.textContent = `Found ${visibleCount} lesson${visibleCount !== 1 ? 's' : ''} matching "${searchTerm}"`;

        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {

        }, 1000);
    } else {
        searchStats.textContent = '';
    }
});

document.addEventListener('click', function (e) {
    if (e.target.closest('.lesson-card')) {
        const card = e.target.closest('.lesson-card');
        const title = card.querySelector('.lesson-title').textContent;
        const wasFromSearch = document.getElementById('searchInput').value.length > 0;

        if (wasFromSearch) {

        }
    }
});

function hideWarning() {
    document.getElementById('warningOverlay').classList.add('hidden');
}

function switchTab(tabName) {
    document.getElementById('lessonsTab').classList.toggle('active', tabName === 'lessons');
    document.getElementById('partnersTab').classList.toggle('active', tabName === 'partners');
    document.getElementById('lessons-section').style.display = tabName === 'lessons' ? 'block' : 'none';
    document.getElementById('all-lessons').style.display = tabName === 'lessons' ? 'block' : 'none';
    document.getElementById('partners-section').style.display = tabName === 'partners' ? 'block' : 'none';
}

const themes = ['theme-amber', 'theme-rainbow', 'theme-cyber-green', 'theme-ice-blue', 'theme-solarized', 'theme-purple-haze'];
let currentThemeIndex = 0;

function cycleTheme() {

    document.body.classList.remove(themes[currentThemeIndex]);
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    document.body.classList.add(themes[currentThemeIndex]);
    const themeNames = ['Amber', 'Rainbow', 'Cyber Green', 'Ice Blue', 'Solarized', 'Purple Haze'];
    document.getElementById('themeToggle').title = `Current: ${themeNames[currentThemeIndex]} - Click to cycle`;
    updateMatrixColor();
}

function updateMatrixColor() {
    const matrixColors = {
        'theme-amber': '#c27c15',
        'theme-rainbow': '#ff0080',
        'theme-cyber-green': '#00ff00',
        'theme-ice-blue': '#00ccff',
        'theme-solarized': '#2aa198',
        'theme-purple-haze': '#9b59b6'
    };
    window.matrixColor = matrixColors[themes[currentThemeIndex]];
}

document.querySelectorAll('.social-icons a').forEach(link => {
    link.addEventListener('click', function (e) {
        const platform = this.querySelector('i').className.split(' ')[1].replace('fa-', '');
    });
});

let scrollDepthTracked = [25, 50, 75, 90];
window.addEventListener('scroll', function () {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
}, { passive: true });

window.pageLoadTime = Date.now();
window.addEventListener('beforeunload', function () {
});

document.getElementById('themeToggle').addEventListener('click', cycleTheme);
document.body.classList.add('theme-amber');
document.getElementById('themeToggle').title = 'Current: Amber - Click to cycle';
updateMatrixColor();

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const lessonFrame = document.getElementById('lessonFrame');
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement ||
        document.msFullscreenElement || document.mozFullScreenElement;

    if (isFullscreen) {
        lessonFrame.classList.add('fullscreen');
    } else {
        lessonFrame.classList.remove('fullscreen');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const lessonFrame = document.getElementById('lessonFrame');
        if (lessonFrame.classList.contains('fullscreen')) {
            toggleFullscreen();
        }
    }
});