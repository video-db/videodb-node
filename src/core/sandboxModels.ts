/**
 * Model identifiers a VideoDB sandbox can run.
 * `QWEN_9B` needs a `medium` sandbox; the rest run on `small`.
 */
export const SandboxModel = {
  QWEN_4B: 'Qwen/Qwen3-4B',
  QWEN_9B: 'Qwen/Qwen3.5-9B',
  WHISPER_LARGE_V3_TURBO: 'openai/whisper-large-v3-turbo',
  INDIC_CONFORMER: 'ai4bharat/indic-conformer-600m-multilingual',
  OMNIVOICE: 'k2-fsa/OmniVoice',
  RTDETR_V2: 'rtdetr-v2-r50vd',
} as const;

export type SandboxModelValue =
  (typeof SandboxModel)[keyof typeof SandboxModel];
