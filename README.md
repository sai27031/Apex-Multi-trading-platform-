## Project Structure

```
apex-multi-trading/
├── backend/
│   ├── models/
│   │   ├── ClientPortfolio.js       # Client profiles, cash margins & stock holdings
│   │   ├── IPORecord.js             # Upcoming & active IPO records with GMP tracking
│   │   ├── MarketNews.js            # Live corporate news & sector sentiment
│   │   ├── OrderRecord.js           # Executed & pending order books
│   │   └── StockPick.js             # Quantitative strategy recommendations
│   ├── routes/
│   │   ├── aiRoutes.js              # Apex quantitative advisor API
│   │   ├── clientRoutes.js          # Client CRUD & portfolio recalculations
│   │   ├── ipoRoutes.js             # IPO central API
│   │   ├── newsRoutes.js            # Corporate news feeds API
│   │   └── tradingRoutes.js         # Order routing & ticker management
│   ├── seeds/
│   │   └── seedData.js              # 20+ pre-populated client portfolios & holdings
│   ├── services/
│   │   └── realMarketService.js     # Live market quote synchronization
│   ├── package.json
│   └── server.js                    # Express server entry point & WebSocket engine
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedAmount.jsx       # Real-time jumping numbers with emerald/rose flashes
│   │   │   ├── AuthModal.jsx            # Sign In / Sign Up authentication modal
│   │   │   ├── FloatingAiDrawer.jsx     # Apex Strategy Advisor chat drawer
│   │   │   ├── FnOTrading.jsx           # Institutional Option Chain & Futures Desk
│   │   │   ├── Header.jsx               # Top navigation bar & Live Dalal Street marquee
│   │   │   ├── IpoCentral.jsx           # IPO listings, GMP indicators & subscription stats
│   │   │   ├── LandingPage.jsx          # Animated entrance landing page
│   │   │   ├── MarketNews.jsx           # Real-time corporate news & sector sentiment
│   │   │   ├── MultiClientPortfolio.jsx # Single-pane 20+ client wealth management
│   │   │   └── TradingTerminal.jsx      # Candlestick studio, depth ladder & order ticket
│   │   ├── data/
│   │   │   └── initialData.js           # Fallback datasets for offline resilience
│   │   ├── services/
│   │   │   └── api.js                  # Axios client services
│   │   ├── utils/
│   │   │   └── clientCalc.js            # Pure portfolio calculation engine (Buy/Sell math)
│   │   ├── App.jsx                      # Root container & view controller
│   │   ├── index.css                    # Professional dark theme styles & animations
│   │   └── main.jsx                     # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md                            # Complete setup & deployment guide
├── PROJECT_DOCUMENTATION.md             # Complete technical specification
├── package.json                         # Master workspace package
└── start.sh                             # 1-Click launcher script (Starts backend + frontend)
```
