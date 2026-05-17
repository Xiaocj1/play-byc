export const STORAGE_KEY = "fair_office_game_state";
export const ENDINGS_KEY = "fair_office_unlocked_endings";
export const PROJECT_EXPERIENCE_KEY = "fair_office_project_experience";
export const RANK_KEY = "fair_office_current_rank";
export const TOOLCHAIN_KEY = "fair_office_toolchain";
export const UNLOCKED_TOOLS_KEY = "fair_office_unlocked_tools";

export let projectExperience = 0;
export let currentRank = "p5";
export let ranks = [];
export let toolsData = { categories: [] };
export let selectedTools = {};
export let unlockedTools = [];

export let gameState = {
    week: 1,
    prdVersion: "V1.0.0",
    favors: {},
    progress: 0,
    satisfaction: 80,
    satisfactionHistory: [80],
    consecutiveLowSatisfactionWeeks: 0,
    prdHistory: [],
    weeklyLogs: [],
    currentEventIndex: 0,
    gameOver: false,
    budget: 100,
    toolchain: {}
};

export let data = {
    weekly_reports: { reports: [] },
    prd_templates: { prd_entries: [] },
    events: { events: [] },
    characters: { characters: [] },
    ranks: { ranks: [] },
    endings: { endings: [] },
    tools: { categories: [] }
};

export function setProjectExperience(value) { projectExperience = value; }
export function setCurrentRank(value) { currentRank = value; }
export function setRanks(value) { ranks = value; }
export function setToolsData(value) { toolsData = value; }
export function setSelectedTools(value) { selectedTools = value; }
export function setUnlockedTools(value) { unlockedTools = value; }
export function setGameState(value) { gameState = value; }
export function setData(value) { data = value; }

export function loadProjectExperienceAndRank() {
    projectExperience = parseInt(localStorage.getItem(PROJECT_EXPERIENCE_KEY) || '0');
    currentRank = localStorage.getItem(RANK_KEY) || 'p5';
}

export function saveProjectExperienceAndRank() {
    localStorage.setItem(PROJECT_EXPERIENCE_KEY, projectExperience.toString());
    localStorage.setItem(RANK_KEY, currentRank);
}

export function loadGameState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
    }
}

export function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

export function loadUnlockedTools() {
    const saved = localStorage.getItem(UNLOCKED_TOOLS_KEY);
    if (saved) {
        unlockedTools = JSON.parse(saved);
    }
}

export function saveUnlockedTools() {
    localStorage.setItem(UNLOCKED_TOOLS_KEY, JSON.stringify(unlockedTools));
}
