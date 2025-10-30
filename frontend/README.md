Frontend (Next.js + Styled Components)

Usage:

1. cd frontend
2. npm install
3. NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev

Notes:
- Basic auth flow: POST /auth/login returns { token, user }
- Token is stored in localStorage and used by axios for subsequent requests
