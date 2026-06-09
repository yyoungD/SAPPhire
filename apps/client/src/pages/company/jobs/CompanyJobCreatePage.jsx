import { useEffect, useMemo, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { jobApi } from '../../../api/jobApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import RichTextEditor from '../../../componenjs/editor/RichTextEditor.jsx';
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
    skills: [
      'SAP FI',
      'SAP CO',
      'SAP MM',
      'SAP SD',
      'SAP PP',
      'SAP QM',
      'SAP PM',
      'SAP HCM',
      'SAP EWM',
      'SAP WM',
      'SAP BW',
    ],
  },
  {
    title: 'SAP Solution',
    skills: [
      'SAP S/4HANA',
      'SAP SuccessFactors',
      'SAP Ariba',
      'SAP Concur',
      'SAP BTP',
      'SAP Analytics Cloud',
    ],
  },
  {
    title: '기술 및 개발',
    skills: [
      'ABAP',
      'SAP BASIS',
      'SAP Fiori',
      'SAP UI5',
      'OData',
      'CDS View',
      'SAP PI/PO',
      'SAP CPI',
      'SAP BW/4HANA',
    ],
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

function normalizeSkillGroups(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackSkillGroups.map((group) => ({
      ...group,
      skills: group.skills.map((name) => ({ id: null, name })),
    }));
  }

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

function buildDescription(form) {
  const sections = [
    form.description,
    form.position ? `<p><strong>모집 포지션</strong>: ${form.position}</p>` : '',
    form.projectType ? `<p><strong>프로젝트 유형</strong>: ${form.projectType}</p>` : '',
  ];
  return sections.filter(Boolean).join('');
}

export default function CompanyJobCreatePage() {
  const [form, setForm] = useState(initialForm);
  const [skillGroups, setSkillGroups] = useState(() => normalizeSkillGroups());
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      try {
        const skills = await sapSkillApi.list();
        if (mounted) setSkillGroups(normalizeSkillGroups(skills));
      } catch {
        if (mounted) setSkillGroups(normalizeSkillGroups());
      } finally {
        if (mounted) setLoadingSkills(false);
      }
    };

    loadSkills();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedSkillIds = useMemo(
    () =>
      selectedSkills.map((skill) => Number(skill.id)).filter((id) => Number.isFinite(id) && id > 0),
    [selectedSkills]
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
      <section className="job-create-shell">
        <div className="job-create-hero">
          <p className="eyebrow">채용 담당자 워크스페이스</p>
          <h1>공고 등록</h1>
          <p>정확한 인재 매칭을 위해 SAP 직무 요건을 상세히 입력해 주세요.</p>
        </div>

        <form className="job-create-card" onSubmit={submit}>
          <label className="job-create-field full">
            <span>공고 제목</span>
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="어떤 SAP 직무를 찾고 계신가요?"
              required
              maxLength={150}
            />
          </label>

          <div className="job-create-grid">
            <label className="job-create-field">
              <span>모집 포지션</span>
              <input
                name="position"
                value={form.position}
                onChange={updateField}
                placeholder="예: SAP FI 컨설턴트"
              />
            </label>
            <label className="job-create-field">
              <span>프로젝트 유형</span>
              <select name="projectType" value={form.projectType} onChange={updateField}>
                <option value="">선택 안 함</option>
                <option value="구축">구축</option>
                <option value="운영">운영</option>
                <option value="고도화">고도화</option>
                <option value="전환">전환</option>
              </select>
            </label>
            <label className="job-create-field">
              <span>고용 형태</span>
              <select name="employmentType" value={form.employmentType} onChange={updateField}>
                <option value="">선택 안 함</option>
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="프리랜서">프리랜서</option>
              </select>
            </label>
            <label className="job-create-field">
              <span>근무 형태</span>
              <select name="workType" value={form.workType} onChange={updateField}>
                <option value="">선택 안 함</option>
                <option value="ONSITE">상주</option>
                <option value="REMOTE">원격</option>
                <option value="HYBRID">하이브리드</option>
              </select>
            </label>
            <label className="job-create-field">
              <span>근무지</span>
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="예: 서울 강남구"
              />
            </label>
            <label className="job-create-field">
              <span>마감일</span>
              <input type="date" name="deadline" value={form.deadline} onChange={updateField} />
            </label>
            <label className="job-create-field">
              <span>최소 경력</span>
              <input
                type="number"
                min="0"
                name="minCareerYears"
                value={form.minCareerYears}
                onChange={updateField}
                placeholder="0"
              />
            </label>
            <label className="job-create-field">
              <span>최대 경력</span>
              <input
                type="number"
                min="0"
                name="maxCareerYears"
                value={form.maxCareerYears}
                onChange={updateField}
                placeholder="10"
              />
            </label>
          </div>

          <section className="job-create-skill-section">
            <div className="section-title-row">
              <div>
                <span>필요 SAP 스킬</span>
                <p>
                  {loadingSkills
                    ? 'SAP 스킬 목록을 불러오는 중입니다.'
                    : '필요한 SAP 스킬을 선택해 주세요.'}
                </p>
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

            {selectedSkills.length > 0 && (
              <div className="selected-skill-list" aria-label="선택한 SAP 스킬">
                {selectedSkills.map((skill) => (
                  <button type="button" key={skill.name} onClick={() => toggleSkill(skill)}>
                    {skill.name}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="job-create-editor-section">
            <span>공고 상세 내용</span>
            <RichTextEditor
              value={form.description}
              placeholder="직무 상세 내용 및 요구 역량을 입력해 주세요..."
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
                <input
                  type="number"
                  min="0"
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={updateField}
                  placeholder="6000"
                />
                <em>만 원</em>
              </div>
            </label>
            <label className="job-create-field">
              <span>최대 연봉/단가</span>
              <div className="salary-input-wrap">
                <input
                  type="number"
                  min="0"
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={updateField}
                  placeholder="9000"
                />
                <em>만 원</em>
              </div>
            </label>
            <label className="job-create-field full">
              <span>주요 업무</span>
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={updateField}
                rows={4}
                placeholder="예: SAP FI 모듈 운영, 결산 프로세스 개선, 사용자 요구사항 분석"
              />
            </label>
            <label className="job-create-field full">
              <span>자격 요건</span>
              <textarea
                name="qualifications"
                value={form.qualifications}
                onChange={updateField}
                rows={4}
                placeholder="예: SAP FI 구축 또는 운영 경험, ABAP 개발자와 협업 가능한 커뮤니케이션 역량"
              />
            </label>
          </div>

          <div className="job-create-options">
            <label>
              <input
                type="checkbox"
                name="salaryNegotiable"
                checked={form.salaryNegotiable}
                onChange={updateField}
              />
              <span>급여 협의 가능</span>
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={form.status === 'DRAFT'}
                onChange={updateField}
              />
              <span>임시 저장</span>
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="OPEN"
                checked={form.status === 'OPEN'}
                onChange={updateField}
              />
              <span>공개 등록</span>
            </label>
          </div>

          {message.text && (
            <p className={message.type === 'error' ? 'form-error' : 'form-success'}>
              {message.text}
            </p>
          )}

          <div className="job-create-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => navigate(ROUTES.COMPANY_JOBS)}
            >
              취소
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? '등록 중...' : '직무 게시하기'}
            </button>
          </div>
        </form>

        <aside className="job-create-ai-tip">
          <div aria-hidden="true">AI</div>
          <section>
            <strong>공고 최적화 팁</strong>
            <p>
              제목에 S/4HANA, FI, CO처럼 핵심 SAP 스킬을 포함하면 지원자 매칭 정확도를 높일 수
              있습니다.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
