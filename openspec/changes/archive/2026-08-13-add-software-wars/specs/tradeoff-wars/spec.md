## Purpose

Defines scheduled live engineering battles where players create inspectable solutions, respond to changing requirements, debate tradeoffs, and receive a fair result.

## ADDED Requirements

### Requirement: Scheduled 30-minute battle
The system SHALL let authenticated users schedule or accept a 30-minute Tradeoff battle using the same versioned prompt, rules, initial requirements, and hidden twist. Documentation and external AI tools SHALL be explicitly allowed.

#### Scenario: Challenge is scheduled
- **WHEN** two authenticated players accept a Tradeoff challenge and start time
- **THEN** the system creates one match, enrolls both players, and shows the shared start time and allowed-tool policy

#### Scenario: Player checks in
- **WHEN** a participant opens the room during the check-in window
- **THEN** the system validates match membership, prepares media access, and marks readiness without exposing the problem before the configured reveal time

#### Scenario: Opponent does not check in
- **WHEN** one participant remains absent through the no-show deadline
- **THEN** the present participant may claim a forfeit or cancel without rating change according to the displayed match policy

### Requirement: Solo Tradeoff with a user-provided AI opponent
The system SHALL offer an unranked 30-minute Solo Tradeoff session without requiring another account. The learner SHALL provide an OpenAI-compatible endpoint, API key, and model for the current tab. The browser SHALL ask the provider to produce an independent initial artifact before seeing the learner's work, revise that artifact for the same hidden twist, participate in the reveal/debate phase, and return rubric-oriented feedback after the learner's self-assessment.

#### Scenario: Learner starts a solo session
- **WHEN** a learner provides a complete provider configuration and selects Start solo session
- **THEN** the browser creates an independent AI opponent artifact, opens the same 30-minute phase flow, labels the session unranked, and never creates Tradeoff Elo or public match history

#### Scenario: Solo twist is revealed
- **WHEN** the learner advances from the initial-solution phase
- **THEN** the same twist is applied to both sides and the AI revises only its own previously generated artifact without receiving the learner's private draft

#### Scenario: Solo debate begins
- **WHEN** the revision phase freezes
- **THEN** the learner can inspect the AI's frozen artifact and exchange bounded debate messages that reference both revealed artifacts and the evaluation rubric

#### Scenario: Provider call fails
- **WHEN** the browser cannot reach the selected provider or the provider rejects the credential, model, or request
- **THEN** the session preserves the learner's draft, explains the provider failure without exposing the credential, and permits retry or continuation as a local practice session

### Requirement: Ephemeral Solo Tradeoff credentials
Solo Tradeoff provider credentials MUST remain in component memory and MUST NOT be written to localStorage, sessionStorage, IndexedDB, D1, R2, analytics, logs, URLs, challenge payloads, or Learning OS backend requests. Provider calls SHALL travel directly from the learner's browser to the endpoint the learner explicitly selected.

#### Scenario: Solo session refreshes or closes
- **WHEN** the page reloads, closes, or the component unmounts
- **THEN** the provider credential and AI transcript disappear while the learner's non-secret local draft may remain under the existing preview-draft policy

#### Scenario: Solo telemetry is emitted
- **WHEN** the product records solo start, phase, completion, or provider-failure telemetry
- **THEN** telemetry contains only coarse mode/state metadata and excludes endpoint, model, credential, prompts, artifacts, and AI responses

### Requirement: Authoritative phase progression
The system MUST coordinate Tradeoff phases from server-owned deadlines: check-in, initial solution, twist, revision, reveal, eight-minute debate, vote, adjudication, and complete. Clients SHALL recover the current phase and deadline after reconnecting.

#### Scenario: Requirement twist occurs
- **WHEN** the initial-solution deadline is reached
- **THEN** the system reveals the immutable match twist to both players at the same authoritative time and starts the revision phase

#### Scenario: Client reconnects after phase change
- **WHEN** a participant reconnects after missing one or more phase notifications
- **THEN** the system returns the current phase, deadline, and all events that participant is authorized to see

#### Scenario: Late mutation is attempted
- **WHEN** a player tries to modify a submission after its phase deadline
- **THEN** the system rejects the mutation and preserves the frozen artifact version

### Requirement: Private multi-format artifacts
During solving and revision, each player's text, code, schema, pseudocode, and diagram artifacts SHALL remain private from the opponent. The system SHALL freeze immutable artifact snapshots at phase boundaries and reveal both final snapshots only when the reveal phase begins.

The Tradeoff workbench SHALL reuse the Learning OS Playground's Monaco code editor and Excalidraw diagram editor. At wide widths, code and diagram SHALL be usable together alongside design notes; compact widths SHALL provide an explicit, touch-safe panel switcher without removing any artifact type. The competitive shell, phase controls, autosave adapter, and freeze rules SHALL remain Tradeoff-owned.

#### Scenario: Player saves work during solving
- **WHEN** a participant saves an artifact before the deadline
- **THEN** the system persists an owner-visible draft and records the latest accepted version

#### Scenario: Learner builds a combined solution
- **WHEN** a learner writes design notes, edits code or pseudocode in Monaco, and draws architecture in Excalidraw
- **THEN** all three artifacts remain part of one Tradeoff solution and are visible together on a wide workspace

#### Scenario: Combined workspace freezes
- **WHEN** the Tradeoff enters reveal, debate, voting, or complete
- **THEN** notes and code become read-only, Excalidraw enters view mode, and the frozen composite artifact is used for reveal and evaluation

#### Scenario: Reveal begins
- **WHEN** both final artifacts are frozen or the revision deadline expires
- **THEN** the system makes both frozen artifacts readable to both participants and prevents further competitive edits

#### Scenario: Artifact upload is too large or invalid
- **WHEN** submitted content exceeds documented limits or fails format validation
- **THEN** the system rejects it without replacing the last valid draft and explains the limit

### Requirement: Embedded live media
The battle room SHALL support two-person audio/video, device setup, mute controls, optional screen sharing, connection state, and reconnect behavior through a managed media provider. Game state MUST remain functional when media configuration is unavailable.

#### Scenario: Media is configured
- **WHEN** an enrolled participant requests room access
- **THEN** the authenticated backend issues participant-scoped media credentials without exposing provider administrative credentials

#### Scenario: Media is not configured
- **WHEN** the deployment lacks required media configuration
- **THEN** the room shows a clear unavailable state while artifact, phase, and voting flows remain usable for local or text-only testing

#### Scenario: Player reconnects media
- **WHEN** a participant's network changes or media connection drops
- **THEN** the participant can rejoin the same active match without creating another competitive identity

### Requirement: Debate transcript and consent
The system SHALL require explicit participant disclosure and consent before generating a debate transcript. Video recording SHALL be disabled by default. A transcript used for adjudication SHALL identify speakers and be retained according to the displayed retention policy.

#### Scenario: Both players consent
- **WHEN** both participants consent before entering the debate
- **THEN** the system may request post-meeting transcription and attach the resulting transcript to the match adjudication evidence

#### Scenario: A player declines transcription
- **WHEN** either participant declines
- **THEN** the system does not generate a managed transcript and adjudication uses artifacts, twist response, rubric evidence, and player votes only

### Requirement: Voting and adjudication
After the debate, each player SHALL privately vote Win, Loss, or Draw from their own perspective. Agreeing votes SHALL determine the result; incompatible votes SHALL trigger structured AI adjudication from the frozen prompt, twist, artifacts, rubric, and available transcript.

#### Scenario: Votes agree on winner
- **WHEN** one player votes Win and the other votes Loss for the corresponding sides
- **THEN** the system finalizes that winner without AI adjudication

#### Scenario: Both players vote Draw
- **WHEN** both players vote Draw
- **THEN** the system finalizes a draw without AI adjudication

#### Scenario: Votes disagree
- **WHEN** votes are incompatible or one party disputes the other's outcome
- **THEN** the system queues one versioned adjudication, shows a pending state, and finalizes exactly once from a valid structured evaluation

#### Scenario: Adjudication repeatedly fails
- **WHEN** automated evaluation exhausts its retry policy
- **THEN** the match remains unrated and displays a review-required state rather than fabricating a winner

### Requirement: Tradeoff results and history
The completed result SHALL show outcome, rating movement when ranked, frozen artifacts, twist response, rubric-level reasoning, transcript availability, concept evidence, rematch, and report controls.

#### Scenario: Completed match is opened later
- **WHEN** a participant opens Tradeoff history
- **THEN** the system restores the immutable result and only the evidence that participant is permitted to access

#### Scenario: Public result is shared
- **WHEN** a visitor opens a public Tradeoff result
- **THEN** the system shows the outcome and opted-in artifact excerpts while withholding transcripts, private drafts, provider identifiers, and non-consented content
