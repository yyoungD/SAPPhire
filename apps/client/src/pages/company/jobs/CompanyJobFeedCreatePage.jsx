import { useState } from 'react';
import { jobApi } from '../../../api/jobApi.js';
import RichTextEditor from '../../../componenjs/editor/RichTextEditor.jsx';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

export default function CompanyJobFeedCreatePage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const updateTitle = (event) => {
    setForm((current) => ({ ...current, title: event.target.value }));
  };

  const updateDescription = (value) => {
    setForm((current) => ({ ...current, description: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: '공고 제목을 입력해 주세요.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        responsibilities: null,
        qualifications: null,
        preferredQualifications: null,
        employmentType: null,
        experienceLevel: null,
        minCareerYears: null,
        maxCareerYears: null,
        location: null,
        workType: null,
        salaryMin: null,
        salaryMax: null,
        salaryNegotiable: false,
        deadline: null,
        status: 'OPEN',
        tags: [],
        sapSkillIds: [],
        attachmentFileIds: [],
      };

      const created = await jobApi.create(payload);
      navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${created.id}`);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '공고 등록에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="company-job-create-page">
      <CompanyMemberHeader active="create" />
      <section className="job-create-shell">
        <div className="job-create-hero">
          <p className="eyebrow">Job Posting</p>
          <h1 className="company-page-title">공고 등록</h1>
          <p>공고 제목과 본문을 입력해 채용 피드를 등록해 주세요.</p>
        </div>

        <form className="job-create-card" onSubmit={submit}>
          <label className="job-create-field full">
            <span>공고 제목</span>
            <input
              name="title"
              value={form.title}
              onChange={updateTitle}
              placeholder="어떤 SAP 직무를 찾고 계신가요?"
              required
              maxLength={150}
            />
          </label>

          <section className="job-create-editor-section">
            <span>공고 본문</span>
            <RichTextEditor
              value={form.description}
              placeholder="직무 소개, 주요 업무, 필요 역량 등을 자유롭게 작성해 주세요."
              onChange={updateDescription}
            />
          </section>

          {message.text && (
            <p className={message.type === 'error' ? 'form-error' : 'form-success'}>
              {message.text}
            </p>
          )}

          <div className="job-create-actions">
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
              취소
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? '등록 중...' : '공고 게시하기'}
            </button>
          </div>
        </form>

        <aside className="job-create-ai-tip">
          <div aria-hidden="true">AI</div>
          <section>
            <strong>공고 작성 팁</strong>
            <p>제목과 본문에 SAP 모듈, 프로젝트 유형, 근무 조건을 함께 적으면 지원자가 빠르게 이해할 수 있습니다.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
