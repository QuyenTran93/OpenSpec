import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getBrainstormRootArchiveChangeSkillTemplate,
  getBrainstormRootBrainstormSkillTemplate,
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
  getBrainstormRootBrainstormSkillTemplate: 'f5225a2a856e7bfebb3ac5e0301d97db5a8c908e1d5de6a9935f5cad216fec22',
  getBrainstormRootProposeSkillTemplate: 'd49e6c3b77c64f2e9157934d2cd120ad9d150166ae9cbcd10980503680d760a6',
  getBrainstormRootWritingPlansSkillTemplate: '68d19a6d10dca9fe7a9b1bae107b11951bdf2193efeff4e8b41a26f176184a11',
  getBrainstormRootApplyChangeSkillTemplate: '4c3ba2e6ae9b7940530d953af7394141698474d2c411eef8714f0c43714b2515',
  getBrainstormRootNewChangeSkillTemplate: '31312a0668c886984021bf20240379b93fd836ec0093a09b758f3232b3d1a70a',
  getBrainstormRootArchiveChangeSkillTemplate: '04a7eaaa12e825d17f1bf1f5edd1a81a02dc97b289fdd99abd82d1b3258396b9',
  getOpsxBrainstormRootBrainstormCommandTemplate: '63d64bff7e09c12b4c43797395147a9d4607f8dd4ef291192dddacf32ba905e6',
  getOpsxBrainstormRootProposeCommandTemplate: 'a9c9c4a27e6ea0819a10d5d93af12ac16691c81a349214075bf8e0be40cb32f6',
  getOpsxBrainstormRootWritingPlansCommandTemplate: 'ef6d5437e026be42741379f4749624aa221bc593322c24b4a86fe9b7a1dc966b',
  getOpsxBrainstormRootApplyCommandTemplate: '9c3ab7d929ae86d73cf696d60b244f4a19c9bcf25e186f993ed04303a395d77d',
  getOpsxBrainstormRootNewCommandTemplate: '7c4995a022a8a7e981f98052037893fa8f8cfe57ff9fce7d342747dcbf2e2245',
  getOpsxBrainstormRootArchiveCommandTemplate: '9a2694cae06cd58d10f75e39aa325fda20b071045ff4a5349374ee0790a73af0',
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
      getBrainstormRootApplyChangeSkillTemplate,
      getBrainstormRootNewChangeSkillTemplate,
      getBrainstormRootArchiveChangeSkillTemplate,
      getOpsxBrainstormRootBrainstormCommandTemplate,
      getOpsxBrainstormRootProposeCommandTemplate,
      getOpsxBrainstormRootWritingPlansCommandTemplate,
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

    // Note: brainstorm skill body markers moved to schema canonical content.
    // Asserted in test/schemas/brainstorm-root.instruction.test.ts.
    expect(writingSkill.instructions).toContain('docs/superpowers/plans/');
    expect(writingSkill.instructions).toContain('plan.md');
  });

  it('embeds brainstorm-root v2 workflow sequence in core brainstorm-root templates', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const applySkill = getBrainstormRootApplyChangeSkillTemplate();
    const marker = 'Workflow sequence (brainstorm-root v2)';
    expect(proposeSkill.instructions).toContain(marker);
    expect(applySkill.instructions).toContain(marker);
    expect(getBrainstormRootNewChangeSkillTemplate().instructions).toContain(marker);
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

  it('requires brainstorm-root apply templates to mention plan.md gate and planning handoff', () => {
    const applySkill = getBrainstormRootApplyChangeSkillTemplate();
    const applyCommand = getOpsxBrainstormRootApplyCommandTemplate();

    expect(applySkill.instructions).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applySkill.instructions).toContain('git commit');
    expect(applySkill.instructions).toContain('plan.md');
    expect(applySkill.instructions).not.toContain('execution-plan.md');
    expect(applySkill.instructions).toContain('writing-plans');
    expect(applySkill.instructions).toContain('superpowers:subagent-driven-development');
    expect(applySkill.instructions).toContain('superpowers:executing-plans');
    expect(applySkill.instructions).toContain('using-git-worktrees');

    expect(applyCommand.content).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applyCommand.content).toContain('git commit');
    expect(applyCommand.content).toContain('plan.md');
    expect(applyCommand.content).not.toContain('execution-plan.md');
    expect(applyCommand.content).toContain('writing-plans');
    expect(applyCommand.content).toContain('superpowers:subagent-driven-development');
    expect(applyCommand.content).toContain('superpowers:executing-plans');
    expect(applyCommand.content).toContain('using-git-worktrees');
  });

  it('requires brainstorm-root propose templates to delegate to schema instruction and write tasks.md', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();

    // propose calls openspec instructions tasks (canonical schema delegation)
    expect(proposeSkill.instructions).toContain('openspec instructions tasks --change "<name>" --schema brainstorm-root --json');
    // propose hands off to writing-plans next, not directly to apply
    expect(proposeSkill.instructions).toContain('/opsx:writing-plans');
    expect(proposeSkill.instructions).toContain('tasks.md');
    expect(proposeSkill.instructions).toContain('reconcile');

    expect(proposeCommand.content).toContain('openspec instructions tasks --change "<name>" --schema brainstorm-root --json');
    expect(proposeCommand.content).toContain('/opsx:writing-plans');
    expect(proposeCommand.content).toContain('tasks.md');
    expect(proposeCommand.content).toContain('reconcile');
  });

  it('requires brainstorm-root propose to gate on brainstorm.md existence', () => {
    const proposeSkill = getBrainstormRootProposeSkillTemplate();
    const proposeCommand = getOpsxBrainstormRootProposeCommandTemplate();

    expect(proposeSkill.instructions).toContain('phases.brainstorm.status');
    expect(proposeSkill.instructions).toContain('/opsx:brainstorm');
    expect(proposeCommand.content).toContain('phases.brainstorm.status');
    expect(proposeCommand.content).toContain('/opsx:brainstorm');
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
      expect(getBrainstormRootApplyChangeSkillTemplate().name).toBe('openspec-apply-change');
      expect(getBrainstormRootNewChangeSkillTemplate().name).toBe('openspec-new-change');
      expect(getBrainstormRootArchiveChangeSkillTemplate().name).toBe('openspec-archive-change');
    });
  });
});
