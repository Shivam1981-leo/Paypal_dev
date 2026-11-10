# PayGuard AI - Implementation Phases

**Project Duration:** 8 weeks  
**Team Size:** 3-5 developers  
**Last Updated:** November 4, 2026

---

## Overview

This document breaks down the PayGuard AI implementation into 5 distinct phases, each with clear objectives, deliverables, and success criteria.

---

## Phase 0: Pre-Development Setup (Week 1)

**Objective:** Establish infrastructure, development environment, and project foundations.

### Tasks

#### Infrastructure Setup (Days 1-2)
- [ ] Create Render account and configure deployment environments (staging/production)
- [ ] Set up PostgreSQL 15 database on Render
  - Create schemas: `merchants`, `transactions`, `risk_scores`, `ml_features`
  - Configure monthly partitioning on transactions table
  - Set up B-tree indices on `transaction_id`, `merchant_id`, `timestamp`
- [ ] Deploy Redis 7.0 instance for caching
- [ ] Set up Elastic Stack 8.x cluster (Sponsor)
  - Create indices: `fraud_patterns`, `denied_transactions`, `account_freezes`
  - Configure Elastic ML for anomaly detection
- [ ] Configure environment variables and secrets management
- [ ] Set up GitHub repository with CI/CD pipeline

#### Development Environment (Days 3-4)
- [ ] Initialize Next.js 14 project (App Router)
  - Configure TypeScript, ESLint, Prettier
  - Set up Tailwind CSS + shadcn/ui
  - Install AG Grid (Sponsor), Bryntum (Sponsor), Chart.js
- [ ] Initialize Fastify backend project
  - Configure TypeScript
  - Set up API routing structure
  - Install Postman (Sponsor) for API documentation
- [ ] Initialize Python ML project
  - Set up virtual environment
  - Install XGBoost, scikit-learn, pandas, TensorFlow
- [ ] Configure local development with Docker Compose
  - PostgreSQL container
  - Redis container
  - Elastic container

#### PayPal Sandbox Setup (Days 5-7)
- [ ] Create PayPal Developer account
- [ ] Generate sandbox API credentials (Client ID, Secret)
- [ ] Create test buyer and merchant accounts
- [ ] Test OAuth 2.0 authentication flow
- [ ] Verify JavaScript SDK v6 integration
- [ ] Test basic order creation and capture in sandbox

### Deliverables
- ✅ Fully configured cloud infrastructure
- ✅ Local development environment
- ✅ PayPal sandbox integration working
- ✅ Project repositories with CI/CD

### Success Criteria
- [ ] Can create and capture PayPal order in sandbox
- [ ] Database accessible from backend
- [ ] Redis cache operational
- [ ] Elastic cluster accepting data

---

## Phase 1: Core Foundation (Weeks 2-3)

**Objective:** Build core backend services, PayPal integration, and basic frontend.

### Week 2: Backend Core

#### PayPal Service Layer (Days 8-10)
- [ ] Implement OAuth 2.0 token management
  - Auto-refresh tokens before expiration
  - Secure credential storage
- [ ] Build PayPal API service wrapper (`paypal.service.ts`)
  - Create Order API
  - Capture Order API
  - Get Order Details API
  - Transaction Search API
- [ ] Implement webhook endpoint
  - Signature verification
  - Event routing
  - Retry logic for failed webhooks
- [ ] Set up webhook subscriptions for critical events:
  - `PAYMENT.CAPTURE.DENIED`
  - `PAYMENT.CAPTURE.PENDING`
  - `CUSTOMER.DISPUTE.CREATED`
  - `RISK.DISPUTE.CREATED`
- [ ] Write integration tests using PayPal sandbox

#### Database Models & API Routes (Days 11-12)
- [ ] Define database schemas
  ```sql
  merchants: id, name, email, api_key, industry_category, created_at
  transactions: id, merchant_id, buyer_email, amount, status, risk_score, created_at
  risk_scores: id, transaction_id, overall_score, ml_score, pattern_score, flags
  ml_features: id, transaction_id, feature_name, feature_value
  ```
- [ ] Build RESTful API endpoints
  - `POST /api/v1/merchants/register`
  - `POST /api/v1/risk-check`
  - `GET /api/v1/transactions/:merchant_id`
  - `POST /api/v1/webhooks/paypal`
- [ ] Implement API authentication (JWT tokens)
- [ ] Set up rate limiting and request validation

#### Redis Caching Layer (Day 13-14)
- [ ] Implement cache service (`redis.client.ts`)
- [ ] Cache strategies:
  - Device reputation scores (24h TTL)
  - Buyer risk profiles (1h TTL)
  - Merchant statistics (6h TTL)
- [ ] Cache invalidation logic

### Week 3: Frontend Foundation

#### Merchant Dashboard (Days 15-17)
- [ ] Build authentication flow (login/signup)
- [ ] Create dashboard layout
  - Navigation sidebar
  - Account health score widget
  - Transaction volume graph (Chart.js)
  - Real-time risk distribution pie chart
- [ ] Implement transaction list with AG Grid (Sponsor)
  - Filtering by risk category
  - Sorting by date, amount, risk score
  - Pagination
  - Export to CSV
- [ ] Add merchant onboarding flow
  - Business information form
  - Industry category selection
  - API key generation
  - Integration instructions

#### Real-Time Updates (Days 18-19)
- [ ] Set up WebSocket server (Fastify WebSocket plugin)
- [ ] Implement real-time risk score updates
- [ ] Build notification system
  - High-risk transaction alerts
  - Account health warnings
  - Webhook event notifications

#### Integration Widget (Days 20-21)
- [ ] Build JavaScript SDK for merchant websites
  ```javascript
  <script src="https://cdn.payguard.ai/v1/widget.js"></script>
  ```
- [ ] Device fingerprinting service
  - Browser fingerprint collection
  - IP address capture
  - VPN/Tor detection
- [ ] Session behavior tracking
  - Time on site
  - Pages visited
  - Mouse movement patterns
  - Form fill speed

### Deliverables
- ✅ Complete backend API with PayPal integration
- ✅ Working merchant dashboard
- ✅ Device fingerprinting widget
- ✅ Real-time WebSocket updates

### Success Criteria
- [ ] Can create merchant account and generate API key
- [ ] PayPal webhook events successfully received and processed
- [ ] Dashboard displays live transaction data
- [ ] Widget collects device fingerprint data

---

## Phase 2: AI/ML Risk Engine (Weeks 4-5)

**Objective:** Build and deploy the machine learning fraud detection system.

### Week 4: Feature Engineering & Data Collection

#### Feature Extraction Service (Days 22-24)
- [ ] Implement `TransactionFeatureExtractor` class (Python)
  - **Velocity features:** tx_count_1h, tx_count_24h, tx_count_7d
  - **Amount features:** amount_zscore, amount_deviation_pct
  - **Geographic features:** geo_ip_billing_distance, geo_country_mismatch
  - **Device features:** device_reputation_score, vpn_detected, device_age_hours
  - **Behavioral features:** time_on_site, checkout_speed, form_fill_speed
  - **Account features:** account_age_days, email_domain_reputation, previous_disputes
  - **Cart features:** cart_item_count, digital_items_ratio, high_risk_items_count
  - **Temporal features:** hour_of_day, day_of_week, is_weekend
  - **Merchant features:** merchant_chargeback_rate, merchant_freeze_history
- [ ] Build feature calculation pipeline
  - Async processing for heavy computations
  - Feature caching in Redis
- [ ] Create feature validation tests

#### Training Data Generation (Days 25-26)
- [ ] Create synthetic fraud dataset
  - Generate 10,000 legitimate transactions
  - Generate 1,000 fraudulent transactions (10% fraud rate)
  - Ensure realistic feature distributions
- [ ] Historical PayPal data collection
  - Use Transaction Search API to fetch merchant history
  - Label transactions based on disputes and denials
- [ ] Data preprocessing
  - Handle missing values
  - Feature normalization
  - Train/test split (80/20)

#### Elastic Pattern Matching (Day 27-28)
- [ ] Index historical fraud patterns in Elastic
- [ ] Implement similarity search
  - More-like-this queries
  - Cross-merchant intelligence
  - PayPal freeze pattern correlation
- [ ] Build pattern scoring algorithm

### Week 5: Model Training & Deployment

#### XGBoost Model Training (Days 29-31)
- [ ] Implement `FraudModelTrainer` class
- [ ] Configure XGBoost hyperparameters
  ```python
  n_estimators=200,
  max_depth=8,
  learning_rate=0.05,
  scale_pos_weight=10  # Handle class imbalance
  ```
- [ ] Train with 5-fold cross-validation
- [ ] Evaluate model performance
  - AUC-ROC target: >0.90
  - Precision at 0.7 threshold: >85%
  - False positive rate target: <1%
- [ ] Feature importance analysis
- [ ] Export model to TensorFlow.js and ONNX formats

#### Real-Time Inference Engine (Days 32-34)
- [ ] Build `RiskEngineService` (TypeScript)
- [ ] Load trained model into Node.js
  - Use TensorFlow.js for browser-side inference
  - Use ONNX Runtime for server-side inference
- [ ] Implement risk scoring pipeline
  1. Extract features from transaction
  2. ML model prediction (60% weight)
  3. Pattern matching score (25% weight)
  4. Device reputation score (15% weight)
  5. Weighted average = overall risk score
- [ ] Performance optimization
  - Target: <100ms latency
  - Parallel feature extraction
  - Redis caching
- [ ] Load testing (1,000 requests/second)

#### Risk Categorization & Actions (Days 35)
- [ ] Implement three-tier risk system
  - **GREEN (0.0-0.3):** Proceed to PayPal
  - **YELLOW (0.3-0.7):** Additional authentication required
  - **RED (0.7-1.0):** Block or reroute to alternative gateway
- [ ] Build risk flag identification
  - HIGH_VELOCITY_1H
  - GEOGRAPHIC_MISMATCH
  - VPN_DETECTED
  - LOW_DEVICE_REPUTATION
  - SUSPICIOUSLY_FAST_CHECKOUT
  - NEW_ACCOUNT
  - DISPUTE_HISTORY
- [ ] Implement explainable AI
  - SHAP values for feature importance
  - Human-readable risk explanations

### Deliverables
- ✅ Trained XGBoost model with >90% AUC-ROC
- ✅ Real-time inference engine (<100ms latency)
- ✅ Feature extraction pipeline
- ✅ Elastic pattern matching system

### Success Criteria
- [ ] Model achieves <1% false positive rate
- [ ] Inference completes in <100ms
- [ ] Can process 1,000 transactions/second
- [ ] Risk explanations are human-readable

---

## Phase 3: Integration & Feedback Loop (Week 6)

**Objective:** Connect all components and implement continuous learning system.

### End-to-End Transaction Flow (Days 36-38)
- [ ] Integrate risk engine with PayPal checkout
  1. Buyer initiates checkout on merchant site
  2. PayGuard widget collects device fingerprint
  3. Backend extracts features and calculates risk score
  4. Based on risk category:
     - GREEN: Create PayPal order immediately
     - YELLOW: Request additional verification (email/SMS)
     - RED: Block or offer alternative payment method
  5. Transaction outcome recorded for feedback loop
- [ ] Test complete flow in PayPal sandbox
- [ ] Handle edge cases
  - Network timeouts
  - PayPal API errors
  - Redis cache misses

### Webhook Feedback Loop (Days 39-40)
- [ ] Process PayPal webhook events
  - `PAYMENT.CAPTURE.DENIED` → Update ML training data (true positive)
  - `CUSTOMER.DISPUTE.CREATED` → Flag transaction as fraud (delayed label)
  - `PAYMENT.CAPTURE.COMPLETED` → Confirm transaction success
- [ ] Update Elastic indices with outcomes
- [ ] Feed outcomes back to ML training pipeline

### Continuous Learning System (Days 41-42)
- [ ] Implement nightly model retraining
  - Fetch last 90 days of labeled transactions
  - Retrain XGBoost model
  - Validate on hold-out test set
  - Deploy to production only if accuracy improves
- [ ] Build model drift detection
  - Monitor prediction accuracy over time
  - Alert if false positive rate exceeds 1.5%
- [ ] Implement A/B testing framework
  - Test different risk thresholds (0.3/0.7 vs 0.2/0.6 vs 0.4/0.8)
  - Track metrics: FP rate, fraud catch rate, merchant satisfaction
  - Auto-adopt best performing variant after 30 days

### Deliverables
- ✅ End-to-end transaction flow working
- ✅ Webhook feedback loop operational
- ✅ Nightly model retraining pipeline
- ✅ A/B testing framework

### Success Criteria
- [ ] Can complete full transaction flow in sandbox
- [ ] Webhook events update ML training data
- [ ] Model retrains successfully every night
- [ ] A/B tests track performance metrics

---

## Phase 4: Dashboard Enhancement & Analytics (Week 7)

**Objective:** Build advanced visualizations, analytics, and merchant tools.

### Advanced Visualizations (Days 43-45)
- [ ] Integrate Bryntum Scheduler (Sponsor)
  - Timeline view of transaction patterns
  - Visualize fraud waves and velocity spikes
  - Highlight account freeze risk periods
- [ ] Build risk trend charts (Chart.js)
  - 30-day rolling average risk score
  - Transaction volume by risk category
  - False positive rate over time
- [ ] Create account health dashboard
  - Overall health score (0-100)
  - Chargeback ratio trend
  - Freeze risk indicator
  - Comparison to industry benchmarks

### Manual Review Queue (Days 46-47)
- [ ] Build review interface for YELLOW transactions
  - Display transaction details
  - Show risk score breakdown
  - List all risk flags with explanations
  - Provide approve/decline buttons
- [ ] Implement merchant feedback system
  - Merchants can mark false positives
  - Notes field for manual review decisions
  - Feedback feeds back to ML model
- [ ] Create bulk review actions
  - Approve/decline multiple transactions
  - Whitelist trusted buyers
  - Blacklist known fraudsters

### Alert & Notification System (Days 48-49)
- [ ] Integrate Zapier (Sponsor) for automation
  - High-risk transaction alerts → Email/Slack
  - Account health warnings → Email
  - Daily summary reports → Email
- [ ] Build in-dashboard notifications
  - Real-time alerts for RED transactions
  - Weekly performance summaries
  - Model retraining completion notices

### False Positive Optimization (Day 50)
- [ ] Implement `FalsePositiveDetector` service
  - Daily analysis of flagged transactions
  - Identify common false positive patterns
  - Adjust risk thresholds dynamically
- [ ] Build mitigation strategies
  - Gift purchase detection (reduce score 30%)
  - Business purchase detection (reduce score 20%)
  - Known good customer whitelist (reduce score 40%)
- [ ] Create "What-if" simulator
  - Let merchants test: "What if buyer verified phone?"
  - Show how risk score would change

### Deliverables
- ✅ Advanced dashboard with Bryntum timeline
- ✅ Manual review queue for edge cases
- ✅ Zapier-powered alert system
- ✅ False positive mitigation system

### Success Criteria
- [ ] Dashboard displays 30-day risk trends
- [ ] Merchants can manually review YELLOW transactions
- [ ] Alerts trigger on high-risk events
- [ ] False positive rate drops below 1%

---

## Phase 5: Polish, Testing & Launch Prep (Week 8)

**Objective:** Security audit, performance optimization, documentation, and demo preparation.

### Security & Compliance (Days 51-52)
- [ ] Security audit
  - API authentication and authorization
  - PayPal webhook signature verification
  - SQL injection prevention
  - XSS protection
  - Rate limiting
- [ ] Privacy compliance (GDPR/CCPA)
  - Implement data anonymization
  - Hash buyer emails and device IDs before storage
  - Add data retention policy (delete raw data after 90 days)
  - Create privacy policy and terms of service
- [ ] Penetration testing
  - Test for common vulnerabilities
  - Load testing (10,000 transactions/minute)
  - DDoS protection

### Performance Optimization (Days 53-54)
- [ ] Database query optimization
  - Analyze slow queries
  - Add missing indices
  - Implement connection pooling
- [ ] Caching improvements
  - Measure cache hit rates
  - Optimize TTL values
  - Implement cache warming
- [ ] Frontend performance
  - Code splitting and lazy loading
  - Image optimization
  - Bundle size reduction
- [ ] API latency improvements
  - Target: 95th percentile <200ms
  - Use APM tools to identify bottlenecks

### Documentation (Days 55-56)
- [ ] API documentation with Postman (Sponsor)
  - Complete endpoint reference
  - Code examples in JavaScript, Python, PHP
  - Authentication flow
  - Webhook event reference
- [ ] Integration guides
  - JavaScript SDK integration (5 minutes)
  - REST API integration (30 minutes)
  - Shopify plugin guide
  - WooCommerce plugin guide
- [ ] Video tutorials
  - "Getting Started" (3 minutes)
  - "Understanding Risk Scores" (5 minutes)
  - "Handling False Positives" (4 minutes)

### Demo Preparation (Days 57-58)
- [ ] Create demo scenario: Sarah's Jewelry Business
  - Mock transaction data
  - Simulate account freeze scenario
  - Show before/after comparison
- [ ] Build demo environment
  - Separate demo database with synthetic data
  - Pre-populated dashboard
  - Script for live transaction simulation
- [ ] Record 3-minute demo video
  - Problem statement (30s)
  - Solution overview (30s)
  - Live demo (90s)
  - Impact metrics (30s)
- [ ] Create presentation deck (10 slides)
  1. Problem: PayPal account freezes
  2. Market size: 35M+ PayPal merchants
  3. Solution: Pre-authorization risk screening
  4. Technical architecture
  5. AI/ML approach
  6. Demo: Sarah's story
  7. Sponsor tech integration (AG Grid, Elastic, Bryntum, etc.)
  8. Business model
  9. Traction & roadmap
  10. Team & ask

### Beta Testing (Days 59-60)
- [ ] Recruit 5 beta merchants
  - Reach out to PayPal Discord communities
  - Target merchants with >$50K/month volume
- [ ] Onboard beta merchants
  - Integration assistance
  - Monitor transactions
  - Collect feedback
- [ ] Iterate based on feedback
  - Fix critical bugs
  - Improve UX pain points

### Deliverables
- ✅ Security audit report
- ✅ Complete API documentation
- ✅ Integration guides and video tutorials
- ✅ 3-minute demo video
- ✅ Presentation deck
- ✅ 5 beta merchants onboarded

### Success Criteria
- [ ] No critical security vulnerabilities
- [ ] API latency <200ms (p95)
- [ ] Documentation covers all integration paths
- [ ] Demo video tells compelling story
- [ ] Beta merchants report 0 account freezes

---

## Post-Launch: Phase 6 (Weeks 9-12)

**Objective:** Scale, optimize, and prepare for funding.

### Growth & Optimization (Weeks 9-10)
- [ ] Product-led growth features
  - Self-service signup
  - 14-day free trial
  - In-app upgrade prompts
- [ ] Content marketing
  - Blog: "How to Avoid PayPal Account Freezes"
  - SEO targeting: "PayPal account frozen", "PayPal limitation"
  - Case studies from beta merchants
- [ ] Integration marketplace
  - Shopify app store submission
  - WooCommerce plugin repository
  - Magento marketplace

### PayPal AI Toolkit Integration (Week 11)
- [ ] Implement PayPal Agent Toolkit
  - Multi-agent coordination for complex risk analysis
  - Use PayPal MCP Server for agent communication
- [ ] Build AI agents
  - `TransactionRiskAnalyzer`: Analyzes transaction patterns
  - `DisputePatternDetector`: Identifies dispute trends
  - `AccountHealthMonitor`: Tracks merchant account metrics
- [ ] Demonstrate AI agent capabilities in demo

### Hackathon Submission (Week 12)
- [ ] Prepare Devpost submission
  - Write compelling project description
  - Upload demo video
  - Link to live demo
  - List all sponsor technologies used
- [ ] Final testing and polish
- [ ] Submit by deadline
- [ ] Prepare for judging presentation

### Deliverables
- ✅ Self-service onboarding flow
- ✅ Shopify/WooCommerce plugins
- ✅ PayPal AI Toolkit integration
- ✅ Devpost submission complete

---

## Resource Requirements

### Team Composition
- **Full-Stack Developer (Lead):** Backend API, PayPal integration, infrastructure
- **Frontend Developer:** Dashboard, visualizations, JavaScript SDK
- **ML Engineer:** Model training, feature engineering, inference optimization
- **Designer (Part-time):** UI/UX, demo materials, presentation deck

### Technology Costs (Monthly)
- Render (Hosting): $50-100/month
- PostgreSQL: Included with Render
- Redis: Included with Render
- Elastic Cloud: $95/month (Basic tier)
- Domain + SSL: $15/month
- **Total: ~$160-210/month**

### Sponsor Technologies Used
✅ AG Grid - Transaction table
✅ Bryntum - Timeline visualization
✅ Elastic Stack - Pattern matching and analytics
✅ Zapier - Alert automation
✅ APIMatic - SDK generation
✅ Render - Hosting and deployment
✅ Postman - API documentation

---

## Risk Management

### Critical Path Items
1. **PayPal API Integration** - Must work flawlessly in sandbox
2. **ML Model Performance** - Must achieve <1% false positive rate
3. **Inference Latency** - Must stay <100ms at scale
4. **Beta Merchant Feedback** - Must validate value proposition

### Contingency Plans
- **If PayPal API access is restricted:** Build multi-gateway support (Stripe, Square)
- **If ML model underperforms:** Use rule-based system with simpler heuristics
- **If latency exceeds 100ms:** Move to async risk scoring with 2-phase checkout
- **If beta merchants churn:** Pivot to B2B white-label solution for payment processors

---

## Success Metrics

### Technical KPIs
- [ ] Risk scoring latency: <100ms (p95)
- [ ] System uptime: >99.5%
- [ ] ML model AUC-ROC: >0.90
- [ ] False positive rate: <1.0%
- [ ] API error rate: <0.1%

### Business KPIs
- [ ] Beta merchants: 5-10 by end of Week 8
- [ ] Transactions processed: 10,000+ by Week 12
- [ ] Account freezes prevented: 100% of beta merchants (0 freezes)
- [ ] Merchant satisfaction: >4.5/5 average rating

### Hackathon Goals
- [ ] Complete Devpost submission
- [ ] 3-minute demo video uploaded
- [ ] All sponsor technologies integrated
- [ ] Live demo environment accessible
- [ ] Top 10 finalist placement (stretch goal)

---

**Next Steps:**
1. Review and approve this phased plan
2. Assemble team
3. Kick off Phase 0 on [target date]
4. Weekly check-ins to track progress

**Questions? Contact:** hello@payguard.ai
