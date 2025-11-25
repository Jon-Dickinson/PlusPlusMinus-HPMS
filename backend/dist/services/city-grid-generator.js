/**
 * Runtime CityGridGenerator
 * Clean + strongly typed refactor of the original implementation.
 */
// --------------------------------------
// CONSTANTS
// --------------------------------------
const BUILDINGS = [
    { id: 1, name: 'Commercial Complex', category: 'commercial', resources: { power: 30, water: 15, employment: 50 } },
    { id: 2, name: 'Emergency Services', category: 'emergency', resources: { power: 20, water: 10, employment: 15, serviceCoverage: 80 } },
    { id: 3, name: 'Factory', category: 'industrial', resources: { power: 50, water: 20, employment: 60 } },
    { id: 4, name: 'Farm', category: 'agriculture', resources: { power: 10, water: 25, employment: 20, foodProduction: 70 } },
    { id: 5, name: 'Government Office', category: 'government', resources: { power: 25, water: 10, employment: 30, serviceCoverage: 80 } },
    { id: 6, name: 'Power Station', category: 'energy', resources: { powerOutput: 250, water: 40, employment: 35 } },
    { id: 7, name: 'Residential Housing', category: 'residential', resources: { power: 80, water: 40, population: 100 } },
    { id: 8, name: 'Water Pump Station', category: 'utilities', resources: { power: 25, waterOutput: 250, employment: 10 } },
];
const HIERARCHY_PERMISSIONS = {
    NATIONAL_LEVEL: 'all',
    CITY_LEVEL: ['commercial', 'emergency', 'energy', 'utilities', 'residential', 'agriculture'],
    SUBURB_LEVEL: ['residential', 'agriculture'],
};
// --------------------------------------
// MAIN CLASS
// --------------------------------------
export class CityGridGenerator {
    GRID_SIZE = 100;
    generateCityGrid(hierarchyLevel) {
        const allowed = this.getAllowedBuildings(hierarchyLevel);
        const gridState = this.createEmptyGrid();
        const buildingLog = [];
        const buildingCounts = this.getBuildingCounts(hierarchyLevel);
        this.fillGrid(gridState, allowed, buildingCounts, buildingLog);
        return {
            gridState,
            buildingLog: buildingLog.reverse(),
            qualityIndex: this.calculateQualityIndex(gridState),
        };
    }
    calculateQualityIndexFromGrid(gridState) {
        return this.calculateQualityIndex(gridState);
    }
    // --------------------------------------
    // GRID HELPERS
    // --------------------------------------
    createEmptyGrid() {
        return Array.from({ length: this.GRID_SIZE }, () => []);
    }
    getAllowedBuildings(hierarchyLevel) {
        switch (hierarchyLevel) {
            case 1:
                return BUILDINGS;
            case 2:
                return BUILDINGS.filter(b => HIERARCHY_PERMISSIONS.CITY_LEVEL.includes(b.category));
            case 3:
                return BUILDINGS.filter(b => HIERARCHY_PERMISSIONS.SUBURB_LEVEL.includes(b.category));
            default:
                return BUILDINGS.filter(b => HIERARCHY_PERMISSIONS.SUBURB_LEVEL.includes(b.category));
        }
    }
    getBuildingCounts(hierarchyLevel) {
        switch (hierarchyLevel) {
            case 1:
                return {
                    residential: 8,
                    commercial: 4,
                    industrial: 3,
                    energy: 2,
                    utilities: 2,
                    emergency: 2,
                    government: 2,
                    agriculture: 3,
                };
            case 2:
                return {
                    residential: 5,
                    commercial: 3,
                    energy: 1,
                    utilities: 1,
                    emergency: 1,
                    agriculture: 4,
                };
            case 3:
                return { residential: 3, agriculture: 2 };
            default:
                return { residential: 2, agriculture: 1 };
        }
    }
    fillGrid(grid, allowedBuildings, counts, log) {
        const shuffledCells = this.generateShuffledCellOrder();
        let index = 0;
        for (const [category, count] of Object.entries(counts)) {
            const possible = allowedBuildings.filter(b => b.category === category);
            if (possible.length === 0)
                continue;
            for (let i = 0; i < count && index < shuffledCells.length; i++) {
                const building = possible[Math.floor(Math.random() * possible.length)];
                const cell = shuffledCells[index++];
                const instances = Math.random() < 0.3 ? 2 : 1;
                for (let j = 0; j < instances; j++) {
                    grid[cell].push(building.id);
                    log.push(building.name.split(' ')[0]);
                }
            }
        }
    }
    generateShuffledCellOrder() {
        const arr = [...Array(this.GRID_SIZE).keys()];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    // --------------------------------------
    // QUALITY INDEX
    // --------------------------------------
    calculateQualityIndex(gridState) {
        const totals = this.computeResourceTotals(gridState);
        const houses = totals.population || 0;
        const totalBuildings = gridState.reduce((acc, cell) => acc + cell.length, 0);
        if (totalBuildings === 0)
            return 15;
        const power = this.calculateResourceRatio(totals.powerOutput, totals.power);
        const water = this.calculateResourceRatio(totals.waterOutput, totals.water);
        const service = this.calculateResourceRatio(totals.serviceCoverage, houses);
        const food = this.calculateResourceRatio(totals.foodProduction, houses);
        const adjusted = this.applyEmploymentPenalty(power, water, service, food, totals.employment, houses);
        const avg = (adjusted.power + adjusted.water + adjusted.service + adjusted.food) / 4;
        return Math.min(100, Math.floor(avg * 100));
    }
    computeResourceTotals(gridState) {
        const ids = gridState.flat();
        return ids.reduce((totals, id) => {
            const building = BUILDINGS.find(b => b.id === id);
            if (!building)
                return totals;
            for (const [key, value] of Object.entries(building.resources)) {
                totals[key] = (totals[key] ?? 0) + (value ?? 0);
            }
            return totals;
        }, {});
    }
    calculateResourceRatio(supply = 0, demand = 0) {
        if (demand <= 0)
            return 1;
        return Math.min(1, supply / demand);
    }
    applyEmploymentPenalty(powerRatio, waterRatio, serviceRatio, foodRatio, employed = 0, houses = 0) {
        if (employed <= houses || employed <= 0) {
            return { power: powerRatio, water: waterRatio, service: serviceRatio, food: foodRatio };
        }
        const penalty = houses / employed;
        return {
            power: powerRatio * penalty,
            water: waterRatio * penalty,
            service: serviceRatio * penalty,
            food: foodRatio * penalty,
        };
    }
}
