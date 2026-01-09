/**
 * Finger Counting Fun - Game Logic
 * Kinetic English Educational Game
 * 
 * This file contains all the game logic, hand generation,
 * scoring system, and user interaction handling.
 */

// =============================================================================
// GAME CONFIGURATION AND STATE
// =============================================================================

// Default configuration for the game
const defaultConfig = {
  game_title: "🖐️ Finger Counting Fun! 🖐️",
  correct_message: "Great job!",
  wrong_message: "Try again!",
  background_color: "#FEF3C7",
  surface_color: "#FFFFFF",
  text_color: "#78350F",
  primary_action_color: "#F59E0B",
  secondary_action_color: "#10B981"
};

// Game state variables
let currentNumber = 1;
let score = 0;
let streak = 0;
let answered = false;
let timerInterval = null;
let timeLeft = 15;
const TIMER_DURATION = 15;
let usedNumbers = new Set(); // Track used numbers to avoid repetition

// Number words for display
const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

// =============================================================================
// HAND GENERATION FUNCTIONS
// =============================================================================

/**
 * Generates SVG representation of a hand with specified number of fingers
 * @param {number} fingers - Number of fingers to show (1-5)
 * @param {boolean} isLeft - Whether this is a left hand (flipped)
 * @returns {string} SVG HTML string
 */
function generateHandSVG(fingers, isLeft = false) {
  const width = 140;
  const height = 180;
  
  // Finger configurations for better visualization
  const fingerConfigs = {
    1: [false, true, false, false, false],   // index finger only
    2: [false, true, true, false, false],    // index + middle
    3: [false, true, true, true, false],     // index + middle + ring
    4: [false, true, true, true, true],      // all except thumb
    5: [true, true, true, true, true],       // all fingers
  };

  const config = fingerConfigs[fingers] || [false, false, false, false, false];
  const [thumb, index, middle, ring, pinky] = config;

  const transform = isLeft ? `transform="scale(-1, 1) translate(-${width}, 0)"` : '';
  
  // Color scheme for better contrast
  const palmColor = "#FBBF24"; // Warmer yellow
  const fingerActiveColor = "#F59E0B"; // Active orange
  const fingerInactiveColor = "#FDE68A"; // Muted yellow
  const outlineColor = "#78350F"; // Dark brown outline

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ${transform} style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));">
      <!-- Palm (larger and more prominent) -->
      <ellipse cx="70" cy="130" rx="50" ry="40" fill="${palmColor}" stroke="${outlineColor}" stroke-width="4"/>
      
      <!-- Wrist -->
      <rect x="40" y="155" width="60" height="30" rx="8" fill="${palmColor}" stroke="${outlineColor}" stroke-width="4"/>
      
      <!-- Thumb (better positioned) -->
      <g class="${thumb ? '' : 'opacity-40'}">
        <ellipse cx="25" cy="105" rx="15" ry="25" fill="${thumb ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="3" transform="rotate(-25, 25, 105)"/>
        <ellipse cx="22" cy="85" rx="8" ry="12" fill="${thumb ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2" transform="rotate(-25, 22, 85)"/>
        ${thumb ? '<circle cx="20" cy="75" r="4" fill="#DC2626" opacity="0.8"/>' : ''}
      </g>
      
      <!-- Index Finger (improved proportions) -->
      <g class="${index ? '' : 'opacity-40'}">
        <rect x="35" y="40" width="18" height="60" rx="9" fill="${index ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="3"/>
        <ellipse cx="44" cy="40" rx="9" ry="6" fill="${index ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        <rect x="38" y="20" width="12" height="25" rx="6" fill="${index ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        ${index ? '<circle cx="44" cy="20" r="4" fill="#DC2626" opacity="0.8"/>' : ''}
      </g>
      
      <!-- Middle Finger (tallest) -->
      <g class="${middle ? '' : 'opacity-40'}">
        <rect x="55" y="30" width="18" height="70" rx="9" fill="${middle ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="3"/>
        <ellipse cx="64" cy="30" rx="9" ry="6" fill="${middle ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        <rect x="58" y="10" width="12" height="25" rx="6" fill="${middle ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        ${middle ? '<circle cx="64" cy="10" r="4" fill="#DC2626" opacity="0.8"/>' : ''}
      </g>
      
      <!-- Ring Finger -->
      <g class="${ring ? '' : 'opacity-40'}">
        <rect x="75" y="35" width="18" height="65" rx="9" fill="${ring ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="3"/>
        <ellipse cx="84" cy="35" rx="9" ry="6" fill="${ring ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        <rect x="78" y="15" width="12" height="25" rx="6" fill="${ring ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        ${ring ? '<circle cx="84" cy="15" r="4" fill="#DC2626" opacity="0.8"/>' : ''}
      </g>
      
      <!-- Pinky Finger (smaller) -->
      <g class="${pinky ? '' : 'opacity-40'}">
        <rect x="95" y="50" width="16" height="50" rx="8" fill="${pinky ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="3"/>
        <ellipse cx="103" cy="50" rx="8" ry="5" fill="${pinky ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        <rect x="98" y="35" width="10" height="20" rx="5" fill="${pinky ? fingerActiveColor : fingerInactiveColor}" stroke="${outlineColor}" stroke-width="2"/>
        ${pinky ? '<circle cx="103" cy="35" r="3" fill="#DC2626" opacity="0.8"/>' : ''}
      </g>
      
      <!-- Palm details for realism -->
      <line x1="50" y1="140" x2="90" y2="140" stroke="${outlineColor}" stroke-width="2" opacity="0.3"/>
      <line x1="45" y1="150" x2="95" y2="150" stroke="${outlineColor}" stroke-width="2" opacity="0.3"/>
    </svg>
  `;
}

/**
 * Generate and display hands for a given number
 * @param {number} num - Number to display (1-10)
 */
function generateHandsForNumber(num) {
  const container = document.getElementById('hands-display');
  container.innerHTML = '';
  container.className = 'flex justify-center items-center gap-8 min-h-[200px] bounce-in';

  if (num <= 5) {
    // Single hand for numbers 1-5
    const handDiv = document.createElement('div');
    handDiv.className = 'transform hover:scale-105 transition-transform';
    handDiv.innerHTML = generateHandSVG(num, false);
    container.appendChild(handDiv);
  } else {
    // Two hands for numbers 6-10
    const leftFingers = 5;
    const rightFingers = num - 5;
    
    // Left hand (always 5 fingers)
    const leftHandDiv = document.createElement('div');
    leftHandDiv.className = 'transform hover:scale-105 transition-transform';
    leftHandDiv.innerHTML = generateHandSVG(leftFingers, true);
    container.appendChild(leftHandDiv);
    
    // Right hand (remaining fingers)
    const rightHandDiv = document.createElement('div');
    rightHandDiv.className = 'transform hover:scale-105 transition-transform';
    rightHandDiv.innerHTML = generateHandSVG(rightFingers, false);
    container.appendChild(rightHandDiv);
  }
}

// =============================================================================
// NUMBER GENERATION AND OPTIONS
// =============================================================================

/**
 * Generate answer options with improved randomization
 * @param {number} correctNum - The correct answer
 * @returns {Array<number>} Array of 4 unique numbers including the correct one
 */
function generateOptions(correctNum) {
  const options = new Set([correctNum]);
  const allNumbers = Array.from({length: 10}, (_, i) => i + 1);
  
  // Remove the correct number from available options
  const availableNumbers = allNumbers.filter(n => n !== correctNum);
  
  // Shuffle the available numbers using Fisher-Yates algorithm
  for (let i = availableNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
  }
  
  // Add 3 random wrong answers
  for (let i = 0; i < availableNumbers.length && options.size < 4; i++) {
    options.add(availableNumbers[i]);
  }
  
  // Convert to array and shuffle the final options
  const finalOptions = Array.from(options);
  for (let i = finalOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
  }
  
  return finalOptions;
}

/**
 * Generate a new number avoiding recent repetitions
 * @returns {number} A number from 1-10 that hasn't been used recently
 */
function generateNewNumber() {
  // Reset used numbers if we've used too many
  if (usedNumbers.size >= 8) {
    usedNumbers.clear();
  }
  
  let newNumber;
  let attempts = 0;
  do {
    newNumber = Math.floor(Math.random() * 10) + 1;
    attempts++;
    // Prevent infinite loop
    if (attempts > 20) {
      usedNumbers.clear();
      newNumber = Math.floor(Math.random() * 10) + 1;
      break;
    }
  } while (usedNumbers.has(newNumber));
  
  usedNumbers.add(newNumber);
  return newNumber;
}

// =============================================================================
// USER INTERFACE FUNCTIONS
// =============================================================================

/**
 * Render answer option buttons with improved visual design
 * @param {Array<number>} options - Array of answer options
 * @param {Object} config - Game configuration
 */
function renderOptions(options, config) {
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  
  // Enhanced color palette for better accessibility
  const colors = [
    { bg: '#FEE2E2', border: '#F87171', hover: '#FECACA', text: '#7F1D1D' },
    { bg: '#DBEAFE', border: '#60A5FA', hover: '#BFDBFE', text: '#1E3A8A' },
    { bg: '#D1FAE5', border: '#34D399', hover: '#A7F3D0', text: '#064E3B' },
    { bg: '#FEF3C7', border: '#FBBF24', hover: '#FDE68A', text: '#78350F' }
  ];
  
  options.forEach((num, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option py-5 px-6 rounded-2xl text-2xl font-bold shadow-lg border-4 transition-all transform hover:scale-105';
    btn.style.backgroundColor = colors[i].bg;
    btn.style.borderColor = colors[i].border;
    btn.style.color = colors[i].text;
    btn.textContent = numberWords[num - 1].toUpperCase();
    btn.dataset.number = num;
    btn.disabled = answered;
    
    // Enhanced hover effects
    btn.addEventListener('click', () => handleAnswer(num, btn, config));
    btn.addEventListener('mouseenter', () => {
      if (!answered) {
        btn.style.backgroundColor = colors[i].hover;
        btn.style.transform = 'translateY(-4px) scale(1.05)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!answered) {
        btn.style.backgroundColor = colors[i].bg;
        btn.style.transform = 'translateY(0) scale(1)';
      }
    });
    
    container.appendChild(btn);
  });
}

// =============================================================================
// GAME LOGIC FUNCTIONS
// =============================================================================

/**
 * Handle user's answer selection
 * @param {number} selectedNum - The number the user selected
 * @param {HTMLElement} btn - The button element that was clicked
 * @param {Object} config - Game configuration
 */
function handleAnswer(selectedNum, btn, config) {
  if (answered) return;
  answered = true;
  stopTimer();
  
  const feedbackEl = document.getElementById('feedback');
  const nextBtn = document.getElementById('next-btn');
  const isCorrect = selectedNum === currentNumber;
  
  // Disable all buttons and highlight correct answer
  document.querySelectorAll('#options-container button').forEach(b => {
    b.disabled = true;
    if (parseInt(b.dataset.number) === currentNumber) {
      b.style.backgroundColor = '#86EFAC';
      b.style.borderColor = '#22C55E';
      b.style.color = '#064E3B';
      b.classList.add('pop');
    }
  });
  
  if (isCorrect) {
    // Enhanced scoring system
    const timeBonus = Math.floor(timeLeft * 2);
    const streakBonus = streak * 5;
    const totalPoints = 10 + timeBonus + streakBonus;
    
    score += totalPoints;
    streak++;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    
    btn.style.backgroundColor = '#86EFAC';
    btn.style.borderColor = '#22C55E';
    btn.style.color = '#064E3B';
    
    feedbackEl.innerHTML = `
      <div class="flex items-center gap-3 text-2xl font-bold text-green-600 bounce-in">
        <span class="text-4xl">✅</span>
        <div class="text-center">
          <div>${config.correct_message || defaultConfig.correct_message}</div>
          <div class="text-sm">+${totalPoints} points!</div>
        </div>
        <span class="text-4xl">🎉</span>
      </div>
    `;
    
    createConfetti();
  } else {
    streak = 0;
    document.getElementById('streak').textContent = streak;
    
    btn.style.backgroundColor = '#FCA5A5';
    btn.style.borderColor = '#EF4444';
    btn.style.color = '#7F1D1D';
    btn.classList.add('shake');
    
    feedbackEl.innerHTML = `
      <div class="flex items-center gap-3 text-2xl font-bold text-red-500 bounce-in">
        <span class="text-4xl">❌</span>
        <div class="text-center">
          <div>${config.wrong_message || defaultConfig.wrong_message}</div>
          <div class="text-lg">It was ${numberWords[currentNumber - 1].toUpperCase()}</div>
        </div>
      </div>
    `;
  }
  
  nextBtn.classList.remove('hidden');
  nextBtn.classList.add('bounce-in', 'pulse-glow');
}

// =============================================================================
// TIMER FUNCTIONS
// =============================================================================

/**
 * Start the countdown timer
 */
function startTimer() {
  timeLeft = TIMER_DURATION;
  const timerBar = document.getElementById('timer-bar');
  timerBar.style.width = '100%';
  timerBar.style.backgroundColor = '#22C55E';
  
  timerInterval = setInterval(() => {
    timeLeft--;
    const percentage = (timeLeft / TIMER_DURATION) * 100;
    timerBar.style.width = `${percentage}%`;
    
    if (timeLeft <= 5) {
      timerBar.style.backgroundColor = '#EF4444';
      timerBar.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
    } else if (timeLeft <= 10) {
      timerBar.style.backgroundColor = '#F59E0B';
    }
    
    if (timeLeft <= 0) {
      stopTimer();
      if (!answered) {
        handleTimeUp();
      }
    }
  }, 1000);
}

/**
 * Stop the countdown timer
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Handle when time runs out
 */
function handleTimeUp() {
  answered = true;
  const config = window.elementSdk?.config || defaultConfig;
  const feedbackEl = document.getElementById('feedback');
  const nextBtn = document.getElementById('next-btn');
  
  streak = 0;
  document.getElementById('streak').textContent = streak;
  
  document.querySelectorAll('#options-container button').forEach(b => {
    b.disabled = true;
    if (parseInt(b.dataset.number) === currentNumber) {
      b.style.backgroundColor = '#86EFAC';
      b.style.borderColor = '#22C55E';
      b.style.color = '#064E3B';
      b.classList.add('pop');
    }
  });
  
  feedbackEl.innerHTML = `
    <div class="flex items-center gap-3 text-2xl font-bold text-orange-500 bounce-in">
      <span class="text-4xl">⏰</span>
      <div class="text-center">
        <div>Time's up!</div>
        <div class="text-lg">It was ${numberWords[currentNumber - 1].toUpperCase()}</div>
      </div>
    </div>
  `;
  
  nextBtn.classList.remove('hidden');
  nextBtn.classList.add('bounce-in', 'pulse-glow');
}

// =============================================================================
// VISUAL EFFECTS
// =============================================================================

/**
 * Create confetti animation for correct answers
 */
function createConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = confetti.style.width;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${Math.random() * 0.5 + 1.5}s`;
    container.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 2500);
  }
}

// =============================================================================
// GAME FLOW FUNCTIONS
// =============================================================================

/**
 * Start a new round of the game
 * @param {Object} config - Game configuration
 */
function startNewRound(config) {
  answered = false;
  currentNumber = generateNewNumber();
  
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('pulse-glow');
  
  // Reset timer bar visual state
  const timerBar = document.getElementById('timer-bar');
  timerBar.style.boxShadow = 'none';
  
  generateHandsForNumber(currentNumber);
  const options = generateOptions(currentNumber);
  renderOptions(options, config);
  startTimer();
}

// =============================================================================
// CONFIGURATION AND THEMING
// =============================================================================

/**
 * Apply configuration changes to the UI
 * @param {Object} config - New configuration settings
 */
async function onConfigChange(config) {
  const bgColor = config.background_color || defaultConfig.background_color;
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const primaryColor = config.primary_action_color || defaultConfig.primary_action_color;
  const secondaryColor = config.secondary_action_color || defaultConfig.secondary_action_color;
  
  // Apply colors to main elements
  document.getElementById('app').style.backgroundColor = bgColor;
  document.getElementById('hands-container').style.backgroundColor = surfaceColor;
  document.getElementById('hands-container').style.borderColor = primaryColor;
  
  document.getElementById('game-title').style.color = textColor;
  document.getElementById('game-title').textContent = config.game_title || defaultConfig.game_title;
  document.querySelector('#game-title + p').style.color = textColor;
  
  // Score containers
  document.querySelectorAll('.flex.items-center.gap-2').forEach(el => {
    el.style.backgroundColor = surfaceColor;
    el.style.color = textColor;
  });
  
  // Timer container
  const timerContainer = document.querySelector('.w-full.h-4.rounded-full');
  if (timerContainer) {
    timerContainer.style.backgroundColor = surfaceColor;
  }
  
  // Next button
  const nextBtn = document.getElementById('next-btn');
  nextBtn.style.backgroundColor = primaryColor;
  nextBtn.style.color = surfaceColor;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the Element SDK and game
 */
function initializeGame() {
  // Initialize Element SDK
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        {
          get: () => config.background_color || defaultConfig.background_color,
          set: (value) => { config.background_color = value; window.elementSdk.setConfig({ background_color: value }); }
        },
        {
          get: () => config.surface_color || defaultConfig.surface_color,
          set: (value) => { config.surface_color = value; window.elementSdk.setConfig({ surface_color: value }); }
        },
        {
          get: () => config.text_color || defaultConfig.text_color,
          set: (value) => { config.text_color = value; window.elementSdk.setConfig({ text_color: value }); }
        },
        {
          get: () => config.primary_action_color || defaultConfig.primary_action_color,
          set: (value) => { config.primary_action_color = value; window.elementSdk.setConfig({ primary_action_color: value }); }
        },
        {
          get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
          set: (value) => { config.secondary_action_color = value; window.elementSdk.setConfig({ secondary_action_color: value }); }
        }
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || 'Nunito',
        set: (value) => { config.font_family = value; window.elementSdk.setConfig({ font_family: value }); }
      },
      fontSizeable: {
        get: () => config.font_size || 16,
        set: (value) => { config.font_size = value; window.elementSdk.setConfig({ font_size: value }); }
      }
    }),
    mapToEditPanelValues: (config) => new Map([
      ["game_title", config.game_title || defaultConfig.game_title],
      ["correct_message", config.correct_message || defaultConfig.correct_message],
      ["wrong_message", config.wrong_message || defaultConfig.wrong_message]
    ])
  });

  // Setup next button event listener
  document.getElementById('next-btn').addEventListener('click', () => {
    const config = window.elementSdk?.config || defaultConfig;
    startNewRound(config);
  });

  // Start the first round
  const initialConfig = window.elementSdk?.config || defaultConfig;
  startNewRound(initialConfig);
}

// =============================================================================
// AUTO-INITIALIZATION
// =============================================================================

// Initialize the game when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}
