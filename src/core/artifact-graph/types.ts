import { z } from 'zod';

export const ArtifactSchema = z.object({
  id: z.string().min(1, { error: 'Artifact ID is required' }),
  generates: z.string().min(1, { error: 'generates field is required' }),
  description: z.string(),
  template: z.string().min(1, { error: 'template field is required' }),
  instruction: z.string().optional(),
  requires: z.array(z.string()).default([]),
  /** When true: absence of output files does not block workflow completion (`isComplete`). */
  optional: z.boolean().optional(),
});

export const PhaseSchema = z.object({
  generates: z.string().min(1, { error: 'generates field is required' }),
  template: z.string().min(1, { error: 'template field is required' }),
  description: z.string().optional(),
  requires: z.array(z.string()).default([]),
  instruction: z.string().optional(),
});

export const ApplyPhaseSchema = z.object({
  requires: z.array(z.string()).min(1, { error: 'At least one required artifact or phase' }),
  tracks: z.string().nullable().optional(),
  executionPlan: z.string().nullable().optional(),
  instruction: z.string().optional(),
});

export const SchemaYamlSchema = z.object({
  name: z.string().min(1, { error: 'Schema name is required' }),
  version: z.number().int().positive({ error: 'Version must be a positive integer' }),
  description: z.string().optional(),
  artifacts: z.array(ArtifactSchema).min(1, { error: 'At least one artifact required' }),
  brainstorm: PhaseSchema.optional(),
  plan: PhaseSchema.optional(),
  apply: ApplyPhaseSchema.optional(),
});

export type Artifact = z.infer<typeof ArtifactSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type ApplyPhase = z.infer<typeof ApplyPhaseSchema>;
export type SchemaYaml = z.infer<typeof SchemaYamlSchema>;

// Runtime state types (not Zod - internal only)

// Slice 1: Simple completion tracking via filesystem
/** Top-level phase IDs recognized by the validator/resolver. */
export const PHASE_IDS = ['brainstorm', 'plan', 'apply'] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

export const ChangeMetadataSchema = z.object({
  schema: z.string().min(1, { message: 'schema is required' }),
  created: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'created must be YYYY-MM-DD format',
    })
    .optional(),
});

export type ChangeMetadata = z.infer<typeof ChangeMetadataSchema>;

export type CompletedSet = Set<string>;

export interface BlockedArtifacts {
  [artifactId: string]: string[];
}
