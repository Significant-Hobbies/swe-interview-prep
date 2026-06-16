---
title: ML system design case studies
audited: 2026-06-16
---

# ML system design case studies

A curated index of real production ML write-ups from company engineering blogs — 450 case studies grouped by category, recency-sorted. The intent is *not* to memorise them; it's to give you something concrete to reach for when an interviewer asks "have you seen this problem solved in industry?"

The full source database is maintained by [Evidently AI — ML System Design 500 case studies](https://www.evidentlyai.com/ml-system-design). They keep it up-to-date better than any single doc can.

## How to use this

1. **For interview prep** — for each ML system design topic you study (ranking, RAG, fraud, ETA), read one production write-up alongside the textbook treatment. The textbook tells you the algorithm; the write-up tells you the system around it.
2. **For research** — pick one company in your industry, read three of their write-ups in a row, you'll learn what their team actually cares about.
3. **For your own design doc** — when proposing X, look at how the three closest companies shipped X. Cite them. Engineering reviews change tone when the proposal references real prior art.

## What "ML system design" interviews actually test

Same as classical [HLD](./hld.md), with three extra axes:

- **Data and features.** Where does the training data come from? Labels, freshness, leakage. What features are online (low-latency lookup), what are batch?
- **Online / offline split.** What's served from a model vs from rules? What's the candidate generation step? What's the ranking step?
- **Eval.** Offline metric (NDCG, AUC, MRR) → online proxy (CTR, dwell time) → north-star metric (revenue, retention). Causal gap between them.

The single best reference for the loop is [Eugene Yan — ML system design](https://eugeneyan.com/tag/system-design/). His "Patterns for building ML systems" and "Real-time machine learning" posts are mandatory.

## Case studies, by category

### Recommender systems

77 write-ups tagged `recommender system` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Picnic | [Generating your shopping list with AI: recommendations at Picnic](https://blog.picnic.nl/generating-your-shopping-list-with-ai-recommendations-at-picnic-300e716241db) |
| 2024 | Uber | [Personalized Marketing at Scale: Uber’s Out-of-App Recommendation System](https://www.uber.com/en-GB/blog/personalized-marketing-at-scale/) |
| 2024 | Swiggy | [New-User Product Recommendations for Q-Commerce via Hierarchical Cross-Domain Learning](https://bytes.swiggy.com/new-user-product-recommendations-for-q-commerce-via-hierarchical-cross-domain-learning-0a7f97b25405) |
| 2024 | Target | [Bundled Product Recommendations](https://tech.target.com/blog/bundled-product-recommendations) |
| 2024 | Tubi | [How to Monitor a Recommender System](https://code.tubitv.com/how-to-monitor-a-recommender-system-6d720c922c90) |
| 2024 | LinkedIn | [Candidate Generation in a Large Scale Graph Recommendation System: People You May Know](https://www.linkedin.com/blog/engineering/recommendations/candidate-generation-in-a-large-scale-graph-recommendation-system-people-you-may-know) |
| 2024 | Asos | [Transforming Recommendations at ASOS](https://medium.com/asos-techblog/transforming-recommendations-at-asos-254b95c6a07a) |
| 2024 | LinkedIn | [Building a Large-Scale Recommendation System: People You May Know](https://www.linkedin.com/blog/engineering/recommendations/building-a-large-scale-recommendation-system-people-you-may-know) |
| 2024 | Amazon | [Building commonsense knowledge graphs to aid product recommendation](https://www.amazon.science/blog/building-commonsense-knowledge-graphs-to-aid-product-recommendation) |
| 2023 | Walmart | [Personalized ‘Complete the Look’ model](https://medium.com/walmartglobaltech/personalized-complete-the-look-model-ea093aba0b73) |
| 2023 | Swiggy | [Building a mind reader at Swiggy using Data Science](https://bytes.swiggy.com/building-a-mind-reader-at-swiggy-using-data-science-5a5c38aa6c17) |
| 2023 | Lyft | [The Recommendation System at Lyft](https://eng.lyft.com/the-recommendation-system-at-lyft-67bc9dcc1793) |

### Search & ranking

50 write-ups tagged `search` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Picnic | [Enhancing Search Retrieval with Large Language Models (LLMs)](https://blog.picnic.nl/enhancing-search-retrieval-with-large-language-models-llms-7c3748b26d72) |
| 2024 | Etsy | [Efficient Visual Representation Learning And Evaluation](https://www.etsy.com/codeascraft/efficient-visual-representation-learning-and-evaluation) |
| 2024 | Expedia | [Learning Embeddings for Lodging Travel Concepts](https://medium.com/expedia-group-tech/learning-embeddings-for-lodging-travel-concepts-99165700cdbd) |
| 2024 | Expedia | [Choosing the Right Candidates for Lodging Ranking](https://medium.com/expedia-group-tech/choosing-the-right-candidates-for-lodging-ranking-d0841bf40c0e) |
| 2024 | GetYourGuide | [Powering Millions of Real-Time Rankings with Production AI](https://www.getyourguide.careers/posts/powering-millions-of-real-time-rankings-with-production-ai) |
| 2024 | Walmart | [Transforming Text Classification with Semantic Search Techniques — Faiss](https://medium.com/walmartglobaltech/transforming-text-classification-with-semantic-search-techniques-faiss-c413f133d0e2) |
| 2024 | Faire | [Embedding-Based Retrieval: Our Journey and Learnings around Semantic Search at Faire](https://craft.faire.com/embedding-based-retrieval-our-journey-and-learnings-around-semantic-search-at-faire-2aa44f969994) |
| 2024 | Faire | [Fine-tuning Llama3 to measure semantic relevance in search](https://craft.faire.com/fine-tuning-llama3-to-measure-semantic-relevance-in-search-86a7b13c24ea) |
| 2024 | Google | [Accelerating incident response using generative AI](https://security.googleblog.com/2024/04/accelerating-incident-response-using.html) |
| 2023 | Airbnb | [Prioritizing Home Attributes Based on Guest Interest](https://medium.com/airbnb-engineering/prioritizing-home-attributes-based-on-guest-interest-3c49b827e51a) |
| 2023 | Airbnb | [Learning To Rank Diversely](https://medium.com/airbnb-engineering/learning-to-rank-diversely-add6b1929621) |
| 2023 | Airbnb | [Building Airbnb Categories with ML & Human in the Loop](https://medium.com/airbnb-engineering/building-airbnb-categories-with-ml-human-in-the-loop-35b78a837725) |

### LLM applications

57 write-ups tagged `LLM` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Gitlab | [Developing GitLab Duo: How we validate and test AI models at scale](https://about.gitlab.com/blog/2024/05/09/developing-gitlab-duo-how-we-validate-and-test-ai-models-at-scale/) |
| 2024 | Picnic | [Enhancing Search Retrieval with Large Language Models (LLMs)](https://blog.picnic.nl/enhancing-search-retrieval-with-large-language-models-llms-7c3748b26d72) |
| 2024 | Slack | [How We Built Slack AI To Be Secure and Private](https://slack.engineering/how-we-built-slack-ai-to-be-secure-and-private/) |
| 2024 | Discord | [Developing rapidly with Generative AI](https://discord.com/blog/developing-rapidly-with-generative-ai) |
| 2024 | GoDaddy | [LLM From the Trenches: 10 Lessons Learned Operationalizing Models at GoDaddy](https://www.godaddy.com/resources/news/llm-from-the-trenches-10-lessons-learned-operationalizing-models-at-godaddy) |
| 2024 | LinkedIn | [Musings on building a Generative AI product](https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product) |
| 2024 | Segment | [LLM-as-Judge: Evaluating and Improving Language Model Performance in Production](https://segment.com/blog/llm-as-judge/) |
| 2024 | Gitlab | [Developing GitLab Duo: How we are dogfooding our AI features](https://about.gitlab.com/blog/2024/05/20/developing-gitlab-duo-how-we-are-dogfooding-our-ai-features/) |
| 2024 | Swiggy | [Reflecting on a year of generative AI at Swiggy: A brief review of achievements, learnings, and insights](https://bytes.swiggy.com/reflecting-on-a-year-of-generative-ai-at-swiggy-a-brief-review-of-achievements-learnings-and-13a9671dc624) |
| 2024 | Incident.io | [Lessons learned from building our first AI product](https://incident.io/blog/lessons-learned-from-building-our-first-ai-product) |
| 2024 | Zillow | [Using AI to Understand the Complexities and Pitfalls of Real Estate Data](https://www.zillow.com/tech/using-ai-to-understand-the-complexities-and-pitfalls-of-real-estate-data/) |
| 2024 | Wayfair | [Agent Co-Pilot: Wayfair's Gen-AI Assistant for Digital Sales Agents](https://www.aboutwayfair.com/careers/tech-blog/agent-co-pilot-wayfairs-gen-ai-assistant-for-digital-sales-agents) |

### Generative AI (other)

67 write-ups tagged `generative AI` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Gitlab | [Developing GitLab Duo: How we validate and test AI models at scale](https://about.gitlab.com/blog/2024/05/09/developing-gitlab-duo-how-we-validate-and-test-ai-models-at-scale/) |
| 2024 | Picnic | [Enhancing Search Retrieval with Large Language Models (LLMs)](https://blog.picnic.nl/enhancing-search-retrieval-with-large-language-models-llms-7c3748b26d72) |
| 2024 | Slack | [How We Built Slack AI To Be Secure and Private](https://slack.engineering/how-we-built-slack-ai-to-be-secure-and-private/) |
| 2024 | Discord | [Developing rapidly with Generative AI](https://discord.com/blog/developing-rapidly-with-generative-ai) |
| 2024 | GoDaddy | [LLM From the Trenches: 10 Lessons Learned Operationalizing Models at GoDaddy](https://www.godaddy.com/resources/news/llm-from-the-trenches-10-lessons-learned-operationalizing-models-at-godaddy) |
| 2024 | LinkedIn | [Musings on building a Generative AI product](https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product) |
| 2024 | Segment | [LLM-as-Judge: Evaluating and Improving Language Model Performance in Production](https://segment.com/blog/llm-as-judge/) |
| 2024 | Gitlab | [Developing GitLab Duo: How we are dogfooding our AI features](https://about.gitlab.com/blog/2024/05/20/developing-gitlab-duo-how-we-are-dogfooding-our-ai-features/) |
| 2024 | Swiggy | [Reflecting on a year of generative AI at Swiggy: A brief review of achievements, learnings, and insights](https://bytes.swiggy.com/reflecting-on-a-year-of-generative-ai-at-swiggy-a-brief-review-of-achievements-learnings-and-13a9671dc624) |
| 2024 | Expedia | [Traveling Just Got a Lot Smarter with Romie](https://medium.com/expedia-group-tech/traveling-just-got-a-whole-lot-smarter-with-romie-dfb9b21c07c5) |
| 2024 | Incident.io | [Lessons learned from building our first AI product](https://incident.io/blog/lessons-learned-from-building-our-first-ai-product) |
| 2024 | Zillow | [Using AI to Understand the Complexities and Pitfalls of Real Estate Data](https://www.zillow.com/tech/using-ai-to-understand-the-complexities-and-pitfalls-of-real-estate-data/) |

### NLP

47 write-ups tagged `NLP` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Picnic | [How we broke customer support language barriers without breaking production](https://blog.picnic.nl/how-picnic-migrated-ml-architectures-without-sacrificing-operational-continuity-271c0e04014a) |
| 2024 | Airbnb | [Airbnb Brandometer: Powering Brand Perception Measurement on Social Media Data with AI](https://medium.com/airbnb-engineering/airbnb-brandometer-powering-brand-perception-measurement-on-social-media-data-with-ai-c83019408051) |
| 2024 | Goldman Sachs | [Using NLP to Purposefully Articulate Software Changes](https://developer.gs.com/blog/posts/using-nlp-to-purposefully-articulate-software-changes) |
| 2023 | Airbnb | [Prioritizing Home Attributes Based on Guest Interest](https://medium.com/airbnb-engineering/prioritizing-home-attributes-based-on-guest-interest-3c49b827e51a) |
| 2023 | Honeycomb | [All the Hard Stuff Nobody Talks About when Building Products with LLMs](https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm) |
| 2023 | Yelp | [Yelp Content As Embeddings](https://engineeringblog.yelp.com/2023/04/yelp-content-as-embeddings.html) |
| 2023 | Monzo | [Using topic modelling to understand customer saving goals](https://medium.com/data-monzo/using-topic-modelling-to-understand-customer-saving-goals-2bb06f00ce2d) |
| 2023 | Grammarly | [Improving the Performance of NLP Systems on the Gender-Neutral “They”](https://arxiv.org/abs/2306.07415) |
| 2023 | Meta | [Bringing the world closer together with a foundational multimodal model for speech translation](https://ai.meta.com/blog/seamless-m4t/) |
| 2023 | Linkedin | [Extracting skills from content to fuel the LinkedIn Skills Graph](https://engineering.linkedin.com/blog/2023/extracting-skills-from-content-to-fuel-the-linkedin-skills-graph) |
| 2023 | Haleon | [Deriving insights from customer queries on Haleon brands](https://medium.com/trusted-data-science-haleon/deriving-insights-from-customer-queries-on-haleon-brands-86f7e01b912c) |
| 2023 | Kingfisher Technology | [Uncovering Hidden Insights in Customer Feedback](https://medium.com/kingfisher-technology/uncovering-hidden-insights-in-customer-feedback-824daa16fa37) |

### Computer vision

27 write-ups tagged `CV` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Etsy | [Efficient Visual Representation Learning And Evaluation](https://www.etsy.com/codeascraft/efficient-visual-representation-learning-and-evaluation) |
| 2024 | New York Times | [Experimenting with Handwriting Recognition for The New York Times Crossword](https://open.nytimes.com/experimenting-with-handwriting-recognition-for-new-york-times-crossword-a78e08fec08f) |
| 2024 | Canva | [How we see groups in design](https://www.canva.dev/blog/engineering/how-we-see-groups-in-design/) |
| 2024 | Autotrader | [So many labels, so little time; accelerating our image labelling process](https://engineering.autotrader.co.uk/2024/05/31/image-labels.html) |
| 2024 | GetYourGuide | [How We Use AI to Optimize Travel Images](https://www.getyourguide.careers/posts/how-we-use-ai-to-optimize-travel-images) |
| 2024 | Amazon | [How Project P.I. helps Amazon remove imperfect products](https://www.amazon.science/news-and-features/how-project-p-i-helps-amazon-remove-imperfect-products) |
| 2023 | Walmart | [Personalized ‘Complete the Look’ model](https://medium.com/walmartglobaltech/personalized-complete-the-look-model-ea093aba0b73) |
| 2023 | Yelp | [Yelp Content As Embeddings](https://engineeringblog.yelp.com/2023/04/yelp-content-as-embeddings.html) |
| 2023 | Apple | [Fast Class-Agnostic Salient Object Segmentation](https://machinelearning.apple.com/research/salient-object-segmentation) |
| 2023 | Etsy | [From Image Classification to Multitask Modeling: Building Etsy’s Search by Image Feature](https://www.etsy.com/codeascraft/from-image-classification-to-multitask-modeling-building-etsys-search-by-image-feature) |
| 2023 | Haleon | [Employing Computer Vision in Digital Asset Management (Part 1)](https://medium.com/trusted-data-science-haleon/employing-computer-vision-in-digital-asset-management-207d21a68d9) |
| 2023 | Canva | [Ship Shape](https://www.canva.dev/blog/engineering/ship-shape/) |

### Fraud detection

26 write-ups tagged `fraud detection` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Careem | [Temporary holds: Leveraging machine learning models to reduce fraud](https://engineering.careem.com/tech/posts/temporary-holds-leveraging-machine-learning-models-to-reduce-fraud-while-improving-customer-experience) |
| 2024 | Instacart | [Real-time Fraud Detection with Yoda and ClickHouse](https://tech.instacart.com/real-time-fraud-detection-with-yoda-and-clickhouse-bd08e9dbe3f4) |
| 2024 | Feedzai | [Building Trust in a Digital World: The Role of Machine Learning in Behavioral Biometrics](https://medium.com/feedzaitech/building-trust-in-a-digital-world-the-role-of-machine-learning-in-behavioral-biometrics-bb0da913d95a) |
| 2024 | Swiggy | [Utilizing DevNet with Variational Loss for Fraud Detection in Hyperlocal Food Delivery](https://bytes.swiggy.com/utilizing-devnet-with-variational-loss-for-fraud-detection-in-hyperlocal-food-delivery-19e72999acfb) |
| 2024 | Uber | [Stopping Uber Fraudsters Through Risk Challenges](https://www.uber.com/en-GB/blog/stopping-uber-fraudsters-through-risk-challenges/) |
| 2023 | Stripe | [How we built it: Stripe Radar](https://stripe.com/blog/how-we-built-it-stripe-radar) |
| 2023 | Wayfair | [Introducing Melange: A Customer Journey Embedding System for Improving Fraud and Policy Abuse Detection](https://www.aboutwayfair.com/careers/tech-blog/introducing-melange-a-customer-journey-embedding-system-for-improving-fraud-and-scam-detection) |
| 2023 | BlaBlaCar | [How we used machine learning to fight fraud at BlaBlaCar — Part 1](https://medium.com/blablacar/how-we-used-machine-learning-to-fight-fraud-at-blablacar-part-1-3b976c9dcdf6) |
| 2023 | Uber | [Risk Entity Watch – Using Anomaly Detection to Fight Fraud](https://www.uber.com/en-IN/blog/risk-entity-watch/?uclick_id=9c4355d3-795f-4b1d-b18e-4b8b4c8ed29f) |
| 2023 | Grab | [Unsupervised graph anomaly detection - Catching new fraudulent behaviours](https://engineering.grab.com/graph-anomaly-model) |
| 2023 | BlaBlaCar | [How we built our machine learning pipeline to fight fraud at BlaBlaCar — Part 2](https://medium.com/blablacar/how-we-built-our-machine-learning-pipeline-to-fight-fraud-at-blablacar-part-2-476335f459b4) |
| 2022 | Uber | [Project RADAR: Intelligent Early Fraud Detection System with Humans in the Loop](https://www.uber.com/en-GB/blog/project-radar-intelligent-early-fraud-detection/) |

### Demand forecasting

28 write-ups tagged `demand forecasting` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Foodpanda | [Sculpturing: Optimising Budget through Machine Learning](https://medium.com/foodpanda-data/sculpturing-optimising-budget-through-data-analysis-bd1c1872a36b) |
| 2024 | Foodpanda | [The Making: Optimising Budget through Machine Learning](https://medium.com/foodpanda-data/the-making-optimising-budget-through-data-analysis-3ca4d97a6d1a) |
| 2024 | Picnic | [Under the hood of Picnic’s demand forecasting model: A Deep Dive into the Temporal Fusion Transformer](https://blog.picnic.nl/under-the-hood-of-picnics-demand-forecasting-model-a-deep-dive-into-the-temporal-fusion-e281604d65a5) |
| 2024 | Foodpanda | [Introduction: Optimising Budget through Machine Learning](https://medium.com/foodpanda-data/introduction-optimising-budget-through-data-analysis-030b2f39ad0c) |
| 2023 | Uber | [Demand and ETR Forecasting at Airports](https://www.uber.com/en-GB/blog/demand-and-etr-forecasting-at-airports/) |
| 2023 | Zalando | [Deep Learning based Forecasting: a case study from the online fashion industry](https://arxiv.org/abs/2305.14406) |
| 2023 | Wayfair | [How Wayfair uses “Predicted Winners” Models to Accelerate Success for New Products](https://www.aboutwayfair.com/careers/tech-blog/how-wayfair-uses-predicted-winners-models-to-accelerate-success-for-new-products) |
| 2023 | Instacart | [How Instacart Modernized the Prediction of Real Time Availability for Hundreds of Millions of Items While Saving Costs](https://tech.instacart.com/how-instacart-modernized-the-prediction-of-real-time-availability-for-hundreds-of-millions-of-items-59b2a82c89fe) |
| 2023 | Doordash | [How DoorDash Built an Ensemble Learning Model for Time Series Forecasting](https://doordash.engineering/2023/06/20/how-doordash-built-an-ensemble-learning-model-for-time-series-forecasting/) |
| 2023 | Doordash | [How DoorDash Improves Holiday Predictions via Cascade ML Approach](https://doordash.engineering/2023/08/31/how-doordash-improves-holiday-predictions-via-cascade-ml-approach/) |
| 2023 | Instacart | [How Instacart’s Item Availability Evolved Over the Pandemic](https://www.instacart.com/company/how-its-made/how-instacarts-item-availability-evolved-over-the-pandemic/) |
| 2023 | Instacart | [Instacart’s Item Availability Architecture: Solving for scale and consistency](https://tech.instacart.com/instacarts-item-availability-architecture-solving-for-scale-and-consistency-f5661acb20a6) |

### ETA / arrival prediction

20 write-ups tagged `ETA prediction` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Lyft | [ETA (Estimated Time of Arrival) Reliability at Lyft](https://eng.lyft.com/eta-estimated-time-of-arrival-reliability-at-lyft-d4ca2720bda8) |
| 2024 | Doordash | [Improving ETAs with Multi-Task Models, Deep Learning, and Probabilistic Forecasts](https://doordash.engineering/2024/03/12/improving-etas-with-multi-task-models-deep-learning-and-probabilistic-forecasts/) |
| 2023 | DoorDash | [Lifecycle of a Successful ML Product: Reducing Dasher Wait Times](https://doordash.engineering/2023/02/15/lifecycle-of-a-successful-ml-product-reducing-dasher-wait-times/) |
| 2023 | Wayfair | [Delivery-Date Prediction](https://www.aboutwayfair.com/careers/tech-blog/delivery-date-prediction) |
| 2023 | DoorDash | [How DoorDash Upgraded a Heuristic with ML to Save Thousands of Canceled Orders](https://doordash.engineering/2023/01/10/how-doordash-upgraded-a-heuristic-with-ml-to-save-thousands-of-canceled-orders/) |
| 2023 | Swiggy | [Where is my order? — Part I](https://bytes.swiggy.com/how-ml-powers-when-is-my-order-coming-part-i-4ef24eae70da) |
| 2023 | Swiggy | [Predicting Food Delivery Time at Cart](https://bytes.swiggy.com/predicting-food-delivery-time-at-cart-cda23a84ba63) |
| 2023 | Swiggy | [How ML Powers — When is my order coming? — Part II](https://bytes.swiggy.com/how-ml-powers-when-is-my-order-coming-part-ii-eae83575e3a9) |
| 2023 | OLX | [Machine Learning for Delivery Time Estimation](https://tech.olx.com/machine-learning-for-delivery-time-estimation-1-591c8df849a0) |
| 2022 | Gojek | [How We Estimate Food Debarkation Time With 'Tensoba'](https://www.gojek.io/blog/food-debarkation-tensoba) |
| 2022 | Uber | [DeepETA: How Uber Predicts Arrival Times Using Deep Learning](https://www.uber.com/en-GB/blog/deepeta-how-uber-predicts-arrival-times/) |
| 2022 | Gojek | [How We Estimate Food Debarkation Time With ‘Tensoba’](https://medium.com/gojekengineering/how-we-estimate-food-debarkation-time-with-tensoba-da05674cb758) |

### Content personalization

21 write-ups tagged `content personalization` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Algolia | [Introducing AI Personalization (𝛽)](https://www.algolia.com/blog/product/introducing-ai-personalization/) |
| 2023 | Foodpanda | [Menu Ranking](https://medium.com/foodpanda-data/menu-ranking-422ad21f381e) |
| 2023 | Monzo | [Optimising marketing messages for Monzo users](https://medium.com/data-monzo/optimising-marketing-messages-for-monzo-users-3fe805f24572) |
| 2023 | Spotify | [How We Automated Content Marketing to Acquire Users at Scale](https://engineering.atspotify.com/2023/11/how-we-automated-content-marketing-to-acquire-users-at-scale/) |
| 2023 | Linkedin | [Enhancing homepage feed relevance by harnessing the power of large corpus sparse ID embeddings](https://engineering.linkedin.com/blog/2023/enhancing-homepage-feed-relevance-by-harnessing-the-power-of-lar) |
| 2023 | Nextdoor | [Let AI Entertain You: Increasing User Engagement with Generative AI and Rejection Sampling](https://engblog.nextdoor.com/let-ai-entertain-you-increasing-user-engagement-with-generative-ai-and-rejection-sampling-50a402264f56) |
| 2023 | Netflix | [The Next Step in Personalization: Dynamic Sizzles](https://netflixtechblog.com/the-next-step-in-personalization-dynamic-sizzles-4dc4ce2011ef) |
| 2023 | Expedia | [Increasing Travelers’ Engagement Through Price Alerts](https://medium.com/expedia-group-tech/increasing-travelers-engagement-through-relevant-price-alerts-at-expedia-group-75aa6a377864) |
| 2023 | Wayfair | [Griffin: How Wayfair Leverages Reinforcement Learning to Send Customers Relevant Communications](https://www.aboutwayfair.com/careers/tech-blog/griffin-how-wayfair-leverages-reinforcement-learning-to-send-customers-relevant-communications) |
| 2023 | Spotify | [Experimenting with Machine Learning to Target In-App Messaging](https://engineering.atspotify.com/2023/06/experimenting-with-machine-learning-to-target-in-app-messaging/) |
| 2023 | Rovio | [MLOps at Rovio for Personalization Self Service Reinforcement Learning in Production](https://www.youtube.com/watch?v=_Rqo6nooKKE) |
| 2022 | Uber | [How Uber Optimizes the Timing of Push Notifications using ML and Linear Programming](https://www.uber.com/en-US/blog/how-uber-optimizes-push-notifications-using-ml/) |

### Ad ranking & targeting

19 write-ups tagged `ad ranking / targeting` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Pinterest | [Evolution of Ads Conversion Optimization Models at Pinterest](https://medium.com/pinterest-engineering/evolution-of-ads-conversion-optimization-models-at-pinterest-84b244043d51) |
| 2024 | Pinterest | [Handling Online-Offline Discrepancy in Pinterest Ads Ranking System](https://medium.com/pinterest-engineering/handling-online-offline-discrepancy-in-pinterest-ads-ranking-system-8fd662da4c2d) |
| 2023 | Spotify | [How We Automated Content Marketing to Acquire Users at Scale](https://engineering.atspotify.com/2023/11/how-we-automated-content-marketing-to-acquire-users-at-scale/) |
| 2023 | Etsy | [Leveraging Real-Time User Actions to Personalize Etsy Ads](https://arxiv.org/pdf/2302.01255.pdf) |
| 2023 | Grab | [Stepping up marketing for advertisers: Scalable lookalike audience](https://engineering.grab.com/scalable-lookalike-audiences) |
| 2023 | Grab | [Scaling marketing for merchants with targeted and intelligent promos](https://engineering.grab.com/scaling-marketing-for-merchants) |
| 2023 | Instacart | [One model to serve them all](https://tech.instacart.com/one-model-to-serve-them-all-0eb6bf60b00d) |
| 2023 | Uber | [Accelerating Advertising Optimization: Unleashing the Power of Ads Simulation](https://www.uber.com/en-SG/blog/unleashing-the-power-of-ads-simulation/?uclick_id=92508acc-3a86-4fcc-bc5f-ba1799e3055e) |
| 2022 | Snap | [Machine Learning for Snapchat Ad Ranking](https://eng.snap.com/machine-learning-snap-ad-ranking) |
| 2022 | Linkedin | [Challenges and practical lessons from building a deep-learning-based ads CTR prediction model](https://engineering.linkedin.com/blog/2022/challenges-and-practical-lessons-from-building-a-deep-learning-b) |
| 2021 | Pinterest | [Advertiser Recommendation Systems at Pinterest](https://medium.com/pinterest-engineering/advertiser-recommendation-systems-at-pinterest-ccb255fbde20) |
| 2021 | Pinterest | [The machine learning behind delivering relevant ads](https://medium.com/pinterest-engineering/the-machine-learning-behind-delivering-relevant-ads-8987fc5ba1c0) |

### Item classification

20 write-ups tagged `item classification` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2023 | Airbnb | [Prioritizing Home Attributes Based on Guest Interest](https://medium.com/airbnb-engineering/prioritizing-home-attributes-based-on-guest-interest-3c49b827e51a) |
| 2023 | Yelp | [Yelp Content As Embeddings](https://engineeringblog.yelp.com/2023/04/yelp-content-as-embeddings.html) |
| 2023 | Monzo | [Using topic modelling to understand customer saving goals](https://medium.com/data-monzo/using-topic-modelling-to-understand-customer-saving-goals-2bb06f00ce2d) |
| 2023 | Linkedin | [Extracting skills from content to fuel the LinkedIn Skills Graph](https://engineering.linkedin.com/blog/2023/extracting-skills-from-content-to-fuel-the-linkedin-skills-graph) |
| 2023 | Haleon | [Deriving insights from customer queries on Haleon brands](https://medium.com/trusted-data-science-haleon/deriving-insights-from-customer-queries-on-haleon-brands-86f7e01b912c) |
| 2023 | Kingfisher Technology | [Uncovering Hidden Insights in Customer Feedback](https://medium.com/kingfisher-technology/uncovering-hidden-insights-in-customer-feedback-824daa16fa37) |
| 2023 | Airbnb | [Wisdom of Unstructured Data: Building Airbnb’s Listing Knowledge from Big Text Data](https://medium.com/airbnb-engineering/wisdom-of-unstructured-data-building-airbnbs-listing-knowledge-from-big-text-data-7c533466a63c) |
| 2022 | Expedia | [Categorising Customer Feedback Using Unsupervised Learning](https://medium.com/expedia-group-tech/categorising-customer-feedback-using-unsupervised-learning-8608c1e62d48) |
| 2022 | Foodpanda | [Classifying restaurant cuisines with subjective labels](https://medium.com/foodpanda-data/classifying-restaurant-cuisines-with-subjective-labels-fa10012d18a9) |
| 2022 | Zillow | [Helping Home Shoppers Find a Home to Love Through Home Insights](https://www.zillow.com/tech/helping-shoppers-find-a-home-using-home-insights/) |
| 2022 | Walmart | [Semantic Label Representation with an Application on Multimodal Product Categorization](https://medium.com/walmartglobaltech/semantic-label-representation-with-an-application-on-multimodal-product-categorization-63d668b943b7) |
| 2022 | Wayfair | [Wayfair’s New Approach to Aspect Based Sentiment Analysis Helps Customers Easily Find “Long Tail” Products](https://www.aboutwayfair.com/careers/tech-blog/wayfairs-new-approach-to-aspect-based-sentiment-analysis-helps-customers-easily-find-long-tail-products) |

### Internal ops & developer productivity

71 write-ups tagged `ops` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Netflix | [Evolving from Rule-based Classifier: Machine Learning Powered Auto Remediation in Netflix Data Platform](https://netflixtechblog.com/evolving-from-rule-based-classifier-machine-learning-powered-auto-remediation-in-netflix-data-039d5efd115b) |
| 2024 | Uber | [DataK9: Auto-categorizing an exabyte of data at field level through AI/ML](https://www.uber.com/en-GB/blog/auto-categorizing-data-through-ai-ml/) |
| 2024 | Netflix | [Reverse Searching Netflix’s Federated Graph](https://netflixtechblog.com/reverse-searching-netflixs-federated-graph-222ac5d23576) |
| 2024 | Instacart | [Optimizing at the Edge: Using Regression Discontinuity Designs to Power Decision-Making](https://tech.instacart.com/optimizing-at-the-edge-using-regression-discontinuity-designs-to-power-decision-making-51e296615046) |
| 2024 | Mercado Libre | [Unlocking the Power of Lookalike Audiences: Simplifying Complexity](https://medium.com/mercadolibre-tech/unlocking-the-power-of-lookalike-audiences-simplifying-complexity-74275f537e20) |
| 2024 | Uber | [DragonCrawl: Generative AI for High-Quality Mobile Testing](https://www.uber.com/en-GB/blog/generative-ai-for-high-quality-mobile-testing/) |
| 2024 | Airbnb | [Airbnb Brandometer: Powering Brand Perception Measurement on Social Media Data with AI](https://medium.com/airbnb-engineering/airbnb-brandometer-powering-brand-perception-measurement-on-social-media-data-with-ai-c83019408051) |
| 2024 | Goldman Sachs | [Using NLP to Purposefully Articulate Software Changes](https://developer.gs.com/blog/posts/using-nlp-to-purposefully-articulate-software-changes) |
| 2024 | NVIDIA | [Applying Generative AI for CVE Analysis at an Enterprise Scale](https://developer.nvidia.com/blog/applying-generative-ai-for-cve-analysis-at-an-enterprise-scale/) |
| 2024 | Cloudflare | [Using machine learning to detect bot attacks that leverage residential proxies](https://blog.cloudflare.com/residential-proxy-bot-detection-using-machine-learning) |
| 2024 | GitHub | [Fixing security vulnerabilities with AI](https://github.blog/2024-02-14-fixing-security-vulnerabilities-with-ai/) |
| 2024 | Dropbox | [Bye Bye Bye...: Evolution of repeated token attacks on ChatGPT models](https://dropbox.tech/machine-learning/bye-bye-bye-evolution-of-repeated-token-attacks-on-chatgpt-models) |

### Causal inference

11 write-ups tagged `causality` in the source. Most-recent 11 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Netflix | [Round 2: A Survey of Causal Inference Applications at Netflix](https://netflixtechblog.com/round-2-a-survey-of-causal-inference-applications-at-netflix-fd78328ee0bb) |
| 2023 | Monzo | [Optimising marketing messages for Monzo users](https://medium.com/data-monzo/optimising-marketing-messages-for-monzo-users-3fe805f24572) |
| 2022 | Meta | [Improving Instagram notification management with machine learning and causal inference](https://engineering.fb.com/2022/10/31/ml-applications/instagram-notification-management-machine-learning/) |
| 2022 | New York Times | [How The New York Times Uses Machine Learning To Make Its Paywall Smarter](https://open.nytimes.com/how-the-new-york-times-uses-machine-learning-to-make-its-paywall-smarter-e5771d5f46f8) |
| 2022 | Linkedin | [Ocelot: Scaling observational causal inference at LinkedIn](https://engineering.linkedin.com/blog/2022/ocelot--scaling-observational-causal-inference-at-linkedin) |
| 2022 | Lyft | [Causal Forecasting at Lyft (Part 1)](https://eng.lyft.com/causal-forecasting-at-lyft-part-1-14cca6ff3d6d) |
| 2022 | Lyft | [Causal Forecasting at Lyft (Part 2)](https://eng.lyft.com/causal-forecasting-at-lyft-part-2-418f1febca5a) |
| 2022 | Netflix | [A Survey of Causal Inference Applications at Netflix](https://netflixtechblog.com/a-survey-of-causal-inference-applications-at-netflix-b62d25175e6f) |
| 2021 | Nubank | [Beyond prediction machines](https://building.nubank.com.br/beyond-prediction-machines/) |
| 2021 | Mercado Libre | [Causal Inference — Estimating Long-term Engagement](https://medium.com/mercadolibre-tech/causal-inference-estimating-long-term-engagement-fac517929073) |
| 2019 | Wayfair | [Modeling Uplift Directly: Uplift Decision Tree with KL Divergence and Euclidean Distance as Splitting Criteria](https://www.aboutwayfair.com/tech-innovation/modeling-uplift-directly-uplift-decision-tree-with-kl-divergence-and-euclidean-distance-as-splitting-criteria) |

### Propensity to buy

8 write-ups tagged `propensity to buy` in the source. Most-recent 8 shown.

| Year | Company | Write-up |
|---|---|---|
| 2023 | Expedia | [Expedia Group’s Customer Lifetime Value Prediction Model](https://medium.com/expedia-group-tech/expedia-groups-customer-lifetime-value-prediction-model-7927cdd44342) |
| 2022 | PayPal | [Sales Pipeline Management with Machine Learning: A Lightweight Two-Layer Ensemble Classifier Framework](https://medium.com/paypal-tech/sales-pipeline-management-with-machine-learning-15398bab913b) |
| 2022 | Linkedin | [The journey to build an explainable AI-driven recommendation system](https://engineering.linkedin.com/blog/2022/the-journey-to-build-an-explainable-ai-driven-recommendation-sys) |
| 2022 | Zillow | [Identifying High-Intent Buyers](https://www.zillow.com/tech/identifying-high-intent-buyers/) |
| 2021 | PayPal | [Cross-Selling Optimization Using Deep Learning](https://medium.com/paypal-tech/a-deep-learning-based-approach-to-optimizing-actions-e1ae9d1df152) |
| 2021 | Nubank | [Beyond prediction machines](https://building.nubank.com.br/beyond-prediction-machines/) |
| 2021 | Wayfair | [Building Scalable and Performant Marketing ML Systems at Wayfair](https://www.aboutwayfair.com/careers/tech-blog/building-scalable-and-performant-marketing-ml-systems-at-wayfair) |
| 2020 | Gojek | [How We Built a Matchmaking Algorithm to Cross-Sell Products](https://www.gojek.io/blog/how-we-built-a-matchmaking-algorithm-to-cross-sell-products) |

### Pricing

6 write-ups tagged `pricing` in the source. Most-recent 6 shown.

| Year | Company | Write-up |
|---|---|---|
| 2023 | Zillow | [Building the Neural Zestimate](https://www.zillow.com/tech/building-the-neural-zestimate/) |
| 2023 | Expedia | [Using Synthetic Search Data for Flights Price Forecasting](https://medium.com/expedia-group-tech/using-synthetic-search-data-for-flights-price-forecasting-4cf3277afdaf) |
| 2023 | Expedia | [Increasing Travelers’ Engagement Through Price Alerts](https://medium.com/expedia-group-tech/increasing-travelers-engagement-through-relevant-price-alerts-at-expedia-group-75aa6a377864) |
| 2023 | Cars24 | [ML driven dynamic pricing @ CARS24 — Part 1](https://medium.com/cars24-data-science-blog/how-cars24-uses-machine-learning-for-dynamic-pricing-of-used-cars-part-1-51fee52860d1) |
| 2022 | Lyft | [Pricing at Lyft](https://eng.lyft.com/pricing-at-lyft-8a4022065f8b) |
| 2022 | Didact AI | [Didact AI: The anatomy of an ML-powered stock picking engine](https://principiamundi.com/posts/didact-anatomy) |

### Customer support

7 write-ups tagged `customer support` in the source. Most-recent 7 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Linkedin | [Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering](https://arxiv.org/pdf/2404.17723) |
| 2023 | Vimeo | [From idea to reality: Elevating our customer support through generative AI](https://medium.com/vimeo-engineering-blog/from-idea-to-reality-elevating-our-customer-support-through-generative-ai-101a2c5ea680) |
| 2023 | Intercom | [Building SaaS Products with LLMs at Intercom](https://www.youtube.com/watch?v=VTrJqRfJ5gk) |
| 2022 | Airbnb | [How AI Text Generation Models Are Reshaping Customer Support at Airbnb](https://medium.com/airbnb-engineering/how-ai-text-generation-models-are-reshaping-customer-support-at-airbnb-a851db0b4fa3) |
| 2022 | Wayfair | [Building Wayfair’s First Virtual Assistant: Automating Customer Service by Text Based Intent Prediction](https://www.aboutwayfair.com/careers/tech-blog/building-wayfairs-first-virtual-assistant-automating-customer-service-by-text-based-intent-prediction) |
| 2021 | Microsoft | [ML and customer support (Part 1): Using Machine Learning to enable world-class customer support](https://medium.com/data-science-at-microsoft/ml-and-customer-support-part-1-using-machine-learning-to-enable-world-class-customer-support-c90b3b02f6a3) |
| 2021 | Microsoft | [ML and customer support (Part 2): Leveraging topic modeling to identify the top investment areas in support cases](https://medium.com/data-science-at-microsoft/ml-and-customer-support-part-2-leveraging-topic-modeling-to-identify-the-top-investment-areas-in-f0348382c251) |

### Spam & content moderation

9 write-ups tagged `spam / content moderation` in the source. Most-recent 9 shown.

| Year | Company | Write-up |
|---|---|---|
| 2023 | Linkedin | [Viral spam content detection at LinkedIn](https://engineering.linkedin.com/blog/2023/viral-spam-content-detection-at-linkedin) |
| 2023 | Zillow | [SpectroBrain: Detecting Phone Spam with Semi-Supervised Learning](https://www.zillow.com/tech/spectrobrain-detecting-phone-spam-with-semi-supervised-learning/) |
| 2023 | Linkedin | [Enhancing Content Review: Proactively addressing threats with AutoML](https://engineering.linkedin.com/blog/2023/enhancing-content-review--proactively-addressing-threats-with-au) |
| 2022 | Nextdoor | [Using predictive technology to foster constructive conversations](https://engblog.nextdoor.com/using-predictive-technology-to-foster-constructive-conversations-4af437942bd4) |
| 2021 | Slack | [Blocking Slack Invite Spam With Machine Learning](https://slack.engineering/blocking-slack-invite-spam-with-machine-learning/) |
| 2021 | Pinterest | [Fighting Spam using Clustering and Automated Rule Creation](https://medium.com/pinterest-engineering/fighting-spam-using-clustering-and-automated-rule-creation-1c01d8c11a05) |
| 2021 | Bumble | [Multilingual message content moderation at scale (part 2)](https://medium.com/bumble-tech/multilingual-message-content-moderation-at-scale-7ea562e29e25) |
| 2021 | Pinterest | [How Pinterest powers a healthy comment ecosystem with machine learning](https://medium.com/pinterest-engineering/how-pinterest-powers-a-healthy-comment-ecosystem-with-machine-learning-9e5c3414c8ad) |
| 2021 | Bumble | [Multilingual message content moderation at scale (part 1)](https://medium.com/bumble-tech/multilingual-message-content-moderation-at-scale-ddd0da1e23ed) |

### Churn prediction

3 write-ups tagged `churn prediction` in the source. Most-recent 3 shown.

| Year | Company | Write-up |
|---|---|---|
| 2023 | Pinterest | [An ML based approach to proactive advertiser churn prevention](https://medium.com/pinterest-engineering/an-ml-based-approach-to-proactive-advertiser-churn-prevention-3a7c0c335016) |
| 2022 | Gousto | [Using Data Science to Retain Customers](https://medium.com/gousto-engineering-techbrunch/using-data-science-to-retain-customers-63f19a03a0b6) |
| 2022 | Linkedin | [The journey to build an explainable AI-driven recommendation system](https://engineering.linkedin.com/blog/2022/the-journey-to-build-an-explainable-ai-driven-recommendation-sys) |

### Product features (broad)

90 write-ups tagged `product feature` in the source. Most-recent 12 shown.

| Year | Company | Write-up |
|---|---|---|
| 2024 | Algolia | [Introducing AI Personalization (𝛽)](https://www.algolia.com/blog/product/introducing-ai-personalization/) |
| 2024 | Gitlab | [Developing GitLab Duo: How we validate and test AI models at scale](https://about.gitlab.com/blog/2024/05/09/developing-gitlab-duo-how-we-validate-and-test-ai-models-at-scale/) |
| 2024 | LinkedIn | [Matching LinkedIn members with the right Premium products](https://www.linkedin.com/blog/engineering/machine-learning/matching-linkedin-members-with-the-right-premium-products) |
| 2024 | Slack | [How We Built Slack AI To Be Secure and Private](https://slack.engineering/how-we-built-slack-ai-to-be-secure-and-private/) |
| 2024 | LinkedIn | [Finding AI-generated (deepfake) faces in the wild](https://arxiv.org/abs/2311.08577) |
| 2024 | Expedia | [Learning Embeddings for Lodging Travel Concepts](https://medium.com/expedia-group-tech/learning-embeddings-for-lodging-travel-concepts-99165700cdbd) |
| 2024 | Segment | [LLM-as-Judge: Evaluating and Improving Language Model Performance in Production](https://segment.com/blog/llm-as-judge/) |
| 2024 | Swiggy | [Address Correction for Q-Commerce Part 2: Geocoder](https://bytes.swiggy.com/address-correction-for-q-commerce-part-2-geocoder-3bbd6ee828c0) |
| 2024 | Gitlab | [Developing GitLab Duo: How we are dogfooding our AI features](https://about.gitlab.com/blog/2024/05/20/developing-gitlab-duo-how-we-are-dogfooding-our-ai-features/) |
| 2024 | Replit | [Building LLMs for Code Repair](https://blog.replit.com/code-repair) |
| 2024 | Netflix | [Video annotator: a framework for efficiently building video classifiers using vision-language models and active learning](https://netflixtechblog.com/video-annotator-building-video-classifiers-using-vision-language-models-and-active-learning-8ebdda0b2db4) |
| 2024 | Mozilla | [Experimenting with local alt text generation in Firefox Nightly](https://hacks.mozilla.org/2024/05/experimenting-with-local-alt-text-generation-in-firefox-nightly/) |


## Companion docs in this project

- [Interview topics index](./interview-topics.md) — where ML sits in the broader interview map.
- [High-Level Design](./hld.md) — every ML system is also a system; pair with this.
- [The SE Landscape](./swe-landscape.md) — AI domain section.
- In-app: `/learn` → AI Systems track for the FSRS-tracked curriculum.

## Other curated indexes worth knowing

- [Evidently AI — ML System Design 500 case studies](https://www.evidentlyai.com/ml-system-design) — the upstream source; check yearly.
- [Eugene Yan — Applied ML papers + posts](https://github.com/eugeneyan/applied-ml) — the most-curated GitHub list, includes papers + production posts.
- [Chip Huyen — Designing Machine Learning Systems (book)](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) + her [blog](https://huyenchip.com/blog/) — the modern reference for ML systems thinking.
- [Lilian Weng — Lil'Log](https://lilianweng.github.io/) — for ML research depth that often shows up two years later in the case studies above.

## Maintenance notes

- Source CSV has 450 rows, harvested 2024-12. Every link here was in that source set.
- Some Medium / Substack URLs rot. Re-audit by searching the title; engineering teams republish across domains.
- Categories are the upstream tag taxonomy, not ours. "product feature" is a catch-all and overlaps with most other tags.

