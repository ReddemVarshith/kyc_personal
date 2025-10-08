# AI-Driven KYC Verification System

An advanced identity verification system for BFSI sector, leveraging AI technologies for KYC and AML compliance.

## Features

- AI-powered document verification
- Automated address validation
- Real-time identity checks
- Compliance reporting
- Fraud detection
- Integration with Azure OpenAI

## Tech Stack

- Frontend: React with Material-UI
- Backend: FastAPI (Python)
- AI/ML: Azure OpenAI, Computer Vision, GNN, NLP
- Authentication: JWT

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
kyc-verification-system/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── context/        # React context
│   ├── utils/          # Utility functions
│   └── App.jsx         # Root component
├── public/             # Static assets
└── backend/           # Python FastAPI backend
```