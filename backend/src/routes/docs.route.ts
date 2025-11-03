import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'City Simulation API is running 🚀',
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      cities: '/api/cities',
      buildings: '/api/buildings',
    },
  });
});

export default router;
