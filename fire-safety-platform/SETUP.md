# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Setup MongoDB**

Make sure you have MongoDB running. You can use:
- Local MongoDB (default connection string works)
- MongoDB Atlas (cloud - update DATABASE_URL in .env.local)

3. **Initialize Database**
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open Browser**
Navigate to http://localhost:3000

## Test Credentials

- Civilian: CIN `AB123456` / Password `password123`
- Official: CIN `CD789012` / Password `password123`

## Project Structure

I'll now create all the source files for you...
