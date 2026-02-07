<div align="center">

# 🔥 RICER Platform
### Resilient Infrastructures and Coordinated Emergency Response

**GIS and AI-Integrated Forest Fire Management Platform for Ifrane Province, Morocco**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![MapLibre](https://img.shields.io/badge/MapLibre-GL-276DC3?logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Demo](https://ricer-project-website.vercel.app/) • [Documentation](#documentation) • [Report Bug](https://github.com/MTC-123/FireDetectionPlatform/issues) • [Request Feature](https://github.com/MTC-123/FireDetectionPlatform/issues)

</div>

---

## 🌟 Overview

RICER is a **production-ready forest fire management platform** designed specifically for Ifrane Province, Morocco. The platform integrates modern GIS technology, real-time data analytics, and AI-driven insights to reduce the impact of forest fires on critical infrastructure while enhancing coordination among emergency response stakeholders.

### Mission

To provide a centralized, data-driven platform that enables government agencies, emergency services, and civilians to collaboratively prevent, monitor, and respond to forest fire incidents in real-time.

### Key Highlights

- 🗺️ **GIS-Powered** - Interactive maps with real-time fire incident tracking using MapLibre GL
- ⚡ **Real-Time Response** - Instant fire reporting, weather monitoring, and truck deployment tracking
- 🏛️ **Multi-Agency Coordination** - Supports 16 Moroccan government departments and emergency services
- 🌍 **Multilingual** - Full Arabic (RTL) and French support for Moroccan context
- 🔒 **Secure & Role-Based** - JWT authentication with civilian and official access levels
- 📊 **Advanced Analytics** - Fire pattern analysis, cause distribution, and predictive insights
- ✅ **Fully Tested** - Comprehensive test suite with 80%+ code coverage
- 🚀 **Production-Ready** - Deployed infrastructure with Docker and Vercel support

### Impact Metrics

- **16 Government Departments** integrated for coordinated emergency response
- **Real-Time Tracking** of fire incidents, equipment, and emergency vehicles
- **80%+ Test Coverage** ensuring reliability and stability
- **Ifrane Province-Wide** coverage with localized data and infrastructure mapping

---

## ✨ Features

### For Civilians 👥

<table>
<tr>
<td width="33%">

#### 🌤️ Weather Dashboard
Real-time weather monitoring with temperature, wind speed, and wind direction for fire risk assessment

</td>
<td width="33%">

#### 🗺️ Interactive Fire Map
View all active, monitored, and resolved fire incidents with color-coded status markers

</td>
<td width="33%">

#### 📝 Fire Reporting
Report fires with map-based location selection and detailed incident information

</td>
</tr>
</table>

### For Government Officials 🏛️

All civilian features **PLUS**:

<table>
<tr>
<td width="50%">

#### 🚒 Equipment Management
- Track vehicles (VPI, trucks)
- Monitor tools and protective gear
- Manage supplies and inventory
- Fire retardant product tracking

</td>
<td width="50%">

#### 🗺️ Truck Deployment Map
- Real-time truck location tracking
- Assignment status monitoring
- Route optimization data
- Fleet management dashboard

</td>
</tr>
<tr>
<td width="50%">

#### 🧯 Retardant Inventory
- Track product quantities (liters)
- Storage location management
- Acquisition date tracking
- Stock level alerts

</td>
<td width="50%">

#### 🏗️ Infrastructure Tracking
- Water point locations
- Fire break (Tranche Pare-Feu) status
- Watchtower (Poste Vigie) monitoring
- Forest road network mapping

</td>
</tr>
</table>

#### 📊 Advanced Analytics
- 14-day incident timeline with trend analysis
- Fire cause distribution (pie charts)
- Summary statistics and KPIs
- Data visualization with Recharts

---

## 🏗️ Architecture

### Tech Stack

<table>
<tr>
<th>Category</th>
<th>Technologies</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand</td>
</tr>
<tr>
<td><strong>Maps & GIS</strong></td>
<td>MapLibre GL JS, Leaflet, React-Leaflet, OpenStreetMap</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Next.js API Routes, Prisma ORM, bcrypt, JWT</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>MongoDB Atlas</td>
</tr>
<tr>
<td><strong>APIs</strong></td>
<td>Open-Meteo (Weather), WhatsApp Business API (planned)</td>
</tr>
<tr>
<td><strong>DevOps</strong></td>
<td>Docker, Vercel, GitHub Actions (CI/CD), ESLint, Prettier</td>
</tr>
<tr>
<td><strong>Testing</strong></td>
<td>Jest, React Testing Library, Playwright (E2E)</td>
</tr>
</table>

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end

    subgraph "Application Layer"
        C[Next.js Frontend]
        D[Next.js API Routes]
        E[Authentication Middleware]
    end

    subgraph "Data Layer"
        F[MongoDB Atlas]
        G[Prisma ORM]
    end

    subgraph "External Services"
        H[Open-Meteo API]
        I[OpenStreetMap]
        J[WhatsApp API]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> G
    G --> F
    D --> H
    C --> I
    D --> J
```

### Database Schema

The platform uses 7 main collections:
- **User** - Civilians and government officials with role-based access
- **Incident** - Fire incident records with location and status
- **Report** - User-submitted fire reports
- **Equipment** - Vehicles, tools, gear, supplies (5 categories)
- **RetardantProduct** - Fire retardant inventory
- **Infrastructure** - Water points, fire breaks, watchtowers
- **TruckDeployment** - Real-time truck locations and assignments

📖 **Detailed Architecture Documentation:** [apps/web/docs/ARCHITECTURE.md](./apps/web/docs/ARCHITECTURE.md)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn** package manager

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/MTC-123/FireDetectionPlatform.git
cd FireDetectionPlatform/apps/web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# 4. Initialize the database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# 5. Start the development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

### Test Accounts

**Civilian Account:**
- CIN: `AB123456`
- Password: `password123`

**Official Account (Full Access):**
- CIN: `CD789012`
- Password: `password123`

📖 **Detailed Installation Guide:** [apps/web/INSTALLATION.md](./apps/web/INSTALLATION.md)

---

## 🇲🇦 Moroccan Context

### 16 Integrated Government Departments

The platform supports coordinated response across 16 Moroccan government departments and agencies:

| Acronym  | Department (French) | Arabic |
|----------|---------------------|--------|
| **HCEFLCD** | Haut Commissariat aux Eaux et Forêts et à la Lutte contre la Désertification | المندوبية السامية للمياه والغابات |
| **DPEFLCD** | Direction Provinciale des Eaux et Forêts et de la Lutte Contre la Désertification | المديرية الإقليمية للمياه والغابات |
| **DREFLCD** | Direction Régionale des Eaux et Forêts et de la Lutte Contre la Désertification | المديرية الجهوية للمياه والغابات |
| **FAR** | Forces Armées Royales | القوات المسلحة الملكية |
| **GR** | Gendarmerie Royale | الدرك الملكي |
| **FA** | Forces Auxiliaires | القوات المساعدة |
| **MI** | Ministère de l'Intérieur | وزارة الداخلية |
| **MET** | Ministère de l'Équipement et du Transport | وزارة التجهيز والنقل |
| **ADM** | Autoroutes du Maroc | الطرق السيارة بالمغرب |
| **ONCF** | Office National des Chemins de Fer | المكتب الوطني للسكك الحديدية |
| **ONDA** | Office National Des Aéroports | المكتب الوطني للمطارات |
| **ONEE** | Office National de l'Électricité et de l'Eau Potable | المكتب الوطني للكهرباء والماء |
| **PN** | Promotion Nationale | الإنعاش الوطني |
| **MJS** | Ministère de la Jeunesse et des Sports | وزارة الشباب والرياضة |
| **CEDEFO** | Centre de Défense des Forêts | مركز الدفاع عن الغابات |
| **CCDRF** | Centre de Conservation et de Développement des Ressources Forestières | مركز الحفاظ على الموارد الحراجية |

### Multilingual Support

- **Arabic (RTL)** - Primary language with complete right-to-left UI support
- **French** - Secondary language for official communications
- **Arabic date formatting** and cardinal directions
- **Department names** in both Arabic and French

### Ifrane Province Specifics

- Localized to Ifrane Province geography and infrastructure
- Integration with provincial forest department (DPEFLCD)
- Weather data specific to Ifrane coordinates
- Infrastructure mapping for local water points, fire breaks, and watchtowers

---

## 📚 Documentation

### Core Documentation

- **[Project Overview](./README.md)** - This file
- **[Installation Guide](./apps/web/INSTALLATION.md)** - Complete setup instructions
- **[Feature Documentation](./apps/web/README.md)** - Detailed feature descriptions
- **[Architecture](./apps/web/docs/ARCHITECTURE.md)** - System design and technical decisions

### API Documentation

All API endpoints are documented in the code with JSDoc comments. Key endpoints:

- **Authentication:** `/api/auth/signup`, `/api/auth/signin`, `/api/auth/logout`, `/api/auth/me`
- **Public Data:** `/api/weather`, `/api/incidents`, `/api/reports`, `/api/analytics`
- **Officials Only:** `/api/equipment`, `/api/reports/[id]` (PATCH)

### Testing Documentation

- **Test Suite:** Run `npm test` for unit and integration tests
- **E2E Tests:** Run `npm run test:e2e` for end-to-end tests
- **Coverage:** Generate reports with `npm run test:coverage`

---

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t ricer-platform .
docker run -p 3000:3000 --env-file .env.local ricer-platform
```

### Vercel Deployment

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` - MongoDB connection string
   - `JWT_SECRET` - Secure random string (64+ characters)
4. Deploy!

### Environment Variables

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/fire-safety"
JWT_SECRET="your-super-secure-secret-key-64-characters-minimum"
NODE_ENV="production"
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- **Unit Tests:** 80%+ coverage for utility functions and hooks
- **Integration Tests:** API routes and authentication flows
- **E2E Tests:** Critical user journeys (sign up, report fire, view analytics)

---

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and write tests
4. **Commit with conventional commits:** `git commit -m "feat: add amazing feature"`
5. **Push to your fork:** `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a clear description

### Development Guidelines

- Write TypeScript with strict mode
- Follow ESLint and Prettier configurations
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### What This Means

✅ **You can:**
- Use this project for personal or commercial purposes
- Modify and distribute the code
- Use it for research and education

❌ **You must:**
- Include the original license and copyright notice
- State any significant changes made to the code

---

## 🙏 Acknowledgments

### Built With Love For Morocco

This platform was developed to support forest fire management efforts in Ifrane Province and can be adapted for other regions facing similar challenges.

### Credits

- **GIS Data:** OpenStreetMap contributors
- **Weather Data:** Open-Meteo API
- **Moroccan Government Departments:** For domain expertise and requirements
- **Open Source Community:** For the amazing tools and libraries

### Contact

For questions, suggestions, or partnership opportunities:

- **Project Website:** [ricer-project-website.vercel.app](https://ricer-project-website.vercel.app/)
- **GitHub Issues:** [Report a bug or request a feature](https://github.com/MTC-123/FireDetectionPlatform/issues)
- **Email:** Contact through GitHub profile

---

## 🗺️ Repository Structure

```
RICER-project/
├── apps/
│   └── web/              # Next.js web application
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/
│       │   ├── lib/      # Utilities and helpers
│       │   └── types/
│       ├── prisma/       # Database schema and seed
│       └── public/       # Static assets
├── data/
│   └── gis/              # GIS datasets and QGIS projects
├── docs/                 # Project documentation
└── scripts/              # Utility scripts
```

---

<div align="center">

**Made with 🔥 for Ifrane Province, Morocco**

[⬆ Back to Top](#-ricer-platform)

</div>
