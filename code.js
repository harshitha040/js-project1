const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
let timeData = JSON.parse(localStorage.getItem('timetableTimes')) || {};
let scheduleData = JSON.parse(localStorage.getItem('modernSchedule')) || {};

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = (Math.random() * 6 + 2) + 'px';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

function initGrid() {
    const grid = document.getElementById('scheduleGrid');
    grid.innerHTML = '';

    grid.innerHTML += '<div class="header-cell corner-cell">📅</div>';

    for (let i = 0; i < 12; i++) {
        const defaultTime = `0${i + 8}:00`.slice(-5);
        const timeKey = `time_${i}`;
        grid.innerHTML += `
            <div class="header-cell time-header" data-time-key="${timeKey}">
                <input type="time" class="time-input-cell" 
                       value="${timeData[timeKey] || defaultTime}" 
                       onchange="updateTime('${timeKey}', this.value)">
            </div>
        `;
    }

    days.forEach((day, dayIndex) => {
        const row = 2 + dayIndex;
        grid.innerHTML += `
            <div class="header-cell day-header" style="grid-row: ${row}">📌 ${day.charAt(0).toUpperCase() + day.slice(1)}</div>
        `;
        
        for (let i = 0; i < 12; i++) {
            const timeKey = `time_${i}`;
            const cell = document.createElement('div');
            cell.className = 'schedule-cell';
            cell.dataset.day = day;
            cell.dataset.timeKey = timeKey;
            cell.style.gridRow = row;
            cell.style.gridColumn = 2 + i;
            cell.onclick = () => editCell(day, timeKey);
            cell.innerHTML = '<div class="empty-cell-text">Click to add</div>';
            grid.appendChild(cell);
        }
    });

    renderSchedule();
    setupDragDrop();
}

function updateTime(timeKey, timeValue) {
    timeData[timeKey] = timeValue;
    localStorage.setItem('timetableTimes', JSON.stringify(timeData));
    updateTimeSelect();
}

function updateTimeSelect() {
    const timeSelect = document.getElementById('timeSelect');
    for (let i = 0; i < 12; i++) {
        const option = timeSelect.querySelector(`[value="time_${i}"]`);
        const timeKey = `time_${i}`;
        if (option && timeData[timeKey]) {
            const [hours, minutes] = timeData[timeKey].split(':');
            const nextHour = parseInt(hours) + 1;
            option.textContent = `${timeData[timeKey]} - ${nextHour.toString().padStart(2, '0')}:00`;
        }
    }
}

function renderSchedule() {
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        const day = cell.dataset.day;
        const timeKey = cell.dataset.timeKey;
        const key = `${day}_${timeKey}`;
        
        if (scheduleData[key]) {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.draggable = true;
            item.innerHTML = `
                ${scheduleData[key]}
                <span onclick="deleteItem('${key}', event)">✕</span>
            `;
            cell.innerHTML = '';
            cell.appendChild(item);
        } else {
            cell.innerHTML = '<div class="empty-cell-text">Click to add</div>';
        }
    });
}

function addSchedule() {
    const subject = document.getElementById('subjectInput').value.trim();
    const day = document.getElementById('daySelect').value;
    const timeKey = document.getElementById('timeSelect').value;

    if (!subject) {
        alert('🎯 Please enter a subject!');
        return;
    }

    const key = `${day}_${timeKey}`;
    scheduleData[key] = subject;
    localStorage.setItem('modernSchedule', JSON.stringify(scheduleData));
    renderSchedule();
    document.getElementById('subjectInput').value = '';
    
    const btn = event.target;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = '', 150);
}

function editCell(day, timeKey) {
    const key = `${day}_${timeKey}`;
    const currentTime = timeData[timeKey];
    const subject = prompt(`⏰ Time: ${currentTime}\n📝 Enter subject:`, scheduleData[key] || '');
    if (subject && subject.trim()) {
        scheduleData[key] = subject.trim();
    } else if (!subject) {
        delete scheduleData[key];
    }
    localStorage.setItem('modernSchedule', JSON.stringify(scheduleData));
    renderSchedule();
}

function deleteItem(key, e) {
    e.stopPropagation();
    const item = e.target.parentElement;
    item.style.transform = 'scale(0.5) rotate(180deg)';
    item.style.opacity = '0';
    setTimeout(() => {
        delete scheduleData[key];
        localStorage.setItem('modernSchedule', JSON.stringify(scheduleData));
        renderSchedule();
    }, 300);
}

function clearAll() {
    if (confirm('🗑️ Clear all schedules? This cannot be undone!')) {
        scheduleData = {};
        localStorage.removeItem('modernSchedule');
        renderSchedule();
    }
}

function printSchedule() {
    window.print();
}

function setupDragDrop() {
    document.removeEventListener('dragstart', handleDragStart);
    document.removeEventListener('dragend', handleDragEnd);
    document.removeEventListener('dragover', handleDragOver);
    document.removeEventListener('drop', handleDrop);

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    if (e.target.classList.contains('schedule-item')) {
        e.dataTransfer.setData('text/plain', e.target.parentElement.dataset.day + '_' + e.target.parentElement.dataset.timeKey);
        e.target.style.opacity = '0.7';
        e.target.style.transform = 'rotate(5deg) scale(1.05)';
        createDragParticles(e.clientX, e.clientY);
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('schedule-item')) {
        e.target.style.opacity = '1';
        e.target.style.transform = '';
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const [day, timeKey] = e.dataTransfer.getData('text/plain').split('_');
    const targetCell = e.target.closest('.schedule-cell');
    if (targetCell && targetCell.dataset.day !== day) {
        const oldKey = `${day}_${timeKey}`;
        const newKey = `${targetCell.dataset.day}_${targetCell.dataset.timeKey}`;
        scheduleData[newKey] = scheduleData[oldKey];
        delete scheduleData[oldKey];
        localStorage.setItem('modernSchedule', JSON.stringify(scheduleData));
        renderSchedule();
        createDropParticles(e.clientX, e.clientY);
    }
}

function createDragParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px; height: 6px;
                background: radial-gradient(circle, #667eea, transparent);
                border-radius: 50%;
                left: ${x}px; top: ${y}px;
                pointer-events: none;
                z-index: 1000;
                animation: dragParticle 1s ease-out forwards;
            `;
            particle.style.setProperty('--dx', (Math.random() - 0.5) * 100 + 'px');
            particle.style.setProperty('--dy', (Math.random() - 0.5) * 100 + 'px');
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 50);
    }
}

function createDropParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px; height: 4px;
                background: radial-gradient(circle, #f093fb, transparent);
                border-radius: 50%;
                left: ${x}px; top: ${y}px;
                pointer-events: none;
                z-index: 1000;
                animation: dropParticle 0.8s ease-out forwards;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 800);
        }, i * 30);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes dragParticle {
        to { transform: translate(var(--dx), var(--dy)); opacity: 0; }
    }
    @keyframes dropParticle {
        to { transform: translateY(50px) scale(0); opacity: 0; }
    }
`;
document.head.appendChild(style);

window.onload = function() {
    createParticles();
    initGrid();
    updateTimeSelect();
};
