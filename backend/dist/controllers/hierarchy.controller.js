import * as HierarchyService from '../services/hierarchy.service.js';
export async function getHierarchyTree(req, res, next) {
    try {
        const tree = await HierarchyService.getHierarchyTree();
        res.json(tree);
    }
    catch (err) {
        next(err);
    }
}
export async function getUserSubordinates(req, res, next) {
    try {
        const userId = Number(req.params.userId);
        const subordinates = await HierarchyService.getUserSubordinates(userId);
        res.json(subordinates);
    }
    catch (err) {
        next(err);
    }
}
export async function getAllowedBuildings(req, res, next) {
    try {
        const userId = Number(req.params.userId);
        const allowedBuildings = await HierarchyService.getAllowedBuildings(userId);
        res.json(allowedBuildings);
    }
    catch (err) {
        next(err);
    }
}
