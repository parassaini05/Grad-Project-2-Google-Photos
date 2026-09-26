# Google Photos: AI-Powered Discovery Engine (Part 1)

## Context
As a Product Manager on the Core Experience team at Google Photos, the goal is to improve the retrieval experience for users who are searching for visually memorable content (photos, videos, etc.) but have incomplete memories. 

When memories are incomplete, users know a photo exists but may forget:
- When it was taken
- Where it was taken
- What album it belongs to
- The exact words needed to search for it

**Strategic Goal:** Increase the percentage of users who successfully retrieve a photo they remember but cannot precisely describe when they start searching. The challenge is *not* to improve search in general, but specifically the retrieval experience when memory is incomplete.

---

## Part 1: Build an AI-Powered Discovery Engine

### Objective
Before proposing any product solution, build an AI-powered system (Discovery Engine) that analyzes user feedback and conversations about photo retrieval at scale. 

The system must go beyond simple summarization or sentiment analysis. It should enable the identification and comparison of different retrieval problems and opportunity areas using evidence from real users.

### Allowed Tech Stack
You may use any AI-native stack of your choice, including but not limited to:
- Claude / GPTs
- Agents / Workflows / RAG
- n8n / Zapier
- Perplexity

### Data Sources for Analysis
Analyze publicly available sources to gather real user evidence:
- Google Play Store & App Store reviews
- Reddit discussions
- Google Photos community/support discussions
- Social media conversations
- YouTube comments
- Forums and other relevant public discussions

### Key Questions to Uncover (Sample)
The Discovery Engine should help answer:
1. What kinds of old photos do users struggle to retrieve?
2. What information do people actually remember about a photo?
3. What information have they forgotten?
4. How do users formulate searches when their memory is incomplete?

### Expected Outcome
A functional AI workflow/system that processes raw public data, extracts insights on user retrieval failures, and helps synthesize these into distinct, evidence-backed problem areas.
