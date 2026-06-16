import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

const AI_COVER_LETTER_API_KEY = import.meta.env.VITE_AI_COVER_LETTER_API_KEY || '';
const AI_COVER_LETTER_API_ENABLED = import.meta.env.VITE_AI_COVER_LETTER_API_ENABLED === 'true';

const coverLetterDrafts = [
  ({ title, company, skills }) =>
    `${company}의 ${title} 포지션에서 요구하는 역량과 제 경험이 잘 맞는다고 판단해 지원합니다. ${skills} 역량을 바탕으로 ERP 운영 안정화와 프로세스 개선 과제를 책임감 있게 수행하고, 현업과 개발 조직 사이에서 실행 가능한 해결책을 제시하겠습니다.`,
  ({ title, company, skills }) =>
    `${company} ${title} 직무를 통해 SAP 기반 업무 혁신에 기여하고 싶습니다. ${skills} 경험을 활용해 요구사항을 정확히 해석하고, 데이터와 업무 흐름을 함께 고려한 개선안을 빠르게 실무에 적용하겠습니다.`,
  ({ title, company, skills }) =>
    `저는 ${skills} 역량을 중심으로 SAP 프로젝트와 운영 업무에서 안정적인 결과를 만드는 데 강점이 있습니다. ${company}의 ${title} 포지션에서도 업무 이해도와 협업 능력을 바탕으로 시스템 품질과 사용자 만족도를 함께 높이겠습니다.`,
  ({ title, company, skills }) =>
    `${title} 직무에 필요한 분석력, 커뮤니케이션, 실행력을 갖춘 지원자라고 생각합니다. ${skills} 경험을 바탕으로 ${company}의 SAP 운영 환경을 빠르게 이해하고, 반복 이슈를 줄이는 실질적인 개선을 만들어가겠습니다.`,
  ({ title, company, skills }) =>
    `${company}에서 ${title} 역할을 수행하며 비즈니스 요구와 SAP 시스템 구현 사이의 간극을 줄이고 싶습니다. ${skills} 기반의 실무 경험으로 문제를 구조화하고, 협업 과정에서 신뢰할 수 있는 결과물을 제공하겠습니다.`,
];

function normalizeDraftContext(context = {}) {
  return {
    title: context.jobTitle || '지원 직무',
    company: context.companyName || '지원 기업',
    skills: context.skills?.length ? context.skills.slice(0, 4).join(', ') : 'SAP 프로젝트 경험',
  };
}

function createLocalCoverLetterDraft(context) {
  const draftContext = normalizeDraftContext(context);
  const draft = coverLetterDrafts[Math.floor(Math.random() * coverLetterDrafts.length)];
  return draft(draftContext);
}

async function generateCoverLetterDraft(context = {}) {
  if (!AI_COVER_LETTER_API_ENABLED && !AI_COVER_LETTER_API_KEY) {
    return createLocalCoverLetterDraft(context);
  }

  try {
    const draft = await apiClient(`${API_PATHS.ai}/cover-letter-draft`, {
      method: 'POST',
      headers: AI_COVER_LETTER_API_KEY ? { 'X-AI-API-Key': AI_COVER_LETTER_API_KEY } : undefined,
      body: context,
    });

    return draft?.coverLetter || draft?.draft || draft?.content || createLocalCoverLetterDraft(context);
  } catch (error) {
    console.warn('AI cover letter draft API failed. Falling back to a local draft.', error);
    return createLocalCoverLetterDraft(context);
  }
}

export const aiApi = {
  ...createResourceApi(API_PATHS.ai),
  generateCoverLetterDraft,
};
