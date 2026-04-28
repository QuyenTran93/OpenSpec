import type {
  Artifact,
  Phase,
  SchemaYaml,
  CompletedSet,
  BlockedArtifacts,
} from './types.js';
import { PHASE_IDS } from './types.js';
import { loadSchema, parseSchema } from './schema.js';

export type GraphNode =
  | { kind: 'artifact'; id: string; node: Artifact }
  | { kind: 'phase'; id: string; node: Phase };

/**
 * Represents an artifact dependency graph.
 * Provides methods for querying build order, ready artifacts, and completion status.
 *
 * Phases (top-level brainstorm/plan, mirroring apply) are indexed for instruction
 * loading and status formatting but do NOT participate in the artifact tracking
 * methods (getBuildOrder, getNextArtifacts, isComplete, getBlocked).
 */
export class ArtifactGraph {
  private artifacts: Map<string, Artifact>;
  private phases: Map<string, Phase>;
  private schema: SchemaYaml;
  /** Artifact id -> its position in the schema's `artifacts:` list. */
  private declarationOrder: Map<string, number>;

  private constructor(schema: SchemaYaml) {
    this.schema = schema;
    this.artifacts = new Map(schema.artifacts.map(a => [a.id, a]));
    this.declarationOrder = new Map(schema.artifacts.map((a, index) => [a.id, index]));
  }

  /**
   * Orders artifact ids by where the schema declares them.
   *
   * The dependency graph leaves siblings tied - spec-driven's `specs` and
   * `design` both require only `proposal`, so both become ready at the same
   * time. Ties used to be broken alphabetically, which put `design` ahead of
   * `specs` and made the CLI recommend the artifacts in an order that
   * contradicted the schema's own documented sequence
   * (proposal -> specs -> design -> tasks). Breaking ties by declaration order
   * follows the sequence the schema author wrote, for built-in and custom
   * schemas alike, and stays just as deterministic. Ids not in the schema sort
   * last so the comparator stays total.
   */
  private compareByDeclarationOrder(a: string, b: string): number {
    return (
      (this.declarationOrder.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (this.declarationOrder.get(b) ?? Number.MAX_SAFE_INTEGER)
    );
    this.artifacts = new Map(schema.artifacts.map((a) => [a.id, a]));

    const phaseEntries: Array<[string, Phase]> = [];
    for (const pid of PHASE_IDS) {
      if (pid === 'apply') continue;
      const phase = schema[pid];
      if (phase) phaseEntries.push([pid, phase]);
    }
    this.phases = new Map(phaseEntries);
  }

  /**
   * Creates an ArtifactGraph from a YAML file path.
   */
  static fromYaml(filePath: string): ArtifactGraph {
    return new ArtifactGraph(loadSchema(filePath));
  }

  /**
   * Creates an ArtifactGraph from YAML content string.
   */
  static fromYamlContent(yamlContent: string): ArtifactGraph {
    return new ArtifactGraph(parseSchema(yamlContent));
  }

  /**
   * Creates an ArtifactGraph from a pre-validated schema object.
   */
  static fromSchema(schema: SchemaYaml): ArtifactGraph {
    return new ArtifactGraph(schema);
  }

  getArtifact(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  getAllArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  /**
   * Gets a top-level phase (brainstorm/plan) by id.
   * Apply phase is handled separately via the schema's `apply` field.
   */
  getPhase(id: string): Phase | undefined {
    return this.phases.get(id);
  }

  getAllPhases(): Array<{ id: string; phase: Phase }> {
    return Array.from(this.phases.entries()).map(([id, phase]) => ({ id, phase }));
  }

  /**
   * Uniform node lookup. Tries artifacts first, falls back to phases.
   */
  getNode(id: string): GraphNode | undefined {
    const artifact = this.artifacts.get(id);
    if (artifact) return { kind: 'artifact', id, node: artifact };
    const phase = this.phases.get(id);
    if (phase) return { kind: 'phase', id, node: phase };
    return undefined;
  }

  /**
   * Returns all nodes (artifacts and phases) in a single list.
   */
  getAllNodes(): GraphNode[] {
    return [
      ...this.getAllArtifacts().map(
        (a): GraphNode => ({ kind: 'artifact', id: a.id, node: a })
      ),
      ...this.getAllPhases().map(
        ({ id, phase }): GraphNode => ({ kind: 'phase', id, node: phase })
      ),
    ];
  }

  getName(): string {
    return this.schema.name;
  }

  getVersion(): number {
    return this.schema.version;
  }

  /**
   * Computes the topological build order of artifacts using Kahn's algorithm.
   * Phase nodes are not included; artifact requires that target a phase id are
   * treated as already satisfied for build-order purposes (phase outputs are
   * managed outside the artifact tracking lifecycle).
   */
  getBuildOrder(): string[] {
    const artifactIds = new Set(this.artifacts.keys());
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const artifact of this.artifacts.values()) {
      // Only count artifact-to-artifact deps for in-degree.
      const artifactDeps = artifact.requires.filter((req) => artifactIds.has(req));
      inDegree.set(artifact.id, artifactDeps.length);
      dependents.set(artifact.id, []);
    }

    for (const artifact of this.artifacts.values()) {
      for (const req of artifact.requires) {
        if (artifactIds.has(req)) {
          dependents.get(req)!.push(artifact.id);
        }
      }
    }

    // Start with roots (in-degree 0), in declaration order for determinism
    const queue = [...this.artifacts.keys()]
      .filter(id => inDegree.get(id) === 0)
      .sort((a, b) => this.compareByDeclarationOrder(a, b));
    const queue = [...this.artifacts.keys()]
      .filter((id) => inDegree.get(id) === 0)
      .sort();

    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const newlyReady: string[] = [];
      for (const dep of dependents.get(current)!) {
        const newDegree = inDegree.get(dep)! - 1;
        inDegree.set(dep, newDegree);
        if (newDegree === 0) {
          newlyReady.push(dep);
        }
      }
      // Re-sort the whole queue, not just the new arrivals: an artifact that
      // has been waiting can be declared after one that just became ready.
      queue.push(...newlyReady);
      queue.sort((a, b) => this.compareByDeclarationOrder(a, b));
    }

    return result;
  }

  /**
   * Gets artifacts that are ready to be created (all dependencies completed).
   * `completed` may contain phase IDs as well as artifact IDs; an artifact
   * whose `requires` mentions a phase id needs that phase id in `completed`.
   */
  getNextArtifacts(completed: CompletedSet): string[] {
    const ready: string[] = [];

    for (const artifact of this.artifacts.values()) {
      if (completed.has(artifact.id)) continue;
      const allDepsCompleted = artifact.requires.every((req) => completed.has(req));
      if (allDepsCompleted) ready.push(artifact.id);
    }

    // Declaration order: deterministic, and the first entry is the artifact the
    // schema wants written next.
    return ready.sort((a, b) => this.compareByDeclarationOrder(a, b));
    return ready.sort();
  }

  /**
   * True when every non-optional artifact has completed outputs.
   * Phase completion is not considered (phases are tracked in status formatter).
   */
  isComplete(completed: CompletedSet): boolean {
    for (const artifact of this.artifacts.values()) {
      if (artifact.optional === true) continue;
      if (!completed.has(artifact.id)) return false;
    }
    return true;
  }

  /**
   * Gets blocked artifacts and their unmet dependencies (artifact or phase ids).
   */
  getBlocked(completed: CompletedSet): BlockedArtifacts {
    const blocked: BlockedArtifacts = {};

    for (const artifact of this.artifacts.values()) {
      if (completed.has(artifact.id)) {
        continue; // Already completed
      }

      const unmetDeps = artifact.requires.filter(req => !completed.has(req));
      if (unmetDeps.length > 0) {
        blocked[artifact.id] = unmetDeps.sort((a, b) => this.compareByDeclarationOrder(a, b));
      }
      if (completed.has(artifact.id)) continue;
      const unmetDeps = artifact.requires.filter((req) => !completed.has(req));
      if (unmetDeps.length > 0) blocked[artifact.id] = unmetDeps.sort();
    }

    return blocked;
  }
}
