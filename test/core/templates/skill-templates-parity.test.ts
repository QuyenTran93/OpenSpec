import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getBrainstormRootArchiveChangeSkillTemplate,
  getBrainstormRootBrainstormSkillTemplate,
  getBrainstormRootContinueChangeSkillTemplate,
  getBrainstormRootNewChangeSkillTemplate,
  getBrainstormRootProposeSkillTemplate,
  getBrainstormRootWritingPlansSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
  getOpsxBrainstormRootArchiveCommandTemplate,
  getOpsxBrainstormRootBrainstormCommandTemplate,
  getOpsxBrainstormRootContinueCommandTemplate,
  getOpsxBrainstormRootNewCommandTemplate,
  getOpsxBrainstormRootProposeCommandTemplate,
  getOpsxBrainstormRootWritingPlansCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';
import { APPLY_EXECUTION_ENVIRONMENT_POLICY_BLOCK } from '../../../src/core/templates/workflows/shared/execution-environment-policy.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '3f73b4d7ab189ef6367fccc9d99308bee35c6a89dae4c8044582a01cb01b335b',
  getNewChangeSkillTemplate: '5989672758eccf54e3bb554ab97f2c129a192b12bbb7688cc1ffcf6bccb1ae9d',
  getContinueChangeSkillTemplate: 'f2e413f0333dfd6641cc2bd1a189273fdea5c399eecdde98ef528b5216f097b3',
  getApplyChangeSkillTemplate: '511875ac23c055072c75f34943b4b74122fb83e6f9cf4ce2d8e8a8a34216f581',
  getFfChangeSkillTemplate: 'a7332fb14c8dc3f9dec71f5d332790b4a8488191e7db4ab6132ccbefecf9ded9',
  getSyncSpecsSkillTemplate: 'bded184e4c345619148de2c0ad80a5b527d4ffe45c87cc785889b9329e0f465b',
  getOnboardSkillTemplate: 'c9e719a02d2ae7f74a0e978f9ad4e767c1921248a9e3724c3321c58a15c38ba9',
  getOpsxExploreCommandTemplate: 'b421b88c7a532385f7b1404736d7893eb35a05573b4a04a96f72379ac1bbf148',
  getOpsxNewCommandTemplate: '62eee32d6d81a376e7be845d0891e28e6262ad07482f9bfe6af12a9f0366c364',
  getOpsxContinueCommandTemplate: '8bbaedcc95287f9e822572608137df4f49ad54cedfb08d3342d0d1c4e9716caa',
  getOpsxApplyCommandTemplate: 'afea04159a887e3c4208483c78369257b5328f61964f409b45c852c1a62995b3',
  getOpsxFfCommandTemplate: 'cdebe872cc8e0fcc25c8864b98ffd66a93484c0657db94bd1285b8113092702a',
  getArchiveChangeSkillTemplate: '6f8ca383fdb5a4eb9872aca81e07bf0ba7f25e4de8617d7a047ca914ca7f14b9',
  getBulkArchiveChangeSkillTemplate: '8049897ce1ddb2ff6c0d4b72e22636f9ecfd083b5f2c2a30cf3bb1cb828a2f93',
  getOpsxSyncCommandTemplate: '378d035fe7cc30be3e027b66dcc4b8afc78ef1c8369c39479c9b05a582fb5ccf',
  getVerifyChangeSkillTemplate: '40dde29051a0ba204295b74e49e87b6e9ff30c8b89ff0e791b4f955b4595de59',
  getOpsxArchiveCommandTemplate: 'b44cc9748109f61687f9f596604b037bc3ea803abc143b22f09a76aebd98b493',
  getOpsxOnboardCommandTemplate: 'fce531f952e939ee85a41848fc21e4cc720b0f3eb62737adc3a51ee6ad2dfc57',
  getOpsxBulkArchiveCommandTemplate: '0d77c82de43840a28c74f5181cb21e33b9a9d00454adf4bc92bdc9e69817d6f5',
  getOpsxVerifyCommandTemplate: 'd7c0444863faabb16abb091bc40ee56d985ae4bfa9a4db1e622ca8ba03c32fed',
  getOpsxProposeSkillTemplate: 'd67f937d44650e9c61d2158c865309fbab23cb3f50a3d4868a640a97776e3999',
  getOpsxProposeCommandTemplate: '41ad59b37eafd7a161bab5c6e41997a37368f9c90b194451295ede5cd42e4d46',
  getFeedbackSkillTemplate: 'd7d83c5f7fc2b92fe8f4588a5bf2d9cb315e4c73ec19bcd5ef28270906319a0d',
};

const EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES: Record<string, string> = {
  getBrainstormRootBrainstormSkillTemplate: 'ea2f91b9b8f05921143155634b64f949d63c2216ac9ebccedd62f3c1e96ed66e',
  getBrainstormRootProposeSkillTemplate: '90b97ba5e9bf1a1d98334b2bf47b61bf0723a2f54ba4f2c338b5abdfa48009c0',
  getBrainstormRootWritingPlansSkillTemplate: '6671b787027f8a749a3931ee12837d149b9417d6d781f90c6004552b64683897',
  getBrainstormRootContinueChangeSkillTemplate: '92809c493f4740409c0f876e17508ae22ba70be3359e26ed59deb27fbed85cd2',
  getBrainstormRootApplyChangeSkillTemplate: '34429b2072d6f5d4946e12a0068c5d7a6b69580946fb7ddc4525a8df67976e0e',
  getBrainstormRootNewChangeSkillTemplate: 'f3eb31447929064c6fce5711a183e5075df3715bdabef6bfdcdb6b2824bd2a36',
  getBrainstormRootArchiveChangeSkillTemplate: '8324edf5e4403723002e54167272f2440024fdc73a30e89455ec0f9e6692d569',
  getOpsxBrainstormRootBrainstormCommandTemplate: '6737c7f143c52cc13d39327810f3beb099c9fa55714cb9193be7b987f4ed102e',
  getOpsxBrainstormRootProposeCommandTemplate: 'b0192849b578c9b0228a5c8794583bc6e3477323b7396b5549b2bcb511f4ecf5',
  getOpsxBrainstormRootWritingPlansCommandTemplate: '248e1729390e899bca36ae83c308a47decc7bde9a0985322a91a560064302ff0',
  getOpsxBrainstormRootContinueCommandTemplate: '94bcc742c567e60bee94129e19e4d88df88f1ec2ccef6858c46aea77fad4496d',
  getOpsxBrainstormRootApplyCommandTemplate: '5c9eb1ebc40586d52e2d10c24c5714005877eee00da785072bc1960fe26551c4',
  getOpsxBrainstormRootNewCommandTemplate: 'e0eb6800fe0ab3a243761c8e186bf83f05a8489ffb421bd9a8da081cb1efce88',
  getOpsxBrainstormRootArchiveCommandTemplate: '342591df0961eb161351ee39d71841c5ae8839eb702c070c656b146412d1a9d3',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '08e1ec9958eb04653707dd3e198c3fd69cf1b3acd3cf95a1022693cca83c60fc',
  'openspec-new-change': 'c324a7ace1f244aa3f534ac8e3370a2c11190d6d1b85a315f26a211398310f0f',
  'openspec-continue-change': '463cf0b980ec9c3c24774414ef2a3e48e9faa8577bc8748990f45ab3d5efe960',
  'openspec-apply-change': 'cd46f5c1bb74bacb615f2d1cce82549d09236aa05d9117fd2e2ae9766c99fca8',
  'openspec-ff-change': '672c3a5b8df152d959b15bd7ae2be7a75ab7b8eaa2ec1e0daa15c02479b27937',
  'openspec-sync-specs': 'b8859cf454379a19ca35dbf59eedca67306607f44a355327f9dc851114e50bde',
  'openspec-archive-change': 'f83c85452bd47de0dee6b8efbcea6a62534f8a175480e9044f3043f887cebf0f',
  'openspec-bulk-archive-change': '10477399bb07c7ba67f78e315bd68fb1901af8866720545baf4c62a6a679493b',
  'openspec-verify-change': 'b6dc1b87940be9d6125b834831c8619019aec9a9748995f72bf981b6f08b67f8',
  'openspec-onboard': 'c1444e026028210efd699110f7e9079bcb486d85ccf27f743213a81cb1084303',
  'openspec-propose': '20e36dabefb90e232bad0667292bd5007ec280f8fc4fc995dbc4282bf45a22e7',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves brainstorm-root template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getBrainstormRootBrainstormSkillTemplate,
      getBrainstormRootProposeSkillTemplate,
      getBrainstormRootWritingPlansSkillTemplate,
      getBrainstormRootContinueChangeSkillTemplate,
      getBrainstormRootApplyChangeSkillTemplate,
      getBrainstormRootNewChangeSkillTemplate,
      getBrainstormRootArchiveChangeSkillTemplate,
      getOpsxBrainstormRootBrainstormCommandTemplate,
      getOpsxBrainstormRootProposeCommandTemplate,
      getOpsxBrainstormRootWritingPlansCommandTemplate,
      getOpsxBrainstormRootContinueCommandTemplate,
      getOpsxBrainstormRootApplyCommandTemplate,
      getOpsxBrainstormRootNewCommandTemplate,
      getOpsxBrainstormRootArchiveCommandTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES);
  });

  it('exposes superpowers path mapping in brainstorm-root writing-plans template', () => {
    const writingSkill = getBrainstormRootWritingPlansSkillTemplate();

    // Note: brainstorm skill body markers ('Superpowers → OpenSpec', 'docs/superpowers/specs/')
    // moved to schema canonical content. Asserted in test/schemas/brainstorm-root.instruction.test.ts.
    expect(writingSkill.instructions).toContain('docs/superpowers/plans/');
    expect(writingSkill.instructions).toContain('execution-plan.md');
  });

  it('embeds brainstorm-root workflow sequence in core brainstorm-root templates', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const applySkill = getBrainstormRootApplyChangeSkillTemplate();
    const marker = 'Workflow sequence (brainstorm-root)';
    expect(proposeSkill.instructions).toContain(marker);
    expect(applySkill.instructions).toContain(marker);
    expect(getBrainstormRootNewChangeSkillTemplate().instructions).toContain(marker);
    expect(getBrainstormRootContinueChangeSkillTemplate().instructions).toContain(marker);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['openspec-explore', getExploreSkillTemplate],
      ['openspec-new-change', getNewChangeSkillTemplate],
      ['openspec-continue-change', getContinueChangeSkillTemplate],
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-ff-change', getFfChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
      ['openspec-onboard', getOnboardSkillTemplate],
      ['openspec-propose', getOpsxProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  it('requires brainstorm-root apply templates to mention execution-plan gate and planning handoff', () => {
    const applySkill = getBrainstormRootApplyChangeSkillTemplate();
    const applyCommand = getOpsxBrainstormRootApplyCommandTemplate();

    expect(applySkill.instructions).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applySkill.instructions).toContain('git commit');
    expect(applySkill.instructions).toContain('execution-plan.md');
    expect(applySkill.instructions).toContain('writing-plans');
    expect(applySkill.instructions).toContain('superpowers:subagent-driven-development');
    expect(applySkill.instructions).toContain('superpowers:executing-plans');
    expect(applySkill.instructions).toContain('using-git-worktrees');

    expect(applyCommand.content).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applyCommand.content).toContain('git commit');
    expect(applyCommand.content).toContain('execution-plan.md');
    expect(applyCommand.content).toContain('writing-plans');
    expect(applyCommand.content).toContain('superpowers:subagent-driven-development');
    expect(applyCommand.content).toContain('superpowers:executing-plans');
    expect(applyCommand.content).toContain('using-git-worktrees');
  });

  it('requires brainstorm-root propose templates to mention writing-plans handoff before apply', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();

    expect(proposeSkill.instructions).toContain('writing-plans');
    expect(proposeSkill.instructions).toContain('openspec/changes/<name>/execution-plan.md');
    expect(proposeSkill.instructions).toContain('/opsx:apply');

    expect(proposeCommand.content).toContain('writing-plans');
    expect(proposeCommand.content).toContain('openspec/changes/<name>/execution-plan.md');
    expect(proposeCommand.content).toContain('/opsx:apply');
  });

  it('prevents proposal-first regressions in brainstorm-root propose/continue templates', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();
    const continueSkill = getBrainstormRootContinueChangeSkillTemplate();
    const continueCommand = getOpsxBrainstormRootContinueCommandTemplate();

    expect(proposeSkill.instructions).not.toContain('proposal.md (what & why)');
    expect(proposeCommand.content).not.toContain('proposal.md (what & why)');
    expect(continueSkill.instructions).toContain('Do not imply or require `proposal.md` for brainstorm-root.');
    expect(continueCommand.content).toContain('Do not imply or require `proposal.md` for brainstorm-root.');

    expect(proposeSkill.instructions).toContain('Derive the next artifact from `openspec status --change "<name>" --json`');
    expect(proposeSkill.instructions).toContain('applyRequires');
    expect(proposeCommand.content).toContain('Derive the next artifact from `openspec status --change "<name>" --json`');
    expect(proposeCommand.content).toContain('applyRequires');

    expect(continueSkill.instructions).toContain('Always select the next artifact from status JSON (`status: "ready"`) and `applyRequires`.');
    expect(continueCommand.content).toContain('Always select the next artifact from status JSON (`status: "ready"`) and `applyRequires`.');
  });

  it('requires explicit brainstorm-root schema flag in propose templates', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();

    expect(proposeSkill.instructions).toContain('openspec status --change "<name>" --schema brainstorm-root --json');
    expect(proposeSkill.instructions).toContain('openspec instructions <artifact-id> --change "<name>" --schema brainstorm-root --json');
    expect(proposeSkill.instructions).toContain('`--schema brainstorm-root` is missing');

    expect(proposeCommand.content).toContain('openspec status --change "<name>" --schema brainstorm-root --json');
    expect(proposeCommand.content).toContain('openspec instructions <artifact-id> --change "<name>" --schema brainstorm-root --json');
    expect(proposeCommand.content).toContain('`--schema brainstorm-root` is missing');
  });

  it('requires global brainstorm-root schema-sensitive CLI guardrail wording in shared sequence block', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();

    const marker =
      'Guardrail: for brainstorm-root, run schema-sensitive CLI calls with explicit `--schema brainstorm-root`.';
    expect(proposeSkill.instructions).toContain(marker);
    expect(proposeCommand.content).toContain(marker);
  });

  it('requires cross-schema sandbox fallback policy markers in apply templates', () => {
    const applySkill = getApplyChangeSkillTemplate();
    const applyCommand = getOpsxApplyCommandTemplate();
    const brainstormApplySkill = getBrainstormRootApplyChangeSkillTemplate();
    const brainstormApplyCommand = getOpsxBrainstormRootApplyCommandTemplate();

    const requiredMarkers = [
      'Tests MUST run outside sandbox',
      'Lint MUST run outside sandbox',
      'Build MUST run outside sandbox',
      'Retry outside sandbox only when the failure clearly indicates sandbox/environment restrictions',
      'Retry outside sandbox at most once',
    ] as const;

    for (const marker of requiredMarkers) {
      expect(applySkill.instructions).toContain(marker);
      expect(applyCommand.content).toContain(marker);
      expect(brainstormApplySkill.instructions).toContain(marker);
      expect(brainstormApplyCommand.content).toContain(marker);
    }
  });

  it('prevents default outside-sandbox execution wording in apply skill template', () => {
    const applySkill = getApplyChangeSkillTemplate();
    expect(applySkill.instructions).not.toContain('Run all commands outside sandbox by default');
  });

  it('exports shared execution environment policy markers', () => {
    const requiredMarkers = [
      'Tests MUST run outside sandbox',
      'Lint MUST run outside sandbox',
      'Build MUST run outside sandbox',
      'Retry outside sandbox only when the failure clearly indicates sandbox/environment restrictions',
      'Retry outside sandbox at most once',
    ] as const;

    for (const marker of requiredMarkers) {
      expect(APPLY_EXECUTION_ENVIRONMENT_POLICY_BLOCK).toContain(marker);
    }
  });

  describe('workflow schema grouping', () => {
    it('exports grouped workflow skill factories with expected template names', () => {
      expect(getBrainstormRootBrainstormSkillTemplate().name).toBe('openspec-brainstorm');
      expect(getBrainstormRootProposeSkillTemplate().name).toBe('openspec-propose');
      expect(getBrainstormRootWritingPlansSkillTemplate().name).toBe('openspec-writing-plans');
      expect(getBrainstormRootContinueChangeSkillTemplate().name).toBe('openspec-continue-change');
      expect(getBrainstormRootApplyChangeSkillTemplate().name).toBe('openspec-apply-change');
      expect(getBrainstormRootNewChangeSkillTemplate().name).toBe('openspec-new-change');
      expect(getBrainstormRootArchiveChangeSkillTemplate().name).toBe('openspec-archive-change');
    });
  });
});
