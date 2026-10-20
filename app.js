// ===== Daily Quote Logic =====
const QUOTES = [
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  { text: "People who say it cannot be done are failing to consider the 3 AM version of themselves.", author: "Unknown" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "Get busy living or get busy dying.", author: "Stephen King" },
  { text: "The only impossible journey is the one you give up on before you even get started.", author: "Unknown" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

function getTodaysQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ===== Pomodoro Logic =====
const WORK_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60;  // 5 minutes
const CIRCUMFERENCE = 2 * Math.PI * 89; // r = 89

let timerId;
let timeLeft;
let isRunning = false;
let currentMode = 'work';
let sessionsCompleted = 0;

const minutesEl = document.getElementById('timer-minutes');
const secondsEl = document.getElementById('timer-display');
const ringEl = document.getElementById('timer-ring-progress');
const modeTextEl = document.getElementById('mode-text');
const labelEl = document.getElementById('timer-label');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay() {
  minutesEl.textContent = formatTime(timeLeft);
  const progress = timeLeft / (currentMode === 'work' ? WORK_TIME : BREAK_TIME);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  ringEl.style.strokeDashoffset = dashOffset;
}

function updateModeUI() {
  modeTextEl.textContent = currentMode === 'work' ? 'Work mode' : 'Break mode';
  labelEl.textContent = currentMode === 'work' ? 'Work session' : 'Break time';
  ringEl.className = 'timer-ring-progress ' + currentMode;
  const toggle = document.getElementById('mode-toggle');
  toggle.className = 'mode-toggle ' + currentMode;
}

function switchMode(newMode) {
  clearInterval(timerId);
  currentMode = newMode;
  timeLeft = newMode === 'work' ? WORK_TIME : BREAK_TIME;
  updateDisplay();
  updateModeUI();

  if (isRunning) {
    startTimer();
  }
}

function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      secondsEl.classList.remove('running');

      if (currentMode === 'work') {
        sessionsCompleted++;
        document.getElementById('session-count').textContent = sessionsCompleted;
      } else {
        document.getElementById('completed-count').textContent = sessionsCompleted;
      }

      const alarm = document.getElementById('alarm-sound');
      alarm.currentTime = 0;
      alarm.play().catch(() => {});

      const newMode = currentMode === 'work' ? 'break' : 'work';
      switchMode(newMode);
    }
  }, 1000);
}

function loadState() {
  try {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      const state = JSON.parse(saved);
      timeLeft = state.timeLeft ?? WORK_TIME;
      currentMode = state.currentMode ?? 'work';
      sessionsCompleted = state.sessionsCompleted ?? 0;

      updateDisplay();
      updateModeUI();

      document.getElementById('session-count').textContent = sessionsCompleted;
      document.getElementById('completed-count').textContent = sessionsCompleted;

      if (state.isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        secondsEl.classList.add('running');
        startTimer();
      }
    }
  } catch (e) {
    timeLeft = WORK_TIME;
  }
}

function saveState() {
  const state = {
    timeLeft,
    currentMode,
    isRunning,
    sessionsCompleted
  };
  localStorage.setItem('pomodoroState', JSON.stringify(state));
}

// ===== Daily Quote Display =====
function displayQuote() {
  const quote = getTodaysQuote();
  const storedDate = localStorage.getItem('quoteDate');
  const todayStr = new Date().toDateString();

  let quoteObj = quote;
  if (storedDate === todayStr) {
    const storedQuote = localStorage.getItem('quoteOfTheDay');
    if (storedQuote) {
      try { quoteObj = JSON.parse(storedQuote); } catch (e) { /* fallback */ }
    }
  } else {
    localStorage.setItem('quoteDate', todayStr);
    localStorage.setItem('quoteOfTheDay', JSON.stringify(quote));
  }

  document.getElementById('quote-text').textContent = `"${quoteObj.text}"`;
  document.getElementById('quote-author').textContent = `— ${quoteObj.author}`;
}

// ===== Event Listeners =====
startBtn.addEventListener('click', () => {
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  secondsEl.classList.add('running');
  startTimer();
  saveState();
});

pauseBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(timerId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  secondsEl.classList.remove('running');
  saveState();
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerId);
  isRunning = false;
  switchMode(currentMode);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  secondsEl.classList.remove('running');
  saveState();
});

document.getElementById('mode-toggle').addEventListener('click', () => {
  const newMode = currentMode === 'work' ? 'break' : 'work';
  switchMode(newMode);
  saveState();
});

setInterval(() => {
  if (isRunning) saveState();
}, 1000);

// ===== Initialize =====
displayQuote();
loadState();
