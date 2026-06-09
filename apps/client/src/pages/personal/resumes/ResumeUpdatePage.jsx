import { useEffect, useMemo, useState } from 'react';
import { resumeApi } from '../../../api/resumeApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const proficiencyOptions = [
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
  { value: 'EXPERT', label: '전문가' },
];

function getResumeIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function toSelectedSkills(resumeSkills = [], sapSkills = []) {
  return resumeSkills
    .map((skill) => {
      const catalogSkill = sapSkills.find((item) => item.code === skill.code || item.name === skill.name);
      if (!catalogSkill) return null;
      return {
        sapSkillId: catalogSkill.id,
        proficiencyLevel: skill.proficiencyLevel || 'INTERMEDIATE',
        yearsOfExperience: skill.yearsOfExperience || 0,
        isPrimary: Boolean(skill.primary),
      };
    })
    .filter(Boolean);
}

export default function ResumeUpdatePage() {
  const resumeId = useMemo(() => getResumeIdFromUrl(), []);
  const [sapSkills, setSapSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    visibility: 'PRIVATE',
    isPrimary: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableSkills = useMemo(
    () => sapSkills.filter((skill) => !selectedSkills.some((selected) => String(selected.sapSkillId) === String(skill.id))),
    [sapSkills, selectedSkills],
  );

  useEffect(() => {
    const load = async () => {
      if (!resumeId) {
        setError('이력서 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [resume, skills] = await Promise.all([resumeApi.detail(resumeId), sapSkillApi.list()]);
        const skillList = Array.isArray(skills) ? skills : [];
        setSapSkills(skillList);
        setSelectedSkills(toSelectedSkills(resume.skills || [], skillList));
        setForm({
          title: resume.title || '',
          summary: resume.summary || '',
          visibility: resume.visibility || 'PRIVATE',
          isPrimary: Boolean(resume.isPrimary),
        });
      } catch (err) {
        setError(err.message || '이력서 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [resumeId]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const addSkill = () => {
    const skill = availableSkills[0];
    if (!skill) return;
    setSelectedSkills((current) => [
      ...current,
      {
        sapSkillId: skill.id,
        proficiencyLevel: 'INTERMEDIATE',
        yearsOfExperience: 1,
        isPrimary: current.length === 0,
      },
    ]);
  };

  const updateSkill = (sapSkillId, key, value) => {
    setSelectedSkills((current) =>
      current.map((skill) => (String(skill.sapSkillId) === String(sapSkillId) ? { ...skill, [key]: value } : skill)),
    );
  };

  const changeSkill = (previousSkillId, nextSkillId) => {
    setSelectedSkills((current) =>
      current.map((skill) => (String(skill.sapSkillId) === String(previousSkillId) ? { ...skill, sapSkillId: Number(nextSkillId) } : skill)),
    );
  };

  const removeSkill = (sapSkillId) => {
    setSelectedSkills((current) => current.filter((skill) => String(skill.sapSkillId) !== String(sapSkillId)));
  };

  const findSkill = (sapSkillId) => sapSkills.find((skill) => String(skill.id) === String(sapSkillId));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('이력서 제목을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await resumeApi.update(resumeId, {
        title: form.title.trim(),
        summary: form.summary.trim(),
        visibility: form.visibility,
        isPrimary: form.isPrimary,
        skills: selectedSkills.map((skill) => ({
          sapSkillId: Number(skill.sapSkillId),
          proficiencyLevel: skill.proficiencyLevel,
          yearsOfExperience: Number(skill.yearsOfExperience || 0),
          isPrimary: skill.isPrimary,
        })),
      });
      navigate(`${ROUTES.RESUME_DETAIL}?id=${resumeId}`);
    } catch (err) {
      setError(err.message || '이력서 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />

      <section className="resume-upload-shell">
        <header className="resume-upload-hero">
          <p className="eyebrow">SAP RESUME EDIT</p>
          <h1>이력서 수정</h1>
          <p>이력서 기본 정보와 SAP 스킬을 수정하면 AI 추천 점수에 바로 반영됩니다.</p>
        </header>

        {loading && <p className="career-copy">이력서 정보를 불러오는 중입니다.</p>}

        {!loading && error && !form.title && (
          <article className="detail-section">
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.RESUMES)}>
              목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && form.title && (
          <form className="resume-upload-layout" onSubmit={submit}>
            <section className="resume-upload-main">
              <section className="resume-upload-fields">
                <label>
                  <span>이력서 제목</span>
                  <input name="title" value={form.title} onChange={updateField} />
                </label>
                <label>
                  <span>요약 메모</span>
                  <textarea name="summary" value={form.summary} onChange={updateField} rows={5} />
                </label>
                <div className="resume-upload-options">
                  <label>
                    <span>공개 범위</span>
                    <select name="visibility" value={form.visibility} onChange={updateField}>
                      <option value="PRIVATE">비공개</option>
                      <option value="COMPANY_ONLY">기업 공개</option>
                      <option value="PUBLIC">전체 공개</option>
                    </select>
                  </label>
                  <label className="resume-checkbox">
                    <input name="isPrimary" type="checkbox" checked={form.isPrimary} onChange={updateField} />
                    <span>대표 이력서로 설정</span>
                  </label>
                </div>

                <section className="resume-skill-card" aria-label="SAP 스킬 선택">
                  <div className="resume-skill-head">
                    <div>
                      <strong>SAP 스킬</strong>
                      <span>추천 점수 계산에 직접 반영됩니다.</span>
                    </div>
                    <button type="button" className="secondary" onClick={addSkill} disabled={availableSkills.length === 0}>
                      스킬 추가
                    </button>
                  </div>

                  {selectedSkills.length === 0 && <p className="empty-copy">이 이력서에서 강조할 SAP 역량을 추가하세요.</p>}

                  {selectedSkills.map((skill) => {
                    const currentSkill = findSkill(skill.sapSkillId);
                    const selectableSkills = [currentSkill, ...availableSkills].filter(Boolean);

                    return (
                      <div className="resume-skill-row" key={skill.sapSkillId}>
                        <label>
                          <span>스킬</span>
                          <select value={skill.sapSkillId} onChange={(event) => changeSkill(skill.sapSkillId, event.target.value)}>
                            {selectableSkills.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>숙련도</span>
                          <select value={skill.proficiencyLevel} onChange={(event) => updateSkill(skill.sapSkillId, 'proficiencyLevel', event.target.value)}>
                            {proficiencyOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>경력</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={skill.yearsOfExperience}
                            onChange={(event) => updateSkill(skill.sapSkillId, 'yearsOfExperience', event.target.value)}
                          />
                        </label>
                        <label className="resume-checkbox resume-skill-primary">
                          <input
                            type="checkbox"
                            checked={skill.isPrimary}
                            onChange={(event) => updateSkill(skill.sapSkillId, 'isPrimary', event.target.checked)}
                          />
                          <span>대표</span>
                        </label>
                        <button type="button" className="resume-skill-remove" onClick={() => removeSkill(skill.sapSkillId)}>
                          삭제
                        </button>
                      </div>
                    );
                  })}
                </section>

                {error && <p className="form-error">{error}</p>}
              </section>
            </section>

            <aside className="resume-upload-ai">
              <div>
                <h2>추천 반영 기준</h2>
                <p>SAP 스킬, 숙련도, 경력 연차를 수정하면 AI 추천 공고의 매칭 점수와 매칭 스킬 표시가 달라집니다.</p>
              </div>
              <button type="submit" className="resume-analyze-button" disabled={submitting}>
                {submitting ? '저장 중...' : '수정 저장'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate(`${ROUTES.RESUME_DETAIL}?id=${resumeId}`)}>
                취소
              </button>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}
