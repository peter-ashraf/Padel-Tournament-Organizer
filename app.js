// Enhanced Padel Tournament PWA - JavaScript Logic with FIXED Rotation and Event Handling

class PadelTournament {
    constructor() {
        this.players = [];
        this.playerCount = 5;
        this.courtCount = 1;
        this.matchFormat = 'best_of_3';
        this.currentRound = 1;
        this.matches = [];
        this.matchHistory = [];
        this.playerStats = {};
        this.pairStats = {};
        this.restHistory = {}; // Track who has rested and how many times
        this.currentResting = []; // Current round resting players
        this.predefinedNames = ['Peter', 'Mostafa', 'Michael', 'Kirollos', 'Arsy', 'Max'];
        
        this.init();
    }

    init() {
        this.initializeTheme();
        this.registerServiceWorker();
        this.loadFromStorage();
        this.showScreen('welcome-screen');
        // Bind events after a short delay to ensure DOM is ready
        requestAnimationFrame(() => {
            this.bindAllEvents();
        });
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('padelTheme') || 'light';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-color-scheme', theme);
        
        this.updateThemeIcon();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('padelTheme', newTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // PWA Service Worker Registration
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swCode = `
                const CACHE_NAME = 'padel-tournament-v4';
                const urlsToCache = [
                    '/',
                    '/index.html',
                    '/style.css',
                    '/app.js'
                ];

                self.addEventListener('install', event => {
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then(cache => cache.addAll(urlsToCache))
                    );
                });

                self.addEventListener('fetch', event => {
                    event.respondWith(
                        caches.match(event.request)
                            .then(response => response || fetch(event.request))
                    );
                });
            `;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            navigator.serviceWorker.register(swUrl)
                .then(registration => console.log('SW registered:', registration))
                .catch(error => console.log('SW registration failed:', error));
        }
    }

    // Fixed Event Binding - Immediate binding without setTimeout
    bindAllEvents() {
        console.log('Binding all events...');
        
        // Theme toggle
        this.bindThemeToggle();
        
        // Welcome screen events
        this.bindWelcomeScreenEvents();
        
        // Names screen events  
        this.bindNamesScreenEvents();
        
        // Tournament events
        this.bindTournamentEvents();
        
        // Modal events
        this.bindModalEvents();
        
        // Statistics events
        this.bindStatisticsEvents();
        
        console.log('Events bound successfully');
    }

    bindThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    bindWelcomeScreenEvents() {
        // Setup players button - FIXED
        const setupBtn = document.getElementById('setup-players-btn');
        if (setupBtn) {
            // Remove any existing listeners
            setupBtn.replaceWith(setupBtn.cloneNode(true));
            const newSetupBtn = document.getElementById('setup-players-btn');
            
            newSetupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Setup players button clicked');
                this.goToNamesScreen();
            });
            console.log('Setup button event bound');
        }
        
        // Input validation with proper event listeners
        const playerCountInput = document.getElementById('player-count');
        if (playerCountInput) {
            playerCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 5;
                if (value < 4) value = 4;
                if (value > 20) value = 20;
                this.playerCount = value;
            });
            playerCountInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value) || 5;
                if (value < 4) value = 4;
                if (value > 20) value = 20;
                e.target.value = value;
                this.playerCount = value;
            });
        }

        const courtCountInput = document.getElementById('court-count');
        if (courtCountInput) {
            courtCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 1;
                if (value < 1) value = 1;
                if (value > 4) value = 4;
                this.courtCount = value;
            });
            courtCountInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value) || 1;
                if (value < 1) value = 1;
                if (value > 4) value = 4;
                e.target.value = value;
                this.courtCount = value;
            });
        }

        const matchFormatSelect = document.getElementById('match-format');
        if (matchFormatSelect) {
            matchFormatSelect.addEventListener('change', (e) => {
                this.matchFormat = e.target.value;
            });
        }
    }

    bindNamesScreenEvents() {
        const backToWelcome = document.getElementById('back-to-welcome');
        if (backToWelcome) {
            backToWelcome.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('welcome-screen');
            });
        }

        const quickFillBtn = document.getElementById('quick-fill-btn');
        if (quickFillBtn) {
            quickFillBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.quickFillNames();
            });
        }

        const namesForm = document.getElementById('names-form');
        if (namesForm) {
            namesForm.addEventListener('submit', (e) => this.handleNamesSubmit(e));
        }
    }

    bindTournamentEvents() {
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextRound();
            });
        }

        const finishBtn = document.getElementById('finish-tournament');
        if (finishBtn) {
            finishBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.finishTournament();
            });
        }

        const resetBtn = document.getElementById('reset-tournament');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetTournament();
            });
        }
    }

    bindModalEvents() {
        const closeMatchModal = document.getElementById('close-match-modal');
        if (closeMatchModal) {
            closeMatchModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMatchModal();
            });
        }

        const saveScore = document.getElementById('save-score');
        if (saveScore) {
            saveScore.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveMatchScore();
            });
        }

        const matchModal = document.getElementById('match-modal');
        if (matchModal) {
            matchModal.addEventListener('click', (e) => {
                if (e.target.id === 'match-modal') {
                    this.closeMatchModal();
                }
            });
        }
    }

    bindStatisticsEvents() {
        const newTournamentBtn = document.getElementById('new-tournament');
        if (newTournamentBtn) {
            newTournamentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startNewTournament();
            });
        }

        const resetFromStatsBtn = document.getElementById('reset-from-stats');
        if (resetFromStatsBtn) {
            resetFromStatsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetTournament();
            });
        }

        const exportBtn = document.getElementById('export-results');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportResults();
            });
        }
    }

    // Screen Navigation
    showScreen(screenId) {
        console.log(`Showing screen: ${screenId}`);
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`Screen ${screenId} is now active`);
        } else {
            console.error(`Screen ${screenId} not found`);
        }
    }

    // Names Screen Setup - FIXED
    goToNamesScreen() {
        console.log('Going to names screen...');
        
        // Get current values from form
        this.playerCount = parseInt(document.getElementById('player-count').value) || 5;
        this.courtCount = parseInt(document.getElementById('court-count').value) || 1;
        this.matchFormat = document.getElementById('match-format').value || 'best_of_3';
        
        console.log(`Configuration: ${this.playerCount} players, ${this.courtCount} courts, ${this.matchFormat}`);
        
        const subtitle = document.getElementById('names-subtitle');
        if (subtitle) {
            subtitle.textContent = `Enter names for ${this.playerCount} players`;
        }
        
        this.generateNameInputs();
        this.showScreen('names-screen');
        
        // Re-bind names screen events after generating inputs
        requestAnimationFrame(() => {
            this.bindNamesScreenEvents();
        });
    }

    generateNameInputs() {
        const container = document.getElementById('name-inputs');
        if (!container) {
            console.error('Name inputs container not found');
            return;
        }
        
        container.innerHTML = '';
        
        for (let i = 0; i < this.playerCount; i++) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            formGroup.innerHTML = `
                <label class="form-label" for="player-${i + 1}">Player ${i + 1}</label>
                <input type="text" 
                       id="player-${i + 1}" 
                       class="form-control player-input" 
                       placeholder="Enter player name" 
                       list="player-names"
                       autocomplete="off"
                       required>
            `;
            
            container.appendChild(formGroup);
        }
        
        console.log(`Generated ${this.playerCount} name inputs`);
    }

    quickFillNames() {
        const availableNames = [...this.predefinedNames];
        
        for (let i = 1; i <= Math.min(this.playerCount, availableNames.length); i++) {
            const input = document.getElementById(`player-${i}`);
            if (input) {
                input.value = availableNames[i - 1];
            }
        }
        
        this.showStatusMessage('Names filled with sample players!', 'success');
    }

    // Handle Names Form Submission
    handleNamesSubmit(e) {
        e.preventDefault();
        console.log('Handling names form submission...');
        
        this.players = [];
        const inputs = document.querySelectorAll('.player-input');
        const names = new Set();
        let hasError = false;
        
        inputs.forEach(input => {
            const name = input.value.trim();
            if (!name) {
                this.showStatusMessage('Please enter all player names', 'error');
                hasError = true;
                return;
            }
            if (names.has(name)) {
                this.showStatusMessage('Player names must be unique', 'error');
                hasError = true;
                return;
            }
            names.add(name);
            this.players.push(name);
        });
        
        console.log(`Collected players: ${this.players.join(', ')}`);
        
        if (!hasError && this.players.length === this.playerCount) {
            this.initializeStats();
            this.startTournament();
            this.showScreen('tournament-screen');
            this.saveToStorage();
        }
    }

    // Initialize Statistics and Rest History
    initializeStats() {
        this.playerStats = {};
        this.pairStats = {};
        this.restHistory = {};
        
        this.players.forEach(player => {
            this.playerStats[player] = {
                matches: 0,
                wins: 0,
                losses: 0,
                points: 0,
                pointsAgainst: 0
            };
            this.restHistory[player] = {
                timesRested: 0,
                roundsRested: []
            };
        });
        
        console.log('Statistics initialized for all players');
    }

    // Tournament Management
    startTournament() {
        console.log('Starting tournament...');
        this.currentRound = 1;
        this.matches = [];
        this.matchHistory = [];
        this.currentResting = [];
        
        this.generateRound();
        this.updateTournamentDisplay();
    }

    // FIXED: Correct Round Generation with Proper Rotation
    generateRound() {
        console.log(`Generating Round ${this.currentRound}...`);
        
        const playersPerCourt = 4;
        const totalPlayingPlayers = this.courtCount * playersPerCourt;
        const restingPlayerCount = this.playerCount - totalPlayingPlayers;
        
        console.log(`Total players: ${this.playerCount}, Playing: ${totalPlayingPlayers}, Resting: ${restingPlayerCount}`);
        
        // Step 1: Select players who should rest this round
        this.currentResting = this.selectRestingPlayers(restingPlayerCount);
        
        // Step 2: Get playing players (all players except those resting)
        const playingPlayers = this.players.filter(player => !this.currentResting.includes(player));
        
        // Step 3: Validate we have correct numbers
        if (playingPlayers.length !== totalPlayingPlayers) {
            console.error(`Logic error: Expected ${totalPlayingPlayers} playing players, got ${playingPlayers.length}`);
            this.showStatusMessage('Error in player rotation logic', 'error');
            return;
        }
        
        // Step 4: Validate no duplicates in assignments
        const allAssigned = [...playingPlayers, ...this.currentResting];
        const uniqueAssigned = new Set(allAssigned);
        if (uniqueAssigned.size !== this.playerCount) {
            console.error('Duplicate players detected in assignments');
            this.showStatusMessage('Duplicate player assignment detected', 'error');
            return;
        }
        
        // Step 5: Create matches from playing players
        const roundMatches = this.createMatchesFromPlayers(playingPlayers);
        
        // Step 6: Update rest history
        this.currentResting.forEach(player => {
            this.restHistory[player].timesRested++;
            this.restHistory[player].roundsRested.push(this.currentRound);
        });
        
        this.matches = roundMatches;
        
        console.log(`Round ${this.currentRound}: Playing: ${playingPlayers.join(', ')}, Resting: ${this.currentResting.join(', ')}`);
    }

    // Select players who should rest this round based on fair rotation
    selectRestingPlayers(restingCount) {
        if (restingCount <= 0) return [];
        
        // Sort players by least rest time, then by name for consistency
        const playersByRestTime = this.players.slice().sort((a, b) => {
            const aRested = this.restHistory[a].timesRested;
            const bRested = this.restHistory[b].timesRested;
            if (aRested !== bRested) {
                return aRested - bRested; // Least rested first
            }
            return a.localeCompare(b); // Alphabetical for tie-breaking
        });
        
        // For first round, take first N players
        if (this.currentRound === 1) {
            return playersByRestTime.slice(0, restingCount);
        }
        
        // For subsequent rounds, prioritize those who have rested least
        const leastRestedCount = this.restHistory[playersByRestTime[0]].timesRested;
        const candidatesForRest = playersByRestTime.filter(player => 
            this.restHistory[player].timesRested === leastRestedCount
        );
        
        // If we have more candidates than rest spots, select fairly
        if (candidatesForRest.length <= restingCount) {
            // Not enough candidates, include next level
            return playersByRestTime.slice(0, restingCount);
        } else {
            // More candidates than spots, select based on previous round rest pattern
            return this.selectFromCandidates(candidatesForRest, restingCount);
        }
    }

    // Select from candidates using round-robin approach
    selectFromCandidates(candidates, restingCount) {
        // For fairness, rotate through candidates based on round number
        const roundOffset = (this.currentRound - 1) % candidates.length;
        const selected = [];
        
        for (let i = 0; i < restingCount; i++) {
            const index = (roundOffset + i) % candidates.length;
            selected.push(candidates[index]);
        }
        
        return selected;
    }

    // Create matches from list of playing players
    createMatchesFromPlayers(playingPlayers) {
        const matches = [];
        const players = [...playingPlayers];
        
        // Shuffle for variety while ensuring no duplicates
        this.shuffleArray(players);
        
        for (let court = 0; court < this.courtCount && players.length >= 4; court++) {
            const team1 = [players.pop(), players.pop()];
            const team2 = [players.pop(), players.pop()];
            
            // Validate no duplicates within match
            const allPlayersInMatch = [...team1, ...team2];
            const uniquePlayersInMatch = new Set(allPlayersInMatch);
            if (uniquePlayersInMatch.size !== 4) {
                console.error('Duplicate players in match detected');
                continue;
            }
            
            matches.push({
                id: `R${this.currentRound}M${court + 1}`,
                round: this.currentRound,
                team1: team1,
                team2: team2,
                score1: 0,
                score2: 0,
                completed: false,
                court: court + 1
            });
        }
        
        return matches;
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    updateTournamentDisplay() {
        const currentRoundEl = document.getElementById('current-round');
        if (currentRoundEl) {
            currentRoundEl.textContent = `Round ${this.currentRound}`;
        }
        
        const matchFormatEl = document.getElementById('match-format-display');
        if (matchFormatEl) {
            const formatText = this.getMatchFormatDisplay(this.matchFormat);
            matchFormatEl.textContent = formatText;
        }
        
        this.displayWaitingPlayers();
        this.displayCurrentMatches();
        this.displayMatchHistory();
    }

    // Display waiting/resting players
    displayWaitingPlayers() {
        const container = document.getElementById('waiting-players');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.currentResting.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-waiting';
            emptyDiv.textContent = 'All players are currently playing';
            container.appendChild(emptyDiv);
        } else {
            this.currentResting.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'waiting-player';
                const restCount = this.restHistory[player].timesRested;
                playerDiv.textContent = `${player} (rested ${restCount} time${restCount !== 1 ? 's' : ''})`;
                container.appendChild(playerDiv);
            });
        }
        
        console.log(`Displayed ${this.currentResting.length} waiting players`);
    }

    getMatchFormatDisplay(format) {
        switch (format) {
            case 'best_of_3': return 'Best of 3';
            case 'best_of_5': return 'Best of 5';
            case 'full_set': return 'Full Set';
            default: return 'Best of 3';
        }
    }

    displayCurrentMatches() {
        const container = document.getElementById('current-matches');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.matches.forEach((match, index) => {
            const matchCard = this.createMatchCard(match, index);
            container.appendChild(matchCard);
        });
        
        // Re-bind match button events
        this.bindMatchCardEvents();
        
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            const allCompleted = this.matches.every(match => match.completed);
            nextRoundBtn.style.display = allCompleted ? 'block' : 'none';
        }
    }

    bindMatchCardEvents() {
        // Bind events for dynamically created match cards
        const scoreButtons = document.querySelectorAll('.btn-score');
        scoreButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const matchId = btn.dataset.matchId;
                this.openMatchModal(matchId);
            });
        });
    }

    createMatchCard(match, index) {
        const card = document.createElement('div');
        card.className = 'match-card';
        
        card.innerHTML = `
            <div class="match-header">
                <span class="match-number">Court ${match.court}</span>
                <span class="status ${match.completed ? 'status--success' : 'status--info'}">
                    ${match.completed ? 'Completed' : 'In Progress'}
                </span>
            </div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-name">${match.team1.join(' & ')}</div>
                    <div class="team-players">${match.team1.join(' + ')}</div>
                </div>
                <div class="vs-separator">VS</div>
                <div class="team">
                    <div class="team-name">${match.team2.join(' & ')}</div>
                    <div class="team-players">${match.team2.join(' + ')}</div>
                </div>
            </div>
            ${match.completed ? `
                <div class="match-score">
                    <span class="score-display">${match.score1}</span>
                    <span class="score-separator">-</span>
                    <span class="score-display">${match.score2}</span>
                </div>
            ` : ''}
            <div class="match-actions">
                <button class="btn btn--primary btn-score" data-match-id="${match.id}">
                    ${match.completed ? 'Edit Score' : 'Record Score'}
                </button>
            </div>
        `;
        
        return card;
    }

    displayMatchHistory() {
        const container = document.getElementById('match-history');
        if (!container) return;
        
        if (this.matchHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No completed matches yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        const recentHistory = [...this.matchHistory].reverse();
        
        recentHistory.forEach(match => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const winner = match.score1 > match.score2 ? match.team1 : match.team2;
            const formatLabel = this.getMatchFormatShort(match.matchFormat);
            
            historyItem.innerHTML = `
                <div class="history-round">R${match.round}</div>
                <div class="history-match">
                    <div class="history-teams">${match.team1.join(' & ')} vs ${match.team2.join(' & ')}</div>
                    <div class="history-score">${match.score1}-${match.score2} (${formatLabel})</div>
                </div>
                <div class="history-winner">Winner: ${winner.join(' & ')}</div>
            `;
            
            container.appendChild(historyItem);
        });
    }

    getMatchFormatShort(format) {
        switch (format) {
            case 'best_of_3': return 'Bo3';
            case 'best_of_5': return 'Bo5';
            case 'full_set': return 'Set';
            default: return 'Bo3';
        }
    }

    // Match Modal Management
    openMatchModal(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;
        
        const team1Name = document.getElementById('team1-name');
        const team1Players = document.getElementById('team1-players');
        const team2Name = document.getElementById('team2-name');
        const team2Players = document.getElementById('team2-players');
        const team1Score = document.getElementById('team1-score');
        const team2Score = document.getElementById('team2-score');
        const modalFormat = document.getElementById('modal-match-format');
        
        if (team1Name) team1Name.textContent = match.team1.join(' & ');
        if (team1Players) team1Players.textContent = match.team1.join(' + ');
        if (team2Name) team2Name.textContent = match.team2.join(' & ');
        if (team2Players) team2Players.textContent = match.team2.join(' + ');
        if (team1Score) team1Score.value = match.score1;
        if (team2Score) team2Score.value = match.score2;
        if (modalFormat) modalFormat.textContent = this.getMatchFormatDisplay(this.matchFormat);
        
        const modal = document.getElementById('match-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.dataset.matchId = matchId;
        }
        
        setTimeout(() => {
            if (team1Score) {
                team1Score.focus();
                team1Score.select();
            }
        }, 100);
    }

    closeMatchModal() {
        const modal = document.getElementById('match-modal');
        if (modal) {
            modal.classList.add('hidden');
            delete modal.dataset.matchId;
        }
    }

    saveMatchScore() {
        const modal = document.getElementById('match-modal');
        if (!modal) return;
        
        const matchId = modal.dataset.matchId;
        const score1Input = document.getElementById('team1-score');
        const score2Input = document.getElementById('team2-score');
        
        if (!score1Input || !score2Input) return;
        
        const score1 = Math.max(0, parseInt(score1Input.value) || 0);
        const score2 = Math.max(0, parseInt(score2Input.value) || 0);
        
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;
        
        const maxScore = this.getMaxScore(this.matchFormat);
        if (score1 > maxScore || score2 > maxScore) {
            this.showStatusMessage(`Maximum score for ${this.getMatchFormatDisplay(this.matchFormat)} is ${maxScore}`, 'error');
            return;
        }
        
        const wasCompleted = match.completed;
        match.score1 = score1;
        match.score2 = score2;
        match.completed = true;
        match.matchFormat = this.matchFormat;
        
        this.updateMatchStats(match, wasCompleted);
        
        if (!wasCompleted) {
            this.matchHistory.push({...match});
        } else {
            const historyIndex = this.matchHistory.findIndex(h => h.id === matchId);
            if (historyIndex !== -1) {
                this.matchHistory[historyIndex] = {...match};
            }
        }
        
        this.closeMatchModal();
        this.updateTournamentDisplay();
        this.saveToStorage();
        
        this.showStatusMessage('Match score saved successfully!', 'success');
    }

    getMaxScore(format) {
        switch (format) {
            case 'best_of_3': return 3;
            case 'best_of_5': return 5;
            case 'full_set': return 10;
            default: return 3;
        }
    }

    updateMatchStats(match, wasCompleted) {
        if (wasCompleted) {
            this.recalculateAllStats();
            return;
        }
        
        const winner = match.score1 > match.score2 ? match.team1 : match.team2;
        const loser = match.score1 > match.score2 ? match.team2 : match.team1;
        
        winner.forEach(player => {
            if (this.playerStats[player]) {
                this.playerStats[player].matches++;
                this.playerStats[player].wins++;
                this.playerStats[player].points += Math.max(match.score1, match.score2);
                this.playerStats[player].pointsAgainst += Math.min(match.score1, match.score2);
            }
        });
        
        loser.forEach(player => {
            if (this.playerStats[player]) {
                this.playerStats[player].matches++;
                this.playerStats[player].losses++;
                this.playerStats[player].points += Math.min(match.score1, match.score2);
                this.playerStats[player].pointsAgainst += Math.max(match.score1, match.score2);
            }
        });
        
        this.updatePairStats(winner, true);
        this.updatePairStats(loser, false);
    }

    updatePairStats(pair, won) {
        const pairKey = pair.sort().join(' & ');
        
        if (!this.pairStats[pairKey]) {
            this.pairStats[pairKey] = {
                players: [...pair],
                matches: 0,
                wins: 0,
                losses: 0
            };
        }
        
        this.pairStats[pairKey].matches++;
        if (won) {
            this.pairStats[pairKey].wins++;
        } else {
            this.pairStats[pairKey].losses++;
        }
    }

    recalculateAllStats() {
        // Preserve rest history but reset match stats
        const tempRestHistory = { ...this.restHistory };
        this.initializeStats();
        this.restHistory = tempRestHistory;
        
        this.matchHistory.forEach(match => {
            if (match.completed) {
                this.updateMatchStats(match, false);
            }
        });
    }

    // Round Management
    nextRound() {
        this.currentRound++;
        this.generateRound();
        this.updateTournamentDisplay();
        this.saveToStorage();
        
        this.showStatusMessage(`Starting Round ${this.currentRound}!`, 'info');
    }

    // Tournament Completion
    finishTournament() {
        this.calculateComprehensiveStats();
        this.displayStatisticsScreen();
        this.showScreen('statistics-screen');
    }

    calculateComprehensiveStats() {
        const bestPair = Object.values(this.pairStats).reduce((best, pair) => {
            const currentRate = pair.matches > 0 ? pair.wins / pair.matches : 0;
            const bestRate = best.matches > 0 ? best.wins / best.matches : 0;
            return currentRate > bestRate ? pair : best;
        }, { matches: 0, wins: 0, losses: 0, players: [] });

        const worstPair = Object.values(this.pairStats).reduce((worst, pair) => {
            if (pair.matches === 0) return worst;
            const currentRate = pair.wins / pair.matches;
            const worstRate = worst.matches > 0 ? worst.wins / worst.matches : 1;
            return currentRate < worstRate ? pair : worst;
        }, { matches: 0, wins: 0, losses: 0, players: [] });

        const mostWins = Object.entries(this.playerStats).reduce((best, [player, stats]) => {
            return stats.wins > best.wins ? { player, ...stats } : best;
        }, { player: '', wins: 0 });

        const mostLosses = Object.entries(this.playerStats).reduce((worst, [player, stats]) => {
            return stats.losses > worst.losses ? { player, ...stats } : worst;
        }, { player: '', losses: 0 });

        this.tournamentStats = {
            bestPair,
            worstPair,
            mostWins,
            mostLosses
        };
    }

    displayStatisticsScreen() {
        const bestPairEl = document.getElementById('best-pair-stats');
        if (bestPairEl && this.tournamentStats.bestPair.matches > 0) {
            const winRate = Math.round((this.tournamentStats.bestPair.wins / this.tournamentStats.bestPair.matches) * 100);
            bestPairEl.innerHTML = `
                <div class="stat-value">${this.tournamentStats.bestPair.players.join(' & ')}</div>
                <div class="stat-label">${this.tournamentStats.bestPair.wins} wins, ${this.tournamentStats.bestPair.losses} losses</div>
                <div class="stat-percentage">${winRate}% win rate</div>
            `;
        } else if (bestPairEl) {
            bestPairEl.innerHTML = '<div class="stat-value">No pair data available</div>';
        }

        const mostWinsEl = document.getElementById('most-wins-stats');
        if (mostWinsEl && this.tournamentStats.mostWins.wins > 0) {
            const winRate = Math.round((this.tournamentStats.mostWins.wins / this.tournamentStats.mostWins.matches) * 100);
            mostWinsEl.innerHTML = `
                <div class="stat-value">${this.tournamentStats.mostWins.player}</div>
                <div class="stat-label">${this.tournamentStats.mostWins.wins} wins, ${this.tournamentStats.mostWins.losses} losses</div>
                <div class="stat-percentage">${winRate}% win rate</div>
            `;
        } else if (mostWinsEl) {
            mostWinsEl.innerHTML = '<div class="stat-value">No data available</div>';
        }

        const mostLossesEl = document.getElementById('most-losses-stats');
        if (mostLossesEl && this.tournamentStats.mostLosses.losses > 0) {
            const winRate = Math.round((this.tournamentStats.mostLosses.wins / this.tournamentStats.mostLosses.matches) * 100);
            mostLossesEl.innerHTML = `
                <div class="stat-value">${this.tournamentStats.mostLosses.player}</div>
                <div class="stat-label">${this.tournamentStats.mostLosses.wins} wins, ${this.tournamentStats.mostLosses.losses} losses</div>
                <div class="stat-percentage">${winRate}% win rate</div>
            `;
        } else if (mostLossesEl) {
            mostLossesEl.innerHTML = '<div class="stat-value">No data available</div>';
        }

        const worstPairEl = document.getElementById('worst-pair-stats');
        if (worstPairEl && this.tournamentStats.worstPair.matches > 0) {
            const winRate = Math.round((this.tournamentStats.worstPair.wins / this.tournamentStats.worstPair.matches) * 100);
            worstPairEl.innerHTML = `
                <div class="stat-value">${this.tournamentStats.worstPair.players.join(' & ')}</div>
                <div class="stat-label">${this.tournamentStats.worstPair.wins} wins, ${this.tournamentStats.worstPair.losses} losses</div>
                <div class="stat-percentage">${winRate}% win rate</div>
            `;
        } else if (worstPairEl) {
            worstPairEl.innerHTML = '<div class="stat-value">No pair data available</div>';
        }

        const individualEl = document.getElementById('individual-stats');
        if (individualEl) {
            individualEl.innerHTML = '';

            Object.entries(this.playerStats)
                .sort((a, b) => {
                    const aRate = a[1].matches > 0 ? a[1].wins / a[1].matches : 0;
                    const bRate = b[1].matches > 0 ? b[1].wins / b[1].matches : 0;
                    return bRate - aRate;
                })
                .forEach(([player, stats]) => {
                    const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
                    
                    const playerRow = document.createElement('div');
                    playerRow.className = 'player-stat-row';
                    playerRow.innerHTML = `
                        <div class="player-name-stat">${player}</div>
                        <div class="player-matches">${stats.matches} matches</div>
                        <div class="player-record">${stats.wins}W - ${stats.losses}L</div>
                        <div class="player-winrate">${winRate}%</div>
                    `;
                    
                    individualEl.appendChild(playerRow);
                });
        }
    }

    exportResults() {
        const data = {
            tournament: {
                players: this.players,
                rounds: this.currentRound - 1,
                matchFormat: this.matchFormat,
                totalMatches: this.matchHistory.length
            },
            matches: this.matchHistory,
            playerStats: this.playerStats,
            pairStats: this.pairStats,
            restHistory: this.restHistory,
            highlights: this.tournamentStats
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `padel-tournament-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatusMessage('Tournament results exported successfully!', 'success');
    }

    startNewTournament() {
        this.resetTournament();
    }

    resetTournament() {
        const confirmed = confirm('Are you sure you want to reset the tournament? All progress will be lost.');
        
        if (confirmed) {
            this.players = [];
            this.playerCount = 5;
            this.courtCount = 1;
            this.matchFormat = 'best_of_3';
            this.currentRound = 1;
            this.matches = [];
            this.matchHistory = [];
            this.playerStats = {};
            this.pairStats = {};
            this.restHistory = {};
            this.currentResting = [];
            
            const playerCountInput = document.getElementById('player-count');
            const courtCountInput = document.getElementById('court-count');
            const matchFormatSelect = document.getElementById('match-format');
            
            if (playerCountInput) playerCountInput.value = 5;
            if (courtCountInput) courtCountInput.value = 1;
            if (matchFormatSelect) matchFormatSelect.value = 'best_of_3';
            
            localStorage.removeItem('padelTournament');
            
            this.showScreen('welcome-screen');
            this.showStatusMessage('Tournament reset successfully!', 'success');
        }
    }

    // Status Messages
    showStatusMessage(message, type) {
        document.querySelectorAll('.status-message').forEach(msg => msg.remove());
        
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            activeScreen.insertBefore(statusDiv, activeScreen.firstChild);
        }
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 4000);
    }

    // Storage Management
    saveToStorage() {
        try {
            const data = {
                players: this.players,
                playerCount: this.playerCount,
                courtCount: this.courtCount,
                matchFormat: this.matchFormat,
                currentRound: this.currentRound,
                matches: this.matches,
                matchHistory: this.matchHistory,
                playerStats: this.playerStats,
                pairStats: this.pairStats,
                restHistory: this.restHistory,
                currentResting: this.currentResting
            };
            
            localStorage.setItem('padelTournament', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('padelTournament');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            this.players = data.players || [];
            this.playerCount = data.playerCount || 5;
            this.courtCount = data.courtCount || 1;
            this.matchFormat = data.matchFormat || 'best_of_3';
            this.currentRound = data.currentRound || 1;
            this.matches = data.matches || [];
            this.matchHistory = data.matchHistory || [];
            this.playerStats = data.playerStats || {};
            this.pairStats = data.pairStats || {};
            this.restHistory = data.restHistory || {};
            this.currentResting = data.currentResting || [];
            
            // Restore form values and continue tournament if in progress
            requestAnimationFrame(() => {
                const playerCountInput = document.getElementById('player-count');
                const courtCountInput = document.getElementById('court-count');
                const matchFormatSelect = document.getElementById('match-format');
                
                if (playerCountInput) playerCountInput.value = this.playerCount;
                if (courtCountInput) courtCountInput.value = this.courtCount;
                if (matchFormatSelect) matchFormatSelect.value = this.matchFormat;
                
                if (this.players.length > 0 && (this.matches.length > 0 || this.matchHistory.length > 0)) {
                    this.showScreen('tournament-screen');
                    this.updateTournamentDisplay();
                }
            });
        } catch (e) {
            console.error('Error loading from storage:', e);
            localStorage.removeItem('padelTournament');
        }
    }
}

// Initialize the tournament app when DOM is ready
function initTournament() {
    console.log('Initializing Padel Tournament...');
    window.tournament = new PadelTournament();
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTournament);
} else {
    initTournament();
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Install App';
    installBtn.className = 'btn btn--secondary btn--sm';
    installBtn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 1000; box-shadow: var(--shadow-lg);';
    
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            installBtn.remove();
        }
    });
    
    document.body.appendChild(installBtn);
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    if (window.tournament) {
        window.tournament.showStatusMessage('App installed successfully!', 'success');
    }
});

window.addEventListener('online', () => {
    if (window.tournament) {
        window.tournament.showStatusMessage('Back online!', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.tournament) {
        window.tournament.showStatusMessage('Working offline', 'info');
    }
});