# Delta — Patrick Chat (web app RAG)

## ADDED Requirements

### Requirement: Public bilingual chat
The system SHALL provide a public, login-free web page where a visitor can chat with Patrick, and SHALL reply in the language of the visitor's message (French or English).

#### Scenario: Visitor writes in French
- GIVEN a visitor on the chat page
- WHEN they send a message in French
- THEN Patrick replies in French

#### Scenario: Visitor writes in English
- GIVEN a visitor on the chat page
- WHEN they send a message in English
- THEN Patrick replies in English

### Requirement: RAG grounding with source citation
The system SHALL answer using retrieval over the curated corpus (Bedrock Knowledge Base) and SHALL cite the official source of each fiche used. Patrick MUST NOT fabricate facts or URLs.

#### Scenario: Answer within corpus
- GIVEN a question whose answer exists in the corpus
- WHEN Patrick replies
- THEN the reply is grounded in the retrieved fiche AND displays its source link(s)

#### Scenario: No fabrication
- GIVEN retrieval returns no relevant chunk
- WHEN Patrick would otherwise guess
- THEN Patrick does NOT invent an answer or URL

### Requirement: Nationality-aware PVT answers
For any PVT/immigration fact that depends on nationality, the system SHALL ask for the visitor's nationality (or nationalities) before answering, and SHALL never default to a single nationality.

#### Scenario: PVT question without stated nationality
- GIVEN a visitor asks a nationality-dependent PVT question
- WHEN no nationality has been provided
- THEN Patrick asks for the nationality/nationalities before giving the specific rule

#### Scenario: Dual nationality
- GIVEN a visitor states two nationalities
- WHEN Patrick answers a PVT question
- THEN Patrick compares both streams and helps choose the most advantageous

### Requirement: Strict scope with courteous refusal
The system SHALL restrict answers to PVT/WHM and settling in Montreal, and SHALL refuse out-of-scope requests courteously, without profanity, even toward a hostile user.

#### Scenario: Out-of-scope request
- GIVEN a visitor asks something unrelated to PVT/Montreal settlement
- WHEN Patrick responds
- THEN Patrick declines courteously and states it is outside his scope

### Requirement: Unanswered-question logging
When a question is in scope but has no corpus answer, the system SHALL tell the visitor it is noted for the team and SHALL log the question with a timestamp, without storing personal data.

#### Scenario: In-scope but unknown
- GIVEN an in-scope question with no corpus match
- WHEN Patrick replies
- THEN Patrick says it is noted for the team AND the question + timestamp are logged with no PII

### Requirement: No personal data
The system SHALL NOT request or store personally identifiable information, and SHALL display a visible disclaimer that answers are general information, not official advice.

#### Scenario: Disclaimer visible
- GIVEN a visitor loads the chat page
- WHEN the page renders
- THEN a disclaimer ("general info, not official advice") is visible on screen

### Requirement: Cost guardrails
The system SHALL enforce a per-visitor rate limit and a global daily message ceiling, and SHALL cap response length, to bound cost.

#### Scenario: Daily ceiling reached
- GIVEN the global daily message ceiling has been reached
- WHEN a visitor sends another message
- THEN Patrick shows a "resting, come back tomorrow" message instead of calling the model
