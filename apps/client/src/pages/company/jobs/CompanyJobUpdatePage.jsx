import { useEffect, useMemo, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { jobApi } from '../../../api/jobApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import RichTextEditor from '../../../componenjs/editor/RichTextEditor.jsx';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const skillTypeLabels = {
  MODULE: 'SAP 모듈',
  SOLUTION: 'SAP Solution',
  TECHNICAL: '기술 및 개발',
};

const fallbackSkillGroups = [
  {
    title: 'SAP 모듈',
    skills: ['SAP FI', 'SAP CO', 'SAP MM', 'SAP SD', 'SAP PP', 'SAP QM', 'SAP PM', 'SAP HCM'].map(
      (name) => ({ id: null, name }),
    ),
  },
  {
    title: 'SAP Solution',
    skills: ['SAP S/4HANA', 'SAP SuccessFactors', 'SAP Ariba', 'SAP Concur', 'SAP BTP'].map(
      (name) => ({ id: null, name }),
    ),
  },
  {
    title: '기술 및 개발',
    skills: ['ABAP', 'SAP BASIS', 'SAP Fiori', 'SAP UI5', 'OData', 'CDS View'].map((name) => ({
      id: null,
      name,
    })),
  },
];

const initialForm = {
  title: '',
  position: '',
  projectType: '',
  employmentType: '',
  workType: '',
  location: '',
  minCareerYears: '',
  maxCareerYears: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  deadline: '',
  status: 'OPEN',
  description: '',
  responsibilities: '',
  qualifications: '',
};

function getJobIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function normalizeSkillGroups(items = []) {
  if (!Array.isArray(items) || items.length === 0) return fallbackSkillGroups;

  const groups = items.reduce((acc, item) => {
    const groupName = skillTypeLabels[item.skillType] || item.category || item.type || 'SAP 스킬';
    const name = item.name || item.skillName || item.code;
    if (!name) return acc;
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push({ id: item.id, name });
    return acc;
  }, {});

  return Object.entries(groups).map(([title, skills]) => ({ title, skills }));
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
}

function toDateInputValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '';
}

function findSelectedSkills(skillGroups, names = []) {
  const selectedNames = new Set(names);
  return skillGroups.flatMap((group) => group.skills).filter((skill) => selectedNames.has(skill.name));
}

export default function CompanyJobUpdatePage() {
  const jobId = useMemo(() => getJobIdFromUrl(), []);
  const [form, setForm] = useState(initialForm);
  const [skillGroups, setSkillGroups] = useState(() => normalizeSkillGroups());
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!jobId) {
        setMessage({ type: 'error', text: '공고 ID가 없습니다.' });
        setLoading(false);
        return;
      }

      try {
        const [job, skills] = await Promise.all([jobApi.myCompanyJobDetail(jobId), sapSkillApi.list()]);
        if (!mounted) return;

        const nextSkillGroups = normalizeSkillGroups(skills);
        setSkillGroups(nextSkillGroups);
        setSelectedSkills(findSelectedSkills(nextSkillGroups, job.skills || []));
        setAttachments(job.attachments || []);
        setForm({
          title: job.title || '',
          position: job.position || job.experienceLevel || '',
          projectType: job.projectType || '',
          employmentType: job.employmentType || '',
          workType: job.workType || '',
          location: job.location || '',
          minCareerYears: job.minCareerYears ?? '',
          maxCareerYears: job.maxCareerYears ?? '',
          salaryMin: job.salaryMin ?? '',
          salaryMax: job.salaryMax ?? '',
          salaryNegotiable: Boolean(job.salaryNegotiable),
          deadline: toDateInputValue(job.deadline),
          status: job.status || 'OPEN',
          description: job.description || '',
          responsibilities: job.responsibilities || '',
          qualifications: job.qualifications || '',
        });
      } catch (error) {
        if (mounted) setMessage({ type: 'error', text: error.message || '공고 정보를 불러오지 못했습니다.' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const selectedSkillIds = useMemo(
    () => selectedSkills.map((skill) => Number(skill.id)).filter((id) => Number.isFinite(id) && id > 0),
    [selectedSkills],
  );

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((current) => {
      const exists = current.some((item) => item.name === skill.name);
      return exists ? current.filter((item) => item.name !== skill.name) : [...current, skill];
    });
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
        responsibilities: form.responsibilities.trim() || null,
        qualifications: form.qualifications.trim() || null,
        preferredQualifications: null,
        employmentType: form.employmentType || null,
        experienceLevel: form.position || null,
        minCareerYears: toNumberOrNull(form.minCareerYears),
        maxCareerYears: toNumberOrNull(form.maxCareerYears),
        location: form.location.trim() || null,
        workType: form.workType || null,
        salaryMin: toNumberOrNull(form.salaryMin),
        salaryMax: toNumberOrNull(form.salaryMax),
        salaryNegotiable: form.salaryNegotiable,
        deadline: form.deadline || null,
        status: form.status,
        tags: [form.projectType, form.position, form.workType].filter(Boolean),
        sapSkillIds: selectedSkillIds,
        attachmentFileIds: attachments.map((file) => Number(file.id)).filter((id) => Number.isFinite(id) && id > 0),
      };

      await jobApi.updateMyCompanyJob(jobId, payload);
      navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${jobId}`);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '공고 수정에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="company-job-create-page">
        <CompanyMemberHeader active="jobs" />
        <section className="job-create-shell">
          <article className="job-create-card">
            <p className="career-copy">공고 정보를 불러오는 중입니다.</p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="company-job-create-page">
      <CompanyMemberHeader active="jobs" />
      <section className="job-create-shell">
        <div className="job-create-hero">
          <p className="eyebrow">JOB POSTING MANAGEMENT</p>
          <h1 className="company-page-title">공고 수정</h1>
          <p>등록된 공고 정보를 확인하고 필요한 내용을 수정합니다.</p>
        </div>

        <form className="job-create-card" onSubmit={submit}>
          <label className="job-create-field full">
            <span>공고 제목</span>
            <input name="title" value={form.title} onChange={updateField} required maxLength={150} />
          </label>

          <div className="job-create-grid">
            <label className="job-create-field">
              <span>모집 포지션</span>
              <input name="position" value={form.position} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>프로젝트 유형</span>
              <input name="projectType" value={form.projectType} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>고용 형태</span>
              <input name="employmentType" value={form.employmentType} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>근무 형태</span>
              <select name="workType" value={form.workType} onChange={updateField}>
                <option value="">선택 없음</option>
                <option value="ONSITE">상주</option>
                <option value="REMOTE">원격</option>
                <option value="HYBRID">하이브리드</option>
                <option value="UNSPECIFIED">미지정</option>
              </select>
            </label>
            <label className="job-create-field">
              <span>근무지</span>
              <input name="location" value={form.location} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>마감일</span>
              <input type="date" name="deadline" value={form.deadline} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>최소 경력</span>
              <input type="number" min="0" name="minCareerYears" value={form.minCareerYears} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>최대 경력</span>
              <input type="number" min="0" name="maxCareerYears" value={form.maxCareerYears} onChange={updateField} />
            </label>
          </div>

          <section className="job-create-skill-section">
            <div className="section-title-row">
              <div>
                <span>필요 SAP 스킬</span>
                <p>공고에 필요한 SAP 스킬을 선택해 주세요.</p>
              </div>
              {selectedSkills.length > 0 && <strong>{selectedSkills.length}개 선택</strong>}
            </div>

            {skillGroups.map((group) => (
              <div className="sap-skill-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="sap-skill-chip-grid">
                  {group.skills.map((skill) => {
                    const active = selectedSkills.some((item) => item.name === skill.name);
                    return (
                      <button
                        type="button"
                        key={skill.name}
                        className={active ? 'sap-skill-chip selected' : 'sap-skill-chip'}
                        onClick={() => toggleSkill(skill)}
                      >
                        #{skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="job-create-editor-section">
            <span>공고 상세 내용</span>
            <RichTextEditor
              value={form.description}
              placeholder="직무 상세 내용 및 요구 역량을 입력해 주세요."
              onUploadFile={fileApi.uploadAttachment}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
            />
          </section>

          <div className="job-create-grid">
            <label className="job-create-field">
              <span>최소 연봉/단가</span>
              <div className="salary-input-wrap">
                <input type="number" min="0" name="salaryMin" value={form.salaryMin} onChange={updateField} />
                <em>만원</em>
              </div>
            </label>
            <label className="job-create-field">
              <span>최대 연봉/단가</span>
              <div className="salary-input-wrap">
                <input type="number" min="0" name="salaryMax" value={form.salaryMax} onChange={updateField} />
                <em>만원</em>
              </div>
            </label>
            <label className="job-create-field full">
              <span>주요 업무</span>
              <textarea name="responsibilities" value={form.responsibilities} onChange={updateField} rows={4} />
            </label>
            <label className="job-create-field full">
              <span>자격 요건</span>
              <textarea name="qualifications" value={form.qualifications} onChange={updateField} rows={4} />
            </label>
          </div>

          <div className="job-create-options">
            <label>
              <input type="checkbox" name="salaryNegotiable" checked={form.salaryNegotiable} onChange={updateField} />
              <span>급여 협의 가능</span>
            </label>
            <label>
              <input type="radio" name="status" value="DRAFT" checked={form.status === 'DRAFT'} onChange={updateField} />
              <span>임시 저장</span>
            </label>
            <label>
              <input type="radio" name="status" value="OPEN" checked={form.status === 'OPEN'} onChange={updateField} />
              <span>공개</span>
            </label>
            <label>
              <input type="radio" name="status" value="CLOSED" checked={form.status === 'CLOSED'} onChange={updateField} />
              <span>마감</span>
            </label>
          </div>

          {message.text && <p className={message.type === 'error' ? 'form-error' : 'form-success'}>{message.text}</p>}

          <div className="job-create-actions">
            <button type="button" className="secondary" onClick={() => navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${jobId}`)}>
              취소
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
