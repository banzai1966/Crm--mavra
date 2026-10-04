const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// 1. Add InstagramConfig interface and extend AgentConfig if not already present
if (!content.includes('InstagramConfig')) {
  const insertIndex = content.indexOf('export interface AppointmentSlot');
  const instagramConfigDef = `export interface InstagramConfig {
  enabled: boolean;
  isConnected: boolean;
  username: string; // Ex: dra.lucymurata
  fullName?: string;
  profilePicUrl?: string;
  pageId?: string;
  instagramId?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
  autoReplyComments: boolean;
  commentTriggerKeywords: string[]; // ['AVALIACAO', 'AGENDA', 'CRM', 'SORRISO', 'CANAL']
  commentPublicReplyText: string;
  directWelcomePrompt: string;
  directAutoQualify: boolean;
  leadCaptureMoveToStage: string;
  connectedAt?: string;
}

`;
  content = content.slice(0, insertIndex) + instagramConfigDef + content.slice(insertIndex);
}

// 2. Add instagramConfig to AgentConfig if not present
if (!content.includes('instagramConfig?: InstagramConfig;')) {
  content = content.replace(
    'showCalendarModuleInMenu?: boolean;',
    'showCalendarModuleInMenu?: boolean;\n  instagramConfig?: InstagramConfig;'
  );
}

fs.writeFileSync('src/types.ts', content, 'utf8');
console.log('src/types.ts updated successfully');
