
# 🎨 Mosaical - NFT Lending Platform

## 📋 Overview

Mosaical is a decentralized NFT lending platform that allows users to use their NFTs as collateral to borrow DPSV tokens. The platform integrates AI-powered price prediction, real-time analytics, and DPO (Decentralized Public Offering) features.

## ✨ Features

- **NFT Vault Management**: Deposit and manage NFT collections as collateral
- **Lending & Borrowing**: Borrow DPSV tokens against NFT collateral
- **AI Price Prediction**: Machine learning models for NFT price forecasting
- **Real-time Analytics**: Market data visualization and portfolio tracking
- **DPO Panel**: Decentralized public offering management
- **Multi-language Support**: English and Vietnamese language support
- **Web3 Integration**: MetaMask and wallet connectivity

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React + TypeScript App]
        B[Web3 Context]
        C[Language Context]
        D[UI Components]
    end
    
    subgraph "Backend Layer"
        E[Node.js Express Server]
        F[Socket.io WebSocket]
        G[Web3 Service]
        H[Indexer Service]
    end
    
    subgraph "AI Layer"
        I[Python AI API]
        J[NFT Price Predictor]
        K[Data Scraper]
        L[ML Models]
    end
    
    subgraph "Data Layer"
        M[PostgreSQL Database]
        N[JSON Prediction Files]
        O[CSV Datasets]
    end
    
    subgraph "External APIs"
        P[CoinGecko API]
        Q[Blockchain RPC]
        R[NFT Marketplaces]
    end
    
    A --> E
    A --> B
    B --> G
    E --> F
    E --> H
    E --> M
    I --> J
    I --> K
    J --> L
    J --> N
    K --> O
    K --> P
    G --> Q
    H --> R
    
    style A fill:#4f46e5
    style E fill:#059669
    style I fill:#dc2626
    style M fill:#7c3aed
```

## 🎯 Use Case Diagram - Overall System

```mermaid
graph TD
    subgraph "Actors"
        U1[NFT Owner]
        U2[Borrower]
        U3[Lender]
        U4[DPO Investor]
        U5[Admin]
    end
    
    subgraph "Core Use Cases"
        UC1[Connect Wallet]
        UC2[Deposit NFT]
        UC3[Withdraw NFT]
        UC4[Borrow DPSV]
        UC5[Repay Loan]
        UC6[View Analytics]
        UC7[Predict Prices]
        UC8[Participate in DPO]
        UC9[Manage Portfolio]
        UC10[Monitor Health Factor]
    end
    
    U1 --> UC1
    U1 --> UC2
    U1 --> UC3
    U2 --> UC4
    U2 --> UC5
    U2 --> UC10
    U3 --> UC6
    U3 --> UC7
    U4 --> UC8
    U5 --> UC9
    
    UC2 --> UC4
    UC4 --> UC5
    UC6 --> UC7
    
    style U1 fill:#3b82f6
    style U2 fill:#10b981
    style U3 fill:#f59e0b
    style U4 fill:#ef4444
    style U5 fill:#8b5cf6
```

## 🏛️ Module Use Case Diagrams

### NFT Vault Module

```mermaid
graph TD
    subgraph "NFT Vault Actors"
        A1[NFT Owner]
        A2[Smart Contract]
    end
    
    subgraph "NFT Vault Use Cases"
        V1[View NFT Collection]
        V2[Deposit NFT to Vault]
        V3[Withdraw NFT from Vault]
        V4[Check NFT Valuation]
        V5[Approve NFT Transfer]
        V6[Update NFT Metadata]
    end
    
    A1 --> V1
    A1 --> V2
    A1 --> V3
    A1 --> V4
    A2 --> V5
    A2 --> V6
    
    V2 --> V5
    V4 --> V2
```

### Lending Module

```mermaid
graph TD
    subgraph "Lending Actors"
        L1[Borrower]
        L2[Loan Contract]
        L3[Oracle Service]
    end
    
    subgraph "Lending Use Cases"
        LC1[Calculate Loan Amount]
        LC2[Create Loan Request]
        LC3[Approve Loan]
        LC4[Disburse Funds]
        LC5[Monitor Health Factor]
        LC6[Liquidate Position]
        LC7[Repay Loan]
        LC8[Calculate Interest]
    end
    
    L1 --> LC1
    L1 --> LC2
    L1 --> LC7
    L2 --> LC3
    L2 --> LC4
    L2 --> LC6
    L3 --> LC5
    L3 --> LC8
    
    LC1 --> LC2
    LC2 --> LC3
    LC3 --> LC4
    LC5 --> LC6
```

### AI Prediction Module

```mermaid
graph TD
    subgraph "AI Actors"
        AI1[Data Scientist]
        AI2[ML Models]
        AI3[External APIs]
    end
    
    subgraph "AI Use Cases"
        AI4[Scrape NFT Data]
        AI5[Process Market Data]
        AI6[Train ML Models]
        AI7[Generate Predictions]
        AI8[Validate Model Performance]
        AI9[Update Price Forecasts]
        AI10[Serve Prediction API]
    end
    
    AI1 --> AI4
    AI1 --> AI6
    AI1 --> AI8
    AI2 --> AI7
    AI2 --> AI9
    AI3 --> AI5
    AI3 --> AI10
    
    AI4 --> AI5
    AI5 --> AI6
    AI6 --> AI7
    AI7 --> AI9
```

## 🎨 Class Diagram

```mermaid
classDiagram
    class User {
        +String address
        +String nonce
        +Date createdAt
        +Date updatedAt
        +connectWallet()
        +signMessage()
        +authenticate()
    }
    
    class NFT {
        +String tokenId
        +String contractAddress
        +String ownerAddress
        +String collectionName
        +String tokenName
        +String tokenUri
        +Object metadata
        +Boolean deposited
        +Number valueEth
        +deposit()
        +withdraw()
        +updateValue()
    }
    
    class Loan {
        +String loanId
        +String userAddress
        +Number nftId
        +Number borrowedAmount
        +Number collateralValue
        +Number interestRate
        +Number healthFactor
        +Number ltv
        +Date createdAt
        +createLoan()
        +repayLoan()
        +liquidate()
        +calculateHealthFactor()
    }
    
    class Prediction {
        +String collectionId
        +Array futurePredictons
        +Object modelPerformance
        +Date timestamp
        +generatePrediction()
        +updateModel()
        +validateAccuracy()
    }
    
    class Transaction {
        +String txHash
        +String userAddress
        +String type
        +Number amount
        +String status
        +Date timestamp
        +processTransaction()
        +validateTransaction()
        +updateStatus()
    }
    
    class DPOProject {
        +String projectId
        +String name
        +String description
        +Number targetAmount
        +Number raisedAmount
        +Date startDate
        +Date endDate
        +String status
        +createProject()
        +invest()
        +closeProject()
    }
    
    User ||--o{ NFT : owns
    User ||--o{ Loan : borrows
    User ||--o{ Transaction : makes
    User ||--o{ DPOProject : invests
    NFT ||--|| Loan : collateralizes
    Loan ||--o{ Transaction : generates
    Prediction ||--o{ NFT : predicts
```

## 🗃️ Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        varchar address PK
        varchar nonce
        timestamp created_at
        timestamp updated_at
    }
    
    NFTS {
        serial id PK
        varchar token_id
        varchar contract_address
        varchar owner_address FK
        varchar collection_name
        varchar token_name
        text token_uri
        jsonb metadata
        boolean deposited
        timestamp deposited_at
        decimal value_eth
        timestamp created_at
        timestamp updated_at
    }
    
    LOANS {
        serial id PK
        varchar loan_id UK
        varchar user_address FK
        integer nft_id FK
        decimal borrowed_amount
        decimal collateral_value
        decimal interest_rate
        decimal health_factor
        decimal ltv
        varchar status
        timestamp due_date
        timestamp created_at
        timestamp updated_at
    }
    
    TRANSACTIONS {
        serial id PK
        varchar tx_hash UK
        varchar user_address FK
        varchar type
        decimal amount
        varchar currency
        varchar status
        timestamp timestamp
        jsonb metadata
    }
    
    PREDICTIONS {
        serial id PK
        varchar collection_id
        jsonb future_predictions
        jsonb model_performance
        timestamp timestamp
        timestamp created_at
    }
    
    DPO_PROJECTS {
        serial id PK
        varchar project_id UK
        varchar name
        text description
        decimal target_amount
        decimal raised_amount
        timestamp start_date
        timestamp end_date
        varchar status
        timestamp created_at
    }
    
    DPO_INVESTMENTS {
        serial id PK
        varchar project_id FK
        varchar investor_address FK
        decimal amount
        timestamp invested_at
    }
    
    USERS ||--o{ NFTS : owns
    USERS ||--o{ LOANS : borrows
    USERS ||--o{ TRANSACTIONS : makes
    USERS ||--o{ DPO_INVESTMENTS : invests
    NFTS ||--|| LOANS : secures
    LOANS ||--o{ TRANSACTIONS : generates
    DPO_PROJECTS ||--o{ DPO_INVESTMENTS : receives
```

## 🔄 Functional Flow Diagram

```mermaid
flowchart TD
    A[User Connects Wallet] --> B{Wallet Connected?}
    B -->|No| A
    B -->|Yes| C[Browse NFT Collections]
    
    C --> D[Select NFT to Deposit]
    D --> E[Approve NFT Transfer]
    E --> F[Deposit NFT to Vault]
    F --> G[NFT Valuation via AI]
    
    G --> H[Calculate Max Loan Amount]
    H --> I[User Requests Loan]
    I --> J{Health Factor > 1.2?}
    
    J -->|No| K[Reject Loan Request]
    J -->|Yes| L[Create Loan Contract]
    L --> M[Disburse DPSV Tokens]
    
    M --> N[Monitor Loan Health]
    N --> O{Health Factor < 1.1?}
    O -->|Yes| P[Liquidation Warning]
    O -->|No| Q[Continue Monitoring]
    
    P --> R{User Repays?}
    R -->|Yes| S[Update Health Factor]
    R -->|No| T[Liquidate NFT]
    
    S --> Q
    T --> U[Auction NFT]
    U --> V[Settle Debt]
    
    Q --> W[User Repays Loan]
    W --> X[Return NFT to User]
    
    style A fill:#4f46e5
    style G fill:#dc2626
    style M fill:#059669
    style T fill:#ef4444
```

## 📊 Data Flow Diagram

```mermaid
flowchart LR
    subgraph "External Data Sources"
        A[CoinGecko API]
        B[Blockchain Networks]
        C[NFT Marketplaces]
    end
    
    subgraph "Data Collection Layer"
        D[Data Scraper]
        E[Blockchain Indexer]
        F[Price Aggregator]
    end
    
    subgraph "Processing Layer"
        G[Data Preprocessor]
        H[Feature Engineer]
        I[ML Pipeline]
    end
    
    subgraph "Storage Layer"
        J[Raw Data Storage]
        K[Processed Data]
        L[Model Storage]
        M[Prediction Cache]
    end
    
    subgraph "API Layer"
        N[REST API]
        O[WebSocket API]
        P[AI Prediction API]
    end
    
    subgraph "Frontend"
        Q[React Dashboard]
        R[Real-time Charts]
        S[User Interface]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> G
    F --> G
    
    G --> H
    H --> I
    
    G --> J
    H --> K
    I --> L
    I --> M
    
    J --> N
    K --> N
    L --> P
    M --> P
    
    N --> O
    P --> O
    
    O --> Q
    Q --> R
    Q --> S
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 16+
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mosaical-nft-lending
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

4. **Install AI dependencies:**
```bash
cd ai
pip install -r requirements.txt
cd ..
```

5. **Setup environment variables:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

6. **Setup database:**
```bash
cd backend
npm run migrate
cd ..
```

### Running the Application

**Development Mode (Full Stack + AI):**
```bash
npm run dev
```

This will start:
- Frontend on port 3001
- Backend API on port 3001
- AI API on port 5000

## 🚀 Deployment

The application is configured for Replit deployment:

1. **Build the application:**
```bash
npm run build
```

2. **Deploy via Replit:**
- Click the "Deploy" button in Replit
- Configure environment variables
- Deploy to autoscale

## 📁 Project Structure

```
mosaical-nft-lending/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Web3, Language)
│   ├── pages/             # Main application pages
│   └── lib/               # Utility functions
├── backend/               # Node.js backend API
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── config/            # Configuration files
│   └── utils/             # Backend utilities
├── ai/                    # Python AI/ML services
│   ├── datasets/          # Training data
│   ├── models/            # Trained ML models
│   └── predictions/       # Generated predictions
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Web3 authentication
- `POST /api/auth/nonce` - Get nonce for signing

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/balance` - Get DPSV balance

### NFT Operations
- `GET /api/nfts` - List user NFTs
- `POST /api/nfts/deposit` - Deposit NFT
- `POST /api/nfts/withdraw` - Withdraw NFT
- `GET /api/nfts/valuation/:id` - Get NFT valuation

### Lending
- `POST /api/loans/create` - Create new loan
- `GET /api/loans` - List user loans
- `POST /api/loans/repay` - Repay loan
- `GET /api/loans/health/:id` - Check health factor

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/portfolio` - Portfolio analytics
- `GET /api/analytics/market` - Market data

### AI Predictions
- `GET /api/predictions/:collection` - Get price predictions
- `GET /api/predictions/all` - Get all predictions
- `POST /api/predictions/refresh` - Refresh predictions

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Run AI model tests
cd ai
python -m pytest tests/
```

## 📋 TODO List

### ✅ Completed Features
- [x] Basic React frontend with TypeScript
- [x] Web3 wallet integration (MetaMask)
- [x] Multi-language support (EN/VI)
- [x] NFT vault interface
- [x] Loan management interface
- [x] AI price prediction integration
- [x] Real-time analytics dashboard
- [x] DPO panel interface
- [x] Backend API with Express.js
- [x] PostgreSQL database integration
- [x] AI/ML price prediction models
- [x] CoinGecko API integration
- [x] Socket.io for real-time updates
- [x] DPSV token conversion

### 🚧 In Progress
- [ ] Smart contract integration
- [ ] Blockchain transaction processing
- [ ] Advanced ML model optimization
- [ ] Mobile responsive design improvements

### 📅 Planned Features

#### Phase 1: Core Infrastructure
- [ ] Smart contract deployment on Saga
- [ ] Automated liquidation system
- [ ] Advanced portfolio analytics
- [ ] Mobile app development

#### Phase 2: Advanced Features
- [ ] Cross-chain NFT support
- [ ] Yield farming integration
- [ ] DAO governance implementation
- [ ] Advanced trading features

#### Phase 3: Enterprise Features
- [ ] Institutional lending
- [ ] Insurance protocol integration
- [ ] Advanced risk management
- [ ] Regulatory compliance tools

#### Phase 4: Ecosystem Expansion
- [ ] NFT marketplace integration
- [ ] DeFi protocol partnerships
- [ ] Layer 2 scaling solutions
- [ ] Cross-platform compatibility

### 🐛 Known Issues
- [ ] Price prediction accuracy needs improvement
- [ ] UI responsiveness on mobile devices
- [ ] Socket.io connection stability
- [ ] Database query optimization needed

### 🔧 Technical Improvements
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting
- [ ] Add API documentation with Swagger
- [ ] Improve test coverage (target: 80%+)
- [ ] Add performance monitoring
- [ ] Implement caching strategy
- [ ] Add CI/CD pipeline
- [ ] Security audit and penetration testing

### 🎨 UI/UX Improvements
- [ ] Dark/light theme toggle
- [ ] Improved loading states
- [ ] Better error messages
- [ ] Accessibility improvements
- [ ] Animation and micro-interactions
- [ ] Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@mosaical.io

## 🙏 Acknowledgments

- CoinGecko for NFT market data
- Saga blockchain for infrastructure
- OpenZeppelin for smart contract standards
- React and TypeScript communities

---

Built with ❤️ by the Mosaical Team
