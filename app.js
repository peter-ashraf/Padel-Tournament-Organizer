// Tournament Manager Application
class TournamentManager {
    constructor() {
        this.predefinedNames = ['Peter', 'Mostafa', 'Michael', 'Kirollos', 'Arsy', 'Max'];
        this.players = [];
        this.currentRound = 1;
        this.matches = [];
        this.matchHistory = [];
        this.playerStats = {};
        this.settings = {
            numPlayers: 4,
            numCourts: 1,
            matchFormat: 'best_of_3'
        };
        this.playerConsecutiveMatches = {};
        // NEW: Track player partnerships to ensure variety
        this.playerPartnerships = {};
        this.playerOpponents = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePlayerInputs();
        this.setupTheme();
        this.registerServiceWorker();
    }

    // Fisher-Yates shuffle algorithm for proper randomization
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    setupEventListeners() {
        // Tournament setup - Fixed event handling with proper binding
        const numPlayersSelect = document.getElementById('numPlayers');
        const numCourtsSelect = document.getElementById('numCourts');
        const matchFormatSelect = document.getElementById('matchFormat');
        const startButton = document.getElementById('startTournament');
        const quickFillButton = document.getElementById('quickFill');

        // Fixed event listeners with proper this binding
        if (numPlayersSelect) {
            numPlayersSelect.addEventListener('change', (e) => {
                this.settings.numPlayers = parseInt(e.target.value);
                this.initializePlayerInputs();
            });
        }

        if (numCourtsSelect) {
            numCourtsSelect.addEventListener('change', (e) => {
                this.settings.numCourts = parseInt(e.target.value);
            });
        }

        if (matchFormatSelect) {
            matchFormatSelect.addEventListener('change', (e) => {
                this.settings.matchFormat = e.target.value;
            });
        }

        if (startButton) {
            startButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startTournament();
            });
        }

        // Quick Fill functionality
        if (quickFillButton) {
            quickFillButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.quickFillPlayers();
            });
        }

        // Tournament controls
        const nextRoundBtn = document.getElementById('nextRound');
        const endTournamentBtn = document.getElementById('endTournament');

        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextRound();
            });
        }

        if (endTournamentBtn) {
            endTournamentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.endTournament();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Statistics modal
        const statsBtn = document.getElementById('statsBtn');
        const closeStats = document.getElementById('closeStats');

        if (statsBtn) {
            statsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showStatistics();
            });
        }

        if (closeStats) {
            closeStats.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideStatistics();
            });
        }

        // Modal backdrop handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__backdrop')) {
                this.hideStatistics();
            }
        });
    }

    quickFillPlayers() {
        const playerInputs = document.querySelectorAll('.player-input');
        const namesToUse = this.shuffleArray([...this.predefinedNames]);
        
        playerInputs.forEach((input, index) => {
            if (index < namesToUse.length) {
                input.value = namesToUse[index];
            }
        });
    }

    initializePlayerInputs() {
        const playersGrid = document.getElementById('playersGrid');
        if (!playersGrid) return;

        playersGrid.innerHTML = '';

        for (let i = 0; i < this.settings.numPlayers; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-combo';
            const inputId = `player-input-${i}`;
            const suggestionsId = `suggestions-${i}`;

            playerDiv.innerHTML = `
                <input type="text" class="form-control player-input" id="${inputId}" 
                       placeholder="Player ${i + 1}" data-player-index="${i}" autocomplete="off">
                <div class="player-suggestions hidden" id="${suggestionsId}" data-suggestions-for="${inputId}"></div>
            `;

            playersGrid.appendChild(playerDiv);

            // Add event listeners after adding to DOM
            const input = playerDiv.querySelector(`#${inputId}`);
            const suggestions = playerDiv.querySelector(`#${suggestionsId}`);

            if (input && suggestions) {
                input.addEventListener('input', (e) => {
                    this.handlePlayerInput(e, suggestions);
                });

                input.addEventListener('focus', (e) => {
                    if (e.target.value.trim() === '') {
                        this.showAllSuggestions(e, suggestions);
                    }
                });

                input.addEventListener('blur', (e) => {
                    // Delay hiding to allow clicking on suggestions
                    setTimeout(() => {
                        suggestions.classList.add('hidden');
                    }, 200);
                });
            }
        }
    }

    handlePlayerInput(event, suggestionsDiv) {
        const input = event.target;
        const value = input.value.toLowerCase();

        if (value.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }

        const filteredNames = this.predefinedNames.filter(name => 
            name.toLowerCase().includes(value)
        );

        this.showSuggestions(suggestionsDiv, filteredNames, input);
    }

    showAllSuggestions(event, suggestionsDiv) {
        const input = event.target;
        this.showSuggestions(suggestionsDiv, this.predefinedNames, input);
    }

    showSuggestions(suggestionsDiv, suggestions, input) {
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }

        suggestionsDiv.innerHTML = suggestions.map(name => 
            `<div class="suggestion-item" data-name="${name}">${name}</div>`
        ).join('');

        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent blur from firing first
                input.value = item.dataset.name;
                suggestionsDiv.classList.add('hidden');
                input.focus();
            });
        });

        suggestionsDiv.classList.remove('hidden');
    }

    startTournament() {
        // Collect player names
        const playerInputs = document.querySelectorAll('.player-input');
        this.players = [];
        
        playerInputs.forEach((input, index) => {
            const name = input.value.trim();
            if (name) {
                this.players.push({
                    name: name,
                    id: `player${index}`
                });
            }
        });

        // Validate minimum players
        if (this.players.length < 4) {
            alert('Please enter at least 4 players to start the tournament.');
            return;
        }

        // CRITICAL FIX: Randomly shuffle players before first round
        console.log('Players before shuffle:', this.players.map(p => p.name));
        this.players = this.shuffleArray(this.players);
        console.log('Players after shuffle:', this.players.map(p => p.name));

        // Initialize player statistics
        this.playerStats = {};
        this.players.forEach(player => {
            this.playerStats[player.name] = {
                matchesPlayed: 0,
                timesSat: 0
            };
        });

        // Initialize consecutive matches tracking
        this.playerConsecutiveMatches = {};
        this.players.forEach(player => {
            this.playerConsecutiveMatches[player.name] = 0;
        });

        // NEW: Initialize partnership and opponent tracking
        this.initializePartnershipTracking();

        // Reset tournament state
        this.currentRound = 1;
        this.matches = [];
        this.matchHistory = [];

        // Generate first round matches
        this.generateMatches();

        // Switch to tournament view
        const setupSection = document.getElementById('tournamentSetup');
        const activeSection = document.getElementById('tournamentActive');
        if (setupSection) setupSection.classList.add('hidden');
        if (activeSection) activeSection.classList.remove('hidden');

        // Update tournament info
        this.updateTournamentInfo();
    }

    // NEW: Initialize partnership tracking
    initializePartnershipTracking() {
        this.playerPartnerships = {};
        this.playerOpponents = {};
        
        this.players.forEach(player => {
            this.playerPartnerships[player.name] = {};
            this.playerOpponents[player.name] = {};
            
            this.players.forEach(otherPlayer => {
                if (player.name !== otherPlayer.name) {
                    this.playerPartnerships[player.name][otherPlayer.name] = 0;
                    this.playerOpponents[player.name][otherPlayer.name] = 0;
                }
            });
        });
    }

    // IMPROVED: Generate matches with better rotation logic
    generateMatches() {
        this.matches = [];
        const playersPerCourt = 4;
        const totalPlayingPlayers = this.settings.numCourts * playersPerCourt;

        // Get players who should play this round with improved selection
        const availablePlayers = this.getAvailablePlayersForRound();
        const playingPlayers = availablePlayers.slice(0, totalPlayingPlayers);
        const waitingPlayers = this.players.filter(p => !playingPlayers.includes(p));

        // Create matches for each court with optimal pairing
        for (let court = 0; court < this.settings.numCourts; court++) {
            const courtPlayers = playingPlayers.slice(court * playersPerCourt, (court + 1) * playersPerCourt);
            
            if (courtPlayers.length === playersPerCourt) {
                // NEW: Use smart pairing instead of sequential pairing
                const teams = this.createOptimalTeams(courtPlayers);
                
                const match = {
                    id: `match${court + 1}_${this.currentRound}`,
                    court: court + 1,
                    round: this.currentRound,
                    team1: teams.team1,
                    team2: teams.team2,
                    format: this.settings.matchFormat
                };
                
                this.matches.push(match);
                
                // Update partnership and opponent tracking
                this.updatePartnershipTracking(teams.team1, teams.team2);
            }
        }

        // Update player statistics
        playingPlayers.forEach(player => {
            this.playerStats[player.name].matchesPlayed++;
            this.playerConsecutiveMatches[player.name]++;
        });
        
        waitingPlayers.forEach(player => {
            this.playerStats[player.name].timesSat++;
            this.playerConsecutiveMatches[player.name] = 0; // Reset consecutive counter
        });

        this.renderMatches();
        this.renderWaitingPlayers(waitingPlayers);
    }

    // NEW: Create optimal team pairings to maximize variety
    createOptimalTeams(courtPlayers) {
        const players = [...courtPlayers];
        let bestPairing = null;
        let bestScore = -1;
        
        // Try all possible team combinations (there are only 3 unique ways to pair 4 players)
        const possiblePairings = [
            { team1: [players[0], players[1]], team2: [players[2], players[3]] },
            { team1: [players[0], players[2]], team2: [players[1], players[3]] },
            { team1: [players[0], players[3]], team2: [players[1], players[2]] }
        ];
        
        possiblePairings.forEach(pairing => {
            const score = this.calculatePairingScore(pairing);
            if (score > bestScore) {
                bestScore = score;
                bestPairing = pairing;
            }
        });
        
        return bestPairing || possiblePairings[0]; // Fallback to first option
    }

    // NEW: Calculate pairing score to minimize repeated partnerships
    calculatePairingScore(pairing) {
        let score = 0;
        
        // Check team1 partnership frequency (lower is better)
        const team1Partner1 = pairing.team1[0].name;
        const team1Partner2 = pairing.team1[1].name;
        const team1Partnerships = this.playerPartnerships[team1Partner1][team1Partner2] || 0;
        
        // Check team2 partnership frequency
        const team2Partner1 = pairing.team2[0].name;
        const team2Partner2 = pairing.team2[1].name;
        const team2Partnerships = this.playerPartnerships[team2Partner1][team2Partner2] || 0;
        
        // Check opponent frequency
        let opponentFrequency = 0;
        pairing.team1.forEach(player1 => {
            pairing.team2.forEach(player2 => {
                opponentFrequency += this.playerOpponents[player1.name][player2.name] || 0;
            });
        });
        
        // Higher score for less frequent partnerships and opponents
        // Invert the counts so lower frequency = higher score
        score = 100 - (team1Partnerships * 10) - (team2Partnerships * 10) - (opponentFrequency * 5);
        
        // Add some randomness to break ties
        score += Math.random() * 10;
        
        return score;
    }

    // NEW: Update partnership and opponent tracking
    updatePartnershipTracking(team1, team2) {
        // Update partnerships
        this.playerPartnerships[team1[0].name][team1[1].name]++;
        this.playerPartnerships[team1[1].name][team1[0].name]++;
        this.playerPartnerships[team2[0].name][team2[1].name]++;
        this.playerPartnerships[team2[1].name][team2[0].name]++;
        
        // Update opponents
        team1.forEach(player1 => {
            team2.forEach(player2 => {
                this.playerOpponents[player1.name][player2.name]++;
                this.playerOpponents[player2.name][player1.name]++;
            });
        });
    }

    // IMPROVED: Better player selection for rounds
    getAvailablePlayersForRound() {
        // Sort players by priority: those who sat out get priority, then by consecutive matches
        return [...this.players].sort((a, b) => {
            const aConsecutive = this.playerConsecutiveMatches[a.name] || 0;
            const bConsecutive = this.playerConsecutiveMatches[b.name] || 0;
            const aTimesSat = this.playerStats[a.name].timesSat || 0;
            const bTimesSat = this.playerStats[b.name].timesSat || 0;

            // Players who have sat more get higher priority
            if (bTimesSat !== aTimesSat) {
                return bTimesSat - aTimesSat;
            }

            // Players with more consecutive matches get lower priority
            if (bConsecutive !== aConsecutive) {
                return aConsecutive - bConsecutive;
            }

            // If equal, randomize
            return Math.random() - 0.5;
        });
    }

    renderMatches() {
        const matchesGrid = document.getElementById('matchesGrid');
        if (!matchesGrid) return;

        matchesGrid.innerHTML = '';

        this.matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            
            matchCard.innerHTML = `
                <div class="match-header">
                    <span class="court-label">Court ${match.court}</span>
                    <span class="match-format">${this.getFormatLabel(match.format)}</span>
                </div>
                <div class="teams">
                    <div class="team">
                        <span class="team-players">${match.team1[0].name} & ${match.team1[1].name}</span>
                    </div>
                    <div class="team-vs">vs</div>
                    <div class="team">
                        <span class="team-players">${match.team2[0].name} & ${match.team2[1].name}</span>
                    </div>
                </div>
            `;
            
            matchesGrid.appendChild(matchCard);
        });
    }

    renderWaitingPlayers(waitingPlayers) {
        const waitingSection = document.getElementById('waitingSection');
        const waitingPlayersDiv = document.getElementById('waitingPlayers');
        
        if (!waitingSection || !waitingPlayersDiv) return;

        if (waitingPlayers.length === 0) {
            waitingSection.classList.add('hidden');
            return;
        }

        waitingSection.classList.remove('hidden');
        waitingPlayersDiv.innerHTML = `
            <div class="waiting-list">
                ${waitingPlayers.map(player => 
                    `<span class="waiting-player">${player.name}</span>`
                ).join('')}
            </div>
        `;
    }

    getFormatLabel(format) {
        const formats = {
            'best_of_3': 'Best of 3',
            'best_of_5': 'Best of 5',
            'full_set': 'Full Set'
        };
        return formats[format] || 'Best of 3';
    }

    nextRound() {
        // Save current round to history
        this.matchHistory.push({
            round: this.currentRound,
            matches: [...this.matches]
        });

        // Increment round and generate new matches
        this.currentRound++;
        this.generateMatches();
        this.updateTournamentInfo();
        this.renderMatchHistory();
    }

    renderMatchHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        // Show recent rounds first
        const recentHistory = [...this.matchHistory].reverse().slice(0, 5);
        
        recentHistory.forEach(roundData => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'history-round';
            
            roundDiv.innerHTML = `
                <div class="history-round-header">Round ${roundData.round}</div>
                <div class="history-matches">
                    ${roundData.matches.map(match => `
                        <div class="history-match">
                            <div class="history-court">Court ${match.court}</div>
                            <div class="history-teams">
                                ${match.team1[0].name} & ${match.team1[1].name}<br>
                                vs<br>
                                ${match.team2[0].name} & ${match.team2[1].name}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            historyList.appendChild(roundDiv);
        });
    }

    updateTournamentInfo() {
        const currentRoundSpan = document.getElementById('currentRound');
        const totalPlayersSpan = document.getElementById('totalPlayers');
        const totalCourtsSpan = document.getElementById('totalCourts');
        const currentFormatSpan = document.getElementById('currentFormat');

        if (currentRoundSpan) currentRoundSpan.textContent = this.currentRound;
        if (totalPlayersSpan) totalPlayersSpan.textContent = this.players.length;
        if (totalCourtsSpan) totalCourtsSpan.textContent = this.settings.numCourts;
        if (currentFormatSpan) currentFormatSpan.textContent = this.getFormatLabel(this.settings.matchFormat);
    }

    endTournament() {
        if (confirm('Are you sure you want to end the tournament?')) {
            // Reset to setup view
            const activeSection = document.getElementById('tournamentActive');
            const setupSection = document.getElementById('tournamentSetup');
            if (activeSection) activeSection.classList.add('hidden');
            if (setupSection) setupSection.classList.remove('hidden');

            // Clear tournament data
            this.players = [];
            this.matches = [];
            this.matchHistory = [];
            this.currentRound = 1;
            this.playerStats = {};
            this.playerConsecutiveMatches = {};
            this.playerPartnerships = {};
            this.playerOpponents = {};

            // Clear player inputs
            document.querySelectorAll('.player-input').forEach(input => {
                input.value = '';
            });
        }
    }

    showStatistics() {
        const modal = document.getElementById('statsModal');
        const statsContent = document.getElementById('statsContent');
        if (!modal || !statsContent) return;

        if (Object.keys(this.playerStats).length === 0) {
            statsContent.innerHTML = '<p class="text-center text-secondary">No tournament data available.</p>';
        } else {
            statsContent.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">Total Rounds</div>
                    <div class="stat-value">${this.currentRound - 1 + (this.matches.length > 0 ? 1 : 0)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Matches</div>
                    <div class="stat-value">${this.matchHistory.length * this.settings.numCourts + this.matches.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Player Statistics</div>
                    <div class="player-stats">
                        ${Object.entries(this.playerStats).map(([name, stats]) => `
                            <div class="player-stat">
                                <span class="player-name">${name}</span>
                                <span class="player-counts">${stats.matchesPlayed} played • ${stats.timesSat} rested</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        modal.classList.remove('hidden');
    }

    hideStatistics() {
        const modal = document.getElementById('statsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.querySelector('.theme-icon');

        // Check for saved theme preference or default to light mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = prefersDark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-color-scheme', currentTheme);

        if (themeIcon) {
            themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const themeIcon = document.querySelector('.theme-icon');

        document.documentElement.setAttribute('data-color-scheme', newTheme);

        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swCode = `
                const CACHE_NAME = 'padel-tournament-v1';
                const urlsToCache = ['/', 'index.html', 'style.css', 'app.js'];

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
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }
}

// Initialize the tournament manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TournamentManager();
});
