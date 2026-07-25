## Pull Request

**Description:**

Ports `videodb-python`'s `feat/add-indexing-v2` drop to the NodeJS SDK (`feat/indexing-v2` → `main`), bringing the SDK to parity across two related workstreams:

1. **Indexing v2** — a new retrieval architecture (Search v2 dispatcher, Understanding runs, and an Index manifest) that supersedes the legacy single-shot search.
2. **Generation / compute stack** — persistent GPU **sandboxes**, async **generation jobs** for self-inference TTS/image models, and reusable **voice clones**, wired into the `generate*` methods.

Also adds embed-code helpers and threads `sandboxId` through the inference-bearing methods. Bodies are authored in snake_case at the call site and responses are auto-camelCased by `HttpClient`, per existing SDK conventions; every new public symbol is re-exported from the `src/index.ts` barrel. Bumps the package `0.2.7` → `0.3.0` (minor) and updates the changelog.

Scope: 25 files changed, ~+3,700 / −133. New source modules: `understanding.ts`, `indexManifest.ts`, `job.ts`, `sandbox.ts`, `sandboxModels.ts`, `voiceClone.ts`, `search/responses.ts`.

**Changes:**
- [x] Search v2 on `Video` & `Collection` — `search()` dispatcher + `ask()` / `semanticSearch()` / `query()` / `aggregate()`, v2 `SearchResponse` / `AskResponse` envelopes, iterable `SearchResult`; `legacySearch()` behind a one-time deprecation warning
- [x] Understanding runs — `Understanding` + `UnderstandingAnalyzer` classes and `Video.understand()` / `getUnderstanding()` / `listUnderstandings()` / `deleteUnderstanding()`
- [x] Index manifest — `Index` / `IndexRecord` / `FieldSchema` / `RecordPage` and `Video.index()` / `getIndex()` / `listIndexes()` / `deleteIndex()`, with `IndexCapability` / `FieldGroup` constants
- [x] Sandboxes — `Sandbox` (lifecycle polling) + `Connection.createSandbox()` / `getSandbox()` / `listSandboxes()`, `SandboxTier` / `SandboxStatus` / `SandboxModel`
- [x] Generation jobs — `GenerationJob` + `Connection.getJobStatus()` / `waitForJob()`; `generateImage()` / `generateVoice()` / `generateText()` gain self-inference routing, `sandboxId`, and `wait`
- [x] Voice clones — `VoiceClone` CRUD on `Connection` and `Collection`; `voiceCloneId` in `generateVoice()`
- [x] RTStream understanding & indexing — `RTStreamUnderstanding` / `RTStreamIndex`, `understand()` / `index()`, alert management, record retrieval
- [x] Embed-code helpers — `getEmbedCode()` on `Video` / `Shot` / `Timeline` / RTStream, `buildIframeEmbedCode()` / `playerUrlToEmbedUrl()`, `playerUrl` fields
- [x] `sandboxId` threading into `Video.indexScenes()` / `indexVisuals()`, `Scene.describe()` (+ `modelConfig`), and RTStream indexing; `Connection.getAsyncResponse()`
- [x] Infra — `wait` flag + per-call poll overrides on `HttpClient`, monotonic-clock poll loop w/ `RequestTimeoutError`, `uploadBytes()` helper, `prompt_url` offload for large `generateText()` prompts
- [x] Bugfix: `Sandbox.isReady` / `waitForReady()` treat `alert` as ready (matching Python `READY_STATUSES`) and no longer report `provisioning` as ready
- [x] Version bump `0.2.7` → `0.3.0` + `CHANGELOG.md`

**Related Issues:**
- N/A

**Testing:**

Validated against the companion **`nodejs-test-suite`** (symlinked to this package's built `dist/`), across pure, mocked, and live-API layers:

- **Offline (pure + mock):** full suite green — sandbox constant/getter behavior, poll-loop branches (terminal-state, timeout, `alert`-resolves-ready), and `createSandbox` / `listSandboxes` wire payloads. `npm run typecheck` passes.
- **Live API:** `Sandbox` provision → wait-ready → stop lifecycle; `VoiceClone` CRUD (via `Connection` and `Collection`); `GenerationJob` polling; and all `generate*` methods (text, image, music, sound-effect, voice, video). The only live failures observed were pre-existing backend/account flakiness (semantic/title search, one upload stream-link generation, billing `getInvoices`) — unrelated to this change.

Re-test after merge: because this rebuilds the SDK `dist/`, downstream consumers of `search()` should confirm the v2 dispatcher / legacy fallback behaves as expected, and the sandbox-routed `generate*` paths should be smoke-tested once a sandbox is provisioned.

**Checklist:**
- [x] Code follows project coding standards
- [x] Tests have been added or updated
- [ ] Code Review
- [ ] Manual test after merge
- [ ] All checks passed
