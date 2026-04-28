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
  getOpsxUpdateCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getUpdateChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '1ed2dfea7d1f020ba4515d1814f2a139fd070a9c0a7c08a726e49bd65a033930',
  getNewChangeSkillTemplate: 'd2b4be99614c57ae5b7d48e477d462729fafb063b0a7418d73372ff35eee6cfc',
  getContinueChangeSkillTemplate: '676e7472977d2b6f4d922ce384db1f15020c195f94d6cd4ee71abcf0201e28a9',
  getApplyChangeSkillTemplate: '031cf8f8ffc2937fc4051651bd5e1fc6159bfd225605d8e4c3181054a4e52b38',
  getFfChangeSkillTemplate: '225a8eaf1b3769ac5d43e079297c5fa9cc20fc2e34fec9bb0d887c8c1fb0ea71',
  getSyncSpecsSkillTemplate: '977a753b03daa33ddb8aa9bcc632e10d82062c02749a0c821ecc338311251186',
  getOnboardSkillTemplate: '31dffc7c3b8d75ffbd59ed751d6a1550b885b20ef90e12d236262127ee4021e9',
  getOpsxExploreCommandTemplate: 'e9674ddace813e685b0e9fe37149140a3d33d48aa20b9ba2b0963a7c49c9aea7',
  getOpsxNewCommandTemplate: '652adc870f16bb260d54436356132b6ee051a9ed7cc0464603fb31f4db259762',
  getOpsxContinueCommandTemplate: 'bcf0ad1c55b71346147c5b4dbaed016c77c9718f960012d8efc9d3d2089d0e00',
  getOpsxApplyCommandTemplate: '18c82fc48e65084065171e44f811db8fdc96bd6cb0f61fe8f31324207f4861c7',
  getOpsxFfCommandTemplate: '678375642a21d255444f0ba717e659abb2cc2b7474981d52eae900a0793e3e4d',
  getArchiveChangeSkillTemplate: '7c1bf2170ba57833f111c79002ea56be3cca499e2b13b2ea8141c182351b1a3b',
  getBulkArchiveChangeSkillTemplate: 'de198c7b7c1472773b013b9af917de27773fd613083309f0e8e607c005c92d3d',
  getOpsxSyncCommandTemplate: 'b1f3fea6a9d4e84f401f411a0fefe330ad9ee81cff065a578f4057386c5d81fa',
  getVerifyChangeSkillTemplate: '917de96cc8341799107b0617979cdaf30e121c51676272f5caef143b090583f9',
  getOpsxArchiveCommandTemplate: 'fa0d2f4c1ff9b499353399ba040caaf2ba070154dac8b94cb4ca8e2568b1717a',
  getOpsxOnboardCommandTemplate: 'e69a5aa37749727290c05b687981dd69f3b17a55514a118d088c4124c5fd8505',
  getOpsxBulkArchiveCommandTemplate: '93355fb7bc13e549e8646e4dc48db6f98ac5372545dff3cf3970c4f45f55c5f7',
  getOpsxVerifyCommandTemplate: '29e3913c93566e689971d8c15c3348ba4169ebf6b1d403f5ac9974605c734baa',
  getOpsxProposeSkillTemplate: '06a8f7d272db8d3cb113dc05d606630d1e5aedd267c2722e971d1175e0d8bb40',
  getOpsxProposeCommandTemplate: 'ed3ad596d9bb238830b4fcbe566e3c1ba9d0db62f4a92cdb28c38262dc3f04df',
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
  getUpdateChangeSkillTemplate: 'da1f76a91ba606df6aa895431c79e64ca91580fa952807230e653bddeb2a3c15',
  getOpsxUpdateCommandTemplate: 'afbf85f79177a0125bbc2028ed50e23f59ea96c2b6ef4153ed9bce6465c6414e',
};

const EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES: Record<string, string> = {
  getBrainstormRootBrainstormSkillTemplate: '13ad63df6a65f76ec09d4213400b90ea9fd2a2e5d8ba46a3b11bde852cae52e7',
  getBrainstormRootProposeSkillTemplate: '87f3398628973c428fc74d90bc96711beb20f32618a073be28e3ee9965586105',
  getBrainstormRootWritingPlansSkillTemplate: '713a26abe03e8c9d41facf78137d7820d7dc613d86dc1046b3e78f2076417d28',
  getBrainstormRootApplyChangeSkillTemplate: '5ca80544d64a87129d0e5a4d9bbeb8d9068e15dc6007e124d6e375a16282dd97',
  getBrainstormRootNewChangeSkillTemplate: '565ee2b1f9e1658312ac8dba3253a2c871ab9bb0df26c0c27b2aaed9b88e3998',
  getBrainstormRootArchiveChangeSkillTemplate: '739b1e99467c9dfdf142ba66163ed460ad027a6869f0baad3c11a0f65dff91fd',
  getOpsxBrainstormRootBrainstormCommandTemplate: '750d0c0ec014b06c0a9518722ec3030f92472e595774e2ac229f2f36a879cfa4',
  getOpsxBrainstormRootProposeCommandTemplate: 'be5bfe39018590a2a515e10de511409d583b0e8e54443f7a4fa73cad87093041',
  getOpsxBrainstormRootWritingPlansCommandTemplate: '8de9eb176cee8871ad5ed1fcf61ddc53e089c4cbdac60832fc36fa9ab3b6f801',
  getOpsxBrainstormRootApplyCommandTemplate: '5fd9065e42727c935bde3a4f249e7ecc23282908b8751385f37fe763020f7d7c',
  getOpsxBrainstormRootNewCommandTemplate: 'c403c4f252a30f4ddb39c5e3375062e07bd23080faa4c1c3a4ce3bdc428bd39c',
  getOpsxBrainstormRootArchiveCommandTemplate: 'b51b9629c01f47243843ea20a9b31b9545f5dda5a017a70b1dfb967b806da808',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '67eeacf1c797eebbc20926555c1a29cbc06fdd12aae5b8f06acf3d0445e1a51a',
  'openspec-new-change': 'b56c7f8dd85b462c9fea5c36eeaadff9b231b41e21dde12f156fb261959aa82a',
  'openspec-continue-change': '2e1a7d17ec021949d115c72227729609bf9980ad1f23445af117c09834711121',
  'openspec-apply-change': '49fc5772404e3033085384ee214c44488c93880a596a9a05dcad42f9ce86cf83',
  'openspec-ff-change': '4228d75e3571097164f2360e2ad3063a5b88d44750078c3601b23a89e74c1de6',
  'openspec-sync-specs': 'db79c625bbfa3aaf948812fda5965eda876264973c9c5c4bbeac4a48df77f97d',
  'openspec-archive-change': '84b9d3a5690b8d64e1845b3c7368a4ad43369ea8549a76ef78912690d434363b',
  'openspec-bulk-archive-change': '5ac320e2004e453c78541233f48e5f6e246cc674a44f1e427cecb7b2e9587f9b',
  'openspec-verify-change': '1c3f73a36be691a18d3acb200d22e6874004d6d4a5d3e2e346ae95a7379e9da8',
  'openspec-onboard': 'f2440f59c22b1ac9db33247b23a6fa32fb9cd418dc196486a213f5d7e91b1dbc',
  'openspec-propose': '6b49634d3672e7fef4750a8c7572a661fec0dafe6d52a0075b41a2c87a793871',
  'openspec-update-change': '1e61edfcd229b5b3e7ea957a5606712805cae19709304b26448fe111657a7255',
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

// Intentionally excludes getFeedbackSkillTemplate: this list only models templates
// deployed via generateSkillContent, while feedback is covered in function payload parity.
const GENERATED_SKILL_FACTORIES: Array<[string, () => SkillTemplate]> = [
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
  ['openspec-update-change', getUpdateChangeSkillTemplate],
];

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
      getUpdateChangeSkillTemplate,
      getOpsxUpdateCommandTemplate,
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
    const actualHashes = Object.fromEntries(
      GENERATED_SKILL_FACTORIES.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  // The assertion above only compares the skills this file already lists, so a
  // workflow added to getSkillTemplates() but never pinned here would ship with
  // no golden hash and nothing would fail. Pin the registry itself.
  it('pins every skill the production registry deploys', () => {
    const pinned = GENERATED_SKILL_FACTORIES.map(([dirName]) => dirName).sort();
    const deployed = getSkillTemplates().map(({ dirName }) => dirName).sort();

    expect(pinned, 'add the new skill to GENERATED_SKILL_FACTORIES and EXPECTED_GENERATED_SKILL_CONTENT_HASHES').toEqual(deployed);
  });

  // Iterating the production registries (not a local list) means a newly
  // added workflow is covered automatically; the full-constant containment
  // check fails if any template's interpolation drifts.
  it('teaches store selection in every deployed skill template', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain(STORE_SELECTION_GUIDANCE);
    }
  });

  // Auto-approve the OpenSpec CLI: every generated skill carries
  // `allowed-tools: Bash(openspec:*)` so agents that honor it stop prompting
  // on each `openspec` call. Iterating the registry covers new skills too.
  it('pre-approves the openspec CLI via allowed-tools in every deployed skill', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain('allowed-tools: Bash(openspec:*)');
    }
  });

  it('teaches store selection in every deployed opsx command template', () => {
    for (const entry of getCommandContents()) {
      expect(entry.body, entry.id).toContain(STORE_SELECTION_GUIDANCE);
    }

    // Feedback has no store-capable command and intentionally carries no
    // store teaching; it ships outside both registries.
    expect(getFeedbackSkillTemplate().instructions).not.toContain('**Store selection:**');
  });

  it('generates no workspace-planning residue in any workflow template (4.1)', () => {
    const allSkills: Array<[string, () => SkillTemplate]> = [
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
    ];

    for (const [dirName, createTemplate] of allSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');
      expect(content, dirName).not.toContain('workspace-planning');
      expect(content, dirName).not.toContain('Workspace guard');
    }
  });

  it('gates the archive on a completed spec sync (#1393)', () => {
    const generatedSkill = generateSkillContent(getArchiveChangeSkillTemplate(), 'PARITY-BASELINE');
    const commandContent = getOpsxArchiveCommandTemplate().content;

    // The single archive skill references openspec-sync-specs; opsx command references /opsx:sync.
    expect(generatedSkill, 'skill').toContain('run the `openspec-sync-specs` workflow inline');
    expect(commandContent, 'opsx command').toContain('run the `/opsx:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['skill', generatedSkill],
      ['opsx command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Do not delegate it to a background task');
      expect(content, variant).toContain('Never archive while a spec sync is still in flight');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED requirements carrying the scenario and description changes');
      expect(content, variant).toContain('REMOVED requirements gone');
      expect(content, variant).toContain('RENAMED requirements present under the new name and absent under the old one');

      // Verification is bound to the delta specs on disk, not to whatever the sync reports it touched.
      expect(content, variant).toContain('not only the ones the sync reports it touched');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability>/spec.md');
    }
  });

  it('gates bulk archive on inline synchronous spec sync and verification before moving change root', () => {
    const generatedSkill = generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE');
    const commandContent = getOpsxBulkArchiveCommandTemplate().content;

    // The bulk archive skill references openspec-sync-specs; opsx command references /opsx:sync.
    expect(generatedSkill, 'bulk skill').toContain('run the `openspec-sync-specs` workflow inline');
    expect(commandContent, 'bulk opsx command').toContain('run the `/opsx:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['bulk skill', generatedSkill],
      ['bulk opsx command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Do not delegate to a background task');
      expect(content, variant).toContain('Never archive a change while a spec sync is still in flight');
      expect(content, variant).toContain('Verify included delta specs before moving changeRoot');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED requirements carrying scenario and description changes');
      expect(content, variant).toContain('REMOVED requirements gone');
      expect(content, variant).toContain('RENAMED requirements present under the new name and absent under the old one');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability>/spec.md');
    }
  });

  it('carries mixed included and excluded bulk-archive deltas through both generated variants', () => {
    const variants: Array<[string, string]> = [
      [
        'bulk skill',
        generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE'),
      ],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        'An inclusion or exclusion decision for every delta spec'
      );
      expect(content, variant).toContain(
        'A single change can have both included and excluded delta specs'
      );
      expect(content, variant).toContain(
        'passing only the included delta paths and explicitly instructing it to ignore'
      );
      expect(content, variant).not.toContain(
        'for each change, passing the delta spec analysis'
      );
      expect(content, variant).toContain(
        'Re-run the comparison only for delta specs in `includedDeltas`'
      );
      expect(content, variant).toContain(
        'Do not verify delta specs in `excludedDeltas`'
      );
      expect(content, variant).toContain('report `sync skipped`');
      expect(content, variant).toContain(
        '`sync skipped` without treating the archive itself as skipped'
      );

      // These three carried no assertion, so deleting any of them from a
      // single variant was caught only by the golden hash — and this repo
      // regenerates hashes as a matter of routine, which makes that no
      // protection at all.
      expect(content, variant).toContain(
        '`includedDeltas`: all non-conflicting delta specs from confirmed changes plus conflict deltas selected for sync'
      );
      expect(content, variant).toContain(
        '`excludedDeltas`: conflict deltas from confirmed changes excluded because their implementation is missing'
      );
      expect(content, variant).toContain(
        'Carry the per-delta `includedDeltas` and `excludedDeltas` decisions into execution'
      );
      // The worked example must show the skip, or the agent has no model of
      // what a partially-synced batch report looks like.
      expect(content, variant).toContain(
        '1 delta spec sync skipped (add-jwt/auth: implementation not found)'
      );
    }
  });

  it('lets the sync workflow honor the delta subset bulk archive hands it', () => {
    // Bulk archive tells sync to ignore excludedDeltas, but sync treats
    // existingOutputPaths as its own source of truth. Without an explicit
    // carve-out the callee re-syncs the delta the caller withheld, step 8b
    // never checks it (it verifies only includedDeltas), and the run still
    // reports `sync skipped` for a spec that was in fact written.
    const variants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        'A caller narrows it by naming an explicit list of delta spec paths to sync'
      );
      expect(content, variant).toContain(
        'sync only the named paths and leave the remaining delta specs untouched'
      );
      expect(content, variant).toContain(
        'never widen it back to the full\n   list'
      );
      expect(content, variant).toContain(
        'Honor a caller-supplied subset of `existingOutputPaths`'
      );

      // Step 4 is the operative loop. Narrowing step 3 alone left the loop
      // still iterating "each path returned by the CLI", which re-widens the
      // set and re-syncs the delta the caller withheld — the original bug,
      // one step further down the template.
      expect(content, variant).toContain(
        'For each capability delta spec path selected in step 3'
      );
      expect(content, variant).not.toContain(
        'For each capability delta spec path returned by the CLI'
      );

      // The undefined edges: a named path outside existingOutputPaths, and an
      // empty named list. Both must stop rather than proceed on a guess.
      expect(content, variant).toContain(
        'If a named path is not in `existingOutputPaths`, do not sync it'
      );
      expect(content, variant).toContain(
        'If the named list is\n   empty, report that there is nothing to sync and stop'
      );
    }
  });

  it('requires apply context while keeping guidance advisory and state separate', () => {
    const variants: Array<[string, string]> = [
      ['apply skill', getApplyChangeSkillTemplate().instructions],
      ['apply command', getOpsxApplyCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Optional `context`');
      expect(content, variant).toContain('Optional `operationGuidance`');
      expect(content, variant).toContain('Treat `context` as a required prompt-level input');
      expect(content, variant).toContain('apply relevant project facts, conventions, and constraints');
      expect(content, variant).toContain(
        'Treat `operationGuidance` as optional additive advice'
      );
      expect(content, variant).toContain('Read and consider every');
      expect(content, variant).toContain('applicable and compatible with the built-in');
      expect(content, variant).toContain(
        'separate from CLI-returned state, missing artifacts, tasks'
      );
      expect(content, variant).toContain(
        'Do not use context or operation guidance as proof that a task is complete'
      );
      expect(content, variant).toContain('conflict and preserve the controlling value');
      expect(content, variant).toContain('do not follow it and explain why');
      expect(content, variant).toContain(
        'Do not copy runtime context or operation guidance into implementation files or planning artifacts'
      );
      expect(content, variant).toContain(
        'Preserve CLI-controlled blocked/ready/all-done behavior'
      );
      expect(content, variant).toContain(
        'These are prompt-level behavior contracts, not enforceable checks'
      );
    }
  });

  it('makes the archive-inputs lookup fail open and sync instruction consumption fail closed', () => {
    const archiveVariants: Array<[string, string]> = [
      ['archive skill', getArchiveChangeSkillTemplate().instructions],
      ['archive command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of archiveVariants) {
      expect(content, variant).toContain(
        'openspec instructions archive --change "<name>" --json'
      );
      expect(content, variant).toContain('same selected-root flags');
      // The archive-inputs lookup is a new CLI command, so a skill installed
      // ahead of the CLI (skills.sh) must degrade instead of blocking archiving.
      expect(content, variant).toContain('advisory and\n   optional');
      expect(content, variant).toContain('must never block archiving');
      expect(content, variant).toContain('older CLI that\n   does not support this command yet');
      expect(content, variant).toContain(
        'continue the archive workflow with no\n   context and no operation guidance'
      );
      expect(content, variant).toContain('Do not report an error and do not stop');
      expect(content, variant).not.toContain(
        'stop before inspecting or\n   writing specs or moving the change'
      );
      expect(content, variant).toContain('successful response may omit both optional fields');
      expect(content, variant).toContain(
        'Treat `context` as a\n   required prompt-level input'
      );
      expect(content, variant).toContain(
        'Treat `operationGuidance` as optional\n   additive advice'
      );
      expect(content, variant).toContain('read and consider every entry');
      expect(content, variant).toContain('report the conflict and preserve the controlling value');
      expect(content, variant).toContain('do not follow it\n   and explain why');
      expect(content, variant).toContain(
        '`artifactPaths.specs.existingOutputPaths` from status JSON as the only'
      );
      expect(content, variant).toContain('`specs` entry is missing');
      expect(content, variant).toContain('do not infer\n   delta specs from other artifacts');
      expect(content, variant).toContain(
        'openspec instructions specs --change "<name>" --json'
      );
      expect(content, variant).toContain('stop\n   before writing any main spec or moving the change');
      expect(content, variant).toContain('valid response with omitted\n   `rules`');
      expect(content, variant).toContain('inline sync must reuse that snapshot');
      expect(content, variant).toContain('do not use them as archive guidance');
      expect(content, variant).toContain(
        'Existing CLI checks, resolved paths, prompts, and command contracts are unchanged'
      );
      expect(content, variant).toContain(
        'Never copy runtime context, operation guidance, or artifact-rule text verbatim'
      );
      expect(content, variant).toContain(
        'Artifact rules constrain only the specs being written and are never operation guidance'
      );
    }

    const syncVariants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of syncVariants) {
      expect(content, variant).toContain(
        '`artifactPaths.specs.existingOutputPaths` from the status JSON as the'
      );
      expect(content, variant).toContain('`specs` entry is missing');
      expect(content, variant).toContain('do not infer them from other artifacts');
      expect(content, variant).toContain('reuse it and do not\n     fetch the same instructions again');
      expect(content, variant).toContain('Otherwise run that command once now');
      expect(content, variant).toContain('stop before writing any main spec');
      expect(content, variant).toContain('Do not treat the\n     failure as an absent rule set');
      expect(content, variant).toContain('valid response with omitted `rules`');
      expect(content, variant).toContain('Artifact rules are not operation guidance');
      expect(content, variant).toContain('without copying it verbatim');
    }
  });

  it('keeps bulk archive instruction lookups atomic across mixed-schema batches', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', getBulkArchiveChangeSkillTemplate().instructions],
      ['bulk command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('archive inputs once for the selected root');
      expect(content, variant).toContain(
        'openspec instructions archive --change "<selected-change>" --json'
      );
      // Same rule as the single-change skill: a missing archive-inputs command
      // must not take down a whole batch.
      expect(content, variant).toContain('advisory and optional');
      expect(content, variant).toContain('must never block the batch');
      expect(content, variant).toContain(
        'continue the batch with no context and no operation guidance'
      );
      expect(content, variant).not.toContain(
        'stop the whole batch before inspecting specs, writing main specs'
      );
      expect(content, variant).toContain(
        'Treat this list as the only delta-spec source'
      );
      expect(content, variant).toContain('missing or the list is empty');
      expect(content, variant).toContain('mixed-schema\n        batches');
      expect(content, variant).toContain('fetch every\n   required specs-rule snapshot');
      expect(content, variant).toContain(
        'Obtain all snapshots before the first write or move'
      );
      expect(content, variant).toContain(
        'stop the whole batch before\n   any main-spec write or change move'
      );
      expect(content, variant).toContain(
        'sync must reuse it without fetching instructions again'
      );
      expect(content, variant).toContain(
        'Treat\n   `context` as a required prompt-level input across the batch'
      );
      expect(content, variant).toContain(
        'Treat\n   `operationGuidance` as optional additive advice'
      );
      expect(content, variant).toContain('read and consider every');
      expect(content, variant).toContain('report the conflict and preserve the controlling');
      expect(content, variant).toContain('do not\n   follow it and explain why');
      expect(content, variant).toContain(
        'Keep runtime inputs, conflict analysis, CLI-derived values, and artifact rules separate'
      );
      expect(content, variant).toContain(
        'Artifact rules constrain only written specs'
      );
      expect(content, variant).toContain(
        'Never copy runtime input or artifact-rule text verbatim into output files'
      );
    }
  });

  // The archive instructions must mirror `openspec archive`'s date-prefix
  // rule (#1316): a change already named with a `YYYY-MM-DD-` prefix keeps
  // its name, so archived names never stack dates. Guard the caveat, the
  // literal `mv` target, and the success-summary examples an agent would
  // copy verbatim (#1317).
  it('never instructs stacking a date prefix on an already-dated change (#1317)', () => {
    const archiveInstructions: Array<[string, string]> = [
      ['openspec-archive-change', getArchiveChangeSkillTemplate().instructions],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate().instructions],
      ['openspec-onboard', getOnboardSkillTemplate().instructions],
      ['opsx-archive', getOpsxArchiveCommandTemplate().content],
      ['opsx-bulk-archive', getOpsxBulkArchiveCommandTemplate().content],
      ['opsx-onboard', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [id, text] of archiveInstructions) {
      expect(text, id).toContain('already starts with a `YYYY-MM-DD-` prefix');

      // Every archive path an agent reproduces must name the derived target,
      // never a hardcoded date.
      expect(text, id).toContain('<target-name>');

      // Discriminator: a `YYYY-MM-DD-` after a path separator belongs to a
      // literal archive path the agent copies verbatim. The rule statements
      // only name the prefix, never place it in a path, so they stay legal.
      expect(text, id).not.toMatch(/\/YYYY-MM-DD-/);
    }
  });

  // Covers both archive paths, not just the bulk one the fix targeted: the
  // single-change routing has been correct since #1357 (current wording from
  // #1394) but was never pinned, so a stale branch could silently reopen the
  // bug #1381 actually reported.
  it('honors Cancel at every archive confirmation (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
      ['single skill', generateSkillContent(getArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['single opsx command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // Offering "Cancel" without routing it let an agent fall straight through
      // to the archive step and move the changes anyway.
      expect(content, variant).toContain('"Cancel" — stop, do not archive');

      // An unrecognized answer must re-prompt; archiving is never the default.
      expect(content, variant).toContain('Anything else — ask again rather than archiving');
    }
  });

  // The bulk confirmation labels are written by the agent and carry an `N`
  // placeholder, so routing must match intent — matching the literal labels
  // would send every legitimate answer down the "ask again" path forever.
  it('routes the bulk archive confirmation by intent, not by literal label (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Route on the answer by intent, not by exact label');

      // The ready-only route has to name where "ready" is decided, or the agent
      // cannot tell which subset to archive.
      expect(content, variant).toContain('the changes the step 6 table marks');

      // A cancelled batch must archive nothing, reinforced where agents skim.
      expect(content, variant).toContain(
        'Never archive after the user cancels the confirmation'
      );
    }
  });

  it('makes the schema instruction field authoritative for artifact creation (#777)', () => {
    const variants: Array<[string, string]> = [
      ['propose skill', generateSkillContent(getOpsxProposeSkillTemplate(), 'PARITY-BASELINE')],
      ['propose command', getOpsxProposeCommandTemplate().content],
      ['continue skill', generateSkillContent(getContinueChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['continue command', getOpsxContinueCommandTemplate().content],
      ['ff skill', generateSkillContent(getFfChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['ff command', getOpsxFfCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // The instruction field wins even for familiar artifact names: the old
      // hard-coded "Common artifact patterns" shortcut is what let agents
      // ignore custom schemas that reuse proposal.md/tasks.md file names.
      expect(content, variant).toContain('the authoritative guidance');
      expect(content, variant).not.toContain('Common artifact patterns');

      // Delegated creation is honored at the creation step itself, and the
      // delegated skill's output is verified rather than assumed.
      expect(content, variant).toContain(
        'If the `instruction` field delegates creation to a specific skill or command, invoke it to produce the artifact instead of writing the file yourself, then verify the artifact file exists at `resolvedOutputPath`'
      );

      // ...and restated in the artifact-creation guidelines.
      expect(content, variant).toContain(
        'If the `instruction` field directs you to use a specific skill or command to create the artifact, invoke it instead of writing the artifact directly'
      );
    }
  });

  it('requires brainstorm-root apply templates to mention plan.md gate and planning handoff', () => {
    const applySkill = getBrainstormRootApplyChangeSkillTemplate();
    const applyCommand = getOpsxBrainstormRootApplyCommandTemplate();

    expect(applySkill.instructions).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applySkill.instructions).toContain('git commit');
    expect(applySkill.instructions).toContain('plan.md');
    expect(applySkill.instructions).not.toContain('execution-plan.md');
    expect(applySkill.instructions).toContain('writing-plans');
    expect(applySkill.instructions).toContain('superpowers:test-driven-development');
    expect(applySkill.instructions).toContain('superpowers:requesting-code-review');
    expect(applySkill.instructions).toContain('superpowers:verification-before-completion');
    expect(applySkill.instructions).toContain('superpowers:executing-plans');
    expect(applySkill.instructions).toContain('using-git-worktrees');

    expect(applyCommand.content).toContain('schemas/brainstorm-root/schema.yaml');
    expect(applyCommand.content).toContain('git commit');
    expect(applyCommand.content).toContain('plan.md');
    expect(applyCommand.content).not.toContain('execution-plan.md');
    expect(applyCommand.content).toContain('writing-plans');
    expect(applyCommand.content).toContain('superpowers:test-driven-development');
    expect(applyCommand.content).toContain('superpowers:requesting-code-review');
    expect(applyCommand.content).toContain('superpowers:verification-before-completion');
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
