import * as AuthService from '../services/auth.service.js';
import { registerRefined } from '../validators/auth.validator.js';
export async function register(req, res, next) {
    try {
        // validate mayor-specific requirements
        registerRefined.parse(req.body);
        const payload = await AuthService.register(req.body);
        res.status(201).json(payload);
    }
    catch (err) {
        next(err);
    }
}
export async function login(req, res, next) {
    try {
        const { username, email, password } = req.body;
        const payload = await AuthService.login({ username, email, password });
        res.json(payload);
    }
    catch (err) {
        next(err);
    }
}
