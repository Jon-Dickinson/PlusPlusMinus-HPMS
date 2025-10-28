// backend/src/routes/auth.route.ts

import { Router } from 'express';
// Note: We will add imports for controllers here later, but keep the file clean for now.

const router = Router();

// Example route placeholder
router.get('/test', (req, res) => {
    res.send('Auth Router is working.');
});

// Future routes for registration and login will go here:
// router.post('/register', validationMiddleware, authController.register);
// router.post('/login', validationMiddleware, authController.login);


// Crucial for ES module compatibility (NodeNext requires the export)
export default router;
