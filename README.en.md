# AYD MES — Manufacturing Execution System

[![CI](https://github.com/dogukanyasaraydin/AydMES/actions/workflows/ci.yml/badge.svg)](https://github.com/dogukanyasaraydin/AydMES/actions/workflows/ci.yml)
![.NET 8](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![SQLite](https://img.shields.io/badge/SQLite-EF%20Core%208-003B57?logo=sqlite)

**🌐 Live demo:** https://dogukanyasaraydin.github.io/AydMES/ — nothing to install. Pick a role from the *Quick Demo Login* buttons on the sign-in screen.
&nbsp;·&nbsp; 🇹🇷 [Türkçe README](README.md)

AYD MES is a web-based **Manufacturing Execution System** for a press-line factory. It tracks machine telemetry, OEE, downtime, die (mold) life and quality in real time. It consists of a React single-page app, an ASP.NET Core 8 REST API secured with JWT, and a SQLite database. A background simulation service generates production data as if machines were streaming it live.

> The UI is in Turkish.

![Dashboard](docs/screenshots/02-genel-bakis.webp)

## ✨ Highlights

- **Real-time monitoring:** machine state, stroke count, temperature and scrap rate, refreshed live at a configurable interval.
- **OEE analytics:** Availability × Performance × Quality, per-machine comparison and production trend charts (Recharts).
- **Digital twin:** factory floor layout in 2D top-down and 3D isometric views, colour-coded by machine status.
- **Production simulation:** a .NET `BackgroundService` adds strokes to running machines every 3 seconds, produces scrap with 4% probability and closes the work order when its target is reached.
- **Role-based access control:** 5 roles (Plant Manager, Quality Engineer, Operator…). Menus are restricted in the UI and actions in the API. Operators can read but not modify data: a single convention requires an editor role on every non-GET endpoint.
- **Security:** the JWT is carried in an httpOnly, SameSite=Strict cookie, so XSS can't steal it. Passwords are hashed with PBKDF2. Login is rate-limited (5 attempts per minute per IP). All input is validated. Production enforces HTTPS and HSTS. No secrets are stored in the repository. Every endpoint requires authentication by default.
- **Automated tests:** 17 xUnit integration tests cover authentication, role restrictions, rate limiting, input validation and the production flow, and run in CI on every push.
- **Offline mode:** if the API can't be reached, the UI detects it through timeouts and keeps working with sample data instead of hanging.
- **Reporting:** PDF report export, Excel export, light and dark themes.

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Browser["Browser — React 19 + Vite"]
        UI["Pages<br/>Dashboard · OEE · Map · Quality …"]
        FI["Fetch layer<br/>JWT header · timeouts · offline detection"]
        MOCK[("Mock data<br/>(offline mode)")]
        UI --> FI
        FI -. API down .-> MOCK
    end

    subgraph API["ASP.NET Core 8 Web API"]
        AUTH["AuthController<br/>issues JWT"]
        CTRL["13 REST controllers<br/>Machines · OEE · Downtime · Dies · Quality …"]
        SIM["UretimSimulasyonService<br/>(BackgroundService, 3 s)"]
        EF["EF Core 8 · MesDbContext"]
        AUTH --> EF
        CTRL --> EF
        SIM --> EF
    end

    DB[("SQLite<br/>(aydmes.db)")]

    FI -- "HTTP + Bearer JWT" --> AUTH
    FI -- "HTTP + Bearer JWT" --> CTRL
    EF --> DB
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Recharts, responsive CSS (light and dark themes)
- **Backend:** C# / .NET 8 Web API, Entity Framework Core 8 (code-first with migrations), JWT authentication (httpOnly cookie), rate limiting, Swagger/OpenAPI
- **Testing:** xUnit integration tests with `WebApplicationFactory` and in-memory SQLite
- **Database:** SQLite (thanks to EF Core, switching to SQL Server or PostgreSQL is a one-line change)
- **CI/CD:** GitHub Actions. Every push builds and tests the backend and lints and builds the frontend. The live demo is deployed to GitHub Pages automatically.

## 📦 Getting Started

**Requirements:** .NET 8 SDK and Node.js 20+. No database server is needed: the SQLite database (`aydmes.db`) is created with its tables and sample data on first run.

```bash
cd AydMES.Api && dotnet run
```
```bash
cd ayd-mes-ui && npm install && npm run dev
```

The API runs at `http://localhost:5139` (Swagger at `/swagger`) and the UI at `http://localhost:5173`.

**Demo accounts** (seeded on first run, passwords stored hashed): `dogukan / 123` (Software Intern), `ahmet / demo123` (Plant Manager), `ayse / demo123` (Quality Engineer), `mehmet / demo123` (Operator).

No signing key is stored in the repository. In development the API generates a random JWT key on every start, so sessions reset when it restarts. In production, provide the key via the `Jwt__Key` environment variable (at least 32 characters).

## 🤝 License
Portfolio project. The source is viewable, but the project is not open source. **All rights reserved.** You may not use, copy, redistribute or sell any part of it without permission.

*Developer:* **Doğukan Yaşar Aydın**
