import { useEffect, useMemo, useState } from 'react';
import { aiApi } from '../../api/aiApi.js';
import { applicationApi } from '../../api/applicationApi.js';
import { fileApi } from '../../api/fileApi.js';
import { jobApi } from '../../api/jobApi.js';
import { resumeApi } from '../../api/resumeApi.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../constanjs/routes.js';
import { navigate } from '../../utils/authUtils.js';

function getJobIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function scoreTone(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  return 'quiet';
}

export default function JobApplyPage() {
  const jobId = useMemo(() => getJobIdFromUrl(), []);
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [desiredSalary, setDesiredSalary] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadApplyData = async () => {
      if (!jobId) {
        setError('채용 공고 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [jobData, resumeData] = await Promise.all([jobApi.detail(jobId), resumeApi.list()]);
        const loadedResumes = Array.isArray(resumeData) ? resumeData : [];
        setJob(jobData);
        setResumes(loadedResumes);
        setSelectedResumeId(String(loadedResumes.find((resume) => resume.isPrimary)?.id || loadedResumes[0]?.id || ''));
      } catch (err) {
        setError(err.message || '지원 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadApplyData();
  }, [jobId]);

  const selectedResume = useMemo(
    () => resumes.find((resume) => String(resume.id) === String(selectedResumeId)),
    [resumes, selectedResumeId],
  );

  const matchScore = clampScore(selectedResume?.aiScore || 0);
  const scoreStyle = { '--score': `${matchScore * 3.6}deg` };
  const readyItems = [
    { label: '이력서', value: selectedResume ? '선택됨' : '필수', done: Boolean(selectedResume) },
    { label: '자기소개', value: coverLetter.trim() ? '작성됨' : '필수', done: Boolean(coverLetter.trim()) },
    { label: '포트폴리오', value: attachments.length ? `${attachments.length}개 선택` : '선택', done: true },
  ];

  const handleFileChange = (event) => {
    setAttachments(Array.from(event.target.files || []));
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingDraft(true);
    setError('');

    try {
      const draft = await aiApi.generateCoverLetterDraft({
        jobPostId: job?.id ? Number(job.id) : undefined,
        jobTitle: job?.title,
        companyName: job?.company,
        jobSkills: job?.skills || [],
        resumeId: selectedResume?.id ? Number(selectedResume.id) : undefined,
        resumeTitle: selectedResume?.title,
        skills: selectedResume?.tags || job?.skills || [],
        existingCoverLetter: coverLetter.trim() || undefined,
      });
      setCoverLetter(draft);
    } catch (err) {
      setError(err.message || 'AI 초안을 생성하지 못했습니다.');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedResumeId) {
      setError('지원에 사용할 이력서를 선택해 주세요.');
      return;
    }
    if (!coverLetter.trim()) {
      setError('자기소개를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedAttachments = await Promise.all(attachments.map((file) => fileApi.uploadAttachment(file)));
      const application = await applicationApi.apply({
        jobPostId: Number(jobId),
        resumeId: Number(selectedResumeId),
        coverLetter: coverLetter.trim(),
        desiredSalary: desiredSalary.trim() || null,
        availableDate: availableDate || null,
        attachmentFileIds: uploadedAttachments.map((file) => file.id),
      });
      setSuccess('지원이 완료되었습니다. 지원 현황 페이지로 이동합니다.');
      window.setTimeout(() => navigate(`${ROUTES.MY_APPLICATION_DETAIL}?id=${application.id}`), 700);
    } catch (err) {
      setError(err.message || '지원서를 제출하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="jobs" />

      <section className="job-apply-shell">
        {loading && (
          <article className="detail-section">
            <p className="career-copy">지원 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && !job && (
          <article className="detail-section">
            <h2>지원 페이지를 열 수 없습니다</h2>
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.JOBS)}>
              공고 목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && job && (
          <form className="job-apply-layout" onSubmit={handleSubmit}>
            <section className="job-apply-main">
              <article className="apply-job-card">
                <div className="job-logo" aria-hidden="true">
                  SAP
                </div>
                <div>
                  <h1>{job.title}</h1>
                  <p>
                    {job.company} · {job.location}
                  </p>
                  <div className="tag-row">
                    {(job.skills || []).slice(0, 5).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                    <span>{job.employmentType}</span>
                    <span>{job.workType}</span>
                  </div>
                </div>
                <div className={`apply-match-badge ${scoreTone(matchScore)}`}>
                  <strong>{matchScore || 0}%</strong>
                  <span>매칭</span>
                </div>
              </article>

              <section className="apply-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">RESUME</p>
                    <h2>이력서 선택</h2>
                  </div>
                  <button type="button" className="secondary" onClick={() => navigate(ROUTES.RESUME_CREATE)}>
                    새 이력서 등록
                  </button>
                </div>

                <div className="apply-resume-grid">
                  {resumes.length === 0 && (
                    <article className="apply-empty">
                      <strong>등록된 이력서가 없습니다</strong>
                      <p>먼저 이력서를 등록한 뒤 지원을 진행해 주세요.</p>
                    </article>
                  )}

                  {resumes.map((resume) => (
                    <label className={`apply-resume-card ${String(resume.id) === String(selectedResumeId) ? 'selected' : ''}`} key={resume.id}>
                      <input
                        type="radio"
                        name="resumeId"
                        value={resume.id}
                        checked={String(resume.id) === String(selectedResumeId)}
                        onChange={(event) => setSelectedResumeId(event.target.value)}
                      />
                      <span className="resume-file-icon" aria-hidden="true" />
                      <strong>{resume.title}</strong>
                      <small>{resume.updatedDate || '최근 업데이트 없음'}</small>
                      <em>{resume.isPrimary ? '기본 이력서' : resume.visibilityLabel}</em>
                    </label>
                  ))}
                </div>
              </section>

              <section className="apply-analysis-card">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">AI MATCH</p>
                    <h2>AI 이력서 매칭 분석</h2>
                  </div>
                </div>
                <div className="apply-analysis-content">
                  <div className="apply-score-ring" style={scoreStyle}>
                    <strong>{matchScore || 0}%</strong>
                    <span>종합 매칭률</span>
                  </div>
                  <div className="apply-progress-list">
                    <div>
                      <span>기술 스택 일치</span>
                      <strong>{Math.min(100, matchScore + 4)}%</strong>
                      <progress value={Math.min(100, matchScore + 4)} max="100" />
                    </div>
                    <div>
                      <span>모듈 적합도</span>
                      <strong>{matchScore}%</strong>
                      <progress value={matchScore} max="100" />
                    </div>
                    <div>
                      <span>업무 도메인 적합도</span>
                      <strong>{Math.max(0, matchScore - 8)}%</strong>
                      <progress value={Math.max(0, matchScore - 8)} max="100" />
                    </div>
                  </div>
                </div>
                <div className="apply-insight-grid">
                  <div>
                    <strong>강점</strong>
                    <p>{selectedResume?.tags?.slice(0, 3).join(', ') || '선택한 이력서의 SAP 역량을 분석합니다.'}</p>
                  </div>
                  <div>
                    <strong>보완 제안</strong>
                    <p>자기소개에 프로젝트 성과와 현업 협업 경험을 구체적으로 작성해 주세요.</p>
                  </div>
                </div>
              </section>

              <section className="apply-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">DETAILS</p>
                    <h2>추가 정보</h2>
                  </div>
                </div>
                <div className="apply-fields">
                  <label>
                    <span>희망 연봉</span>
                    <input
                      type="text"
                      value={desiredSalary}
                      placeholder="예: 110,000,000"
                      onChange={(event) => setDesiredSalary(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>입사 가능일</span>
                    <input type="date" value={availableDate} onChange={(event) => setAvailableDate(event.target.value)} />
                  </label>
                  <label className="full">
                    <span>자기소개</span>
                    <textarea
                      value={coverLetter}
                      rows={7}
                      placeholder="이 직무에 적합한 이유를 간략하게 설명해 주세요."
                      onChange={(event) => setCoverLetter(event.target.value)}
                    />
                  </label>
                  <button type="button" className="secondary apply-ai-button" onClick={handleGenerateCoverLetter} disabled={generatingDraft}>
                    {generatingDraft ? 'AI 초안 생성 중...' : 'AI 초안 생성'}
                  </button>
                </div>
              </section>

              <section className="apply-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">FILES</p>
                    <h2>포트폴리오 및 자격증</h2>
                  </div>
                </div>
                <label className="apply-upload-box">
                  <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  <span className="upload-icon" aria-hidden="true" />
                  <strong>파일을 선택하거나 끌어다 놓으세요</strong>
                  <small>SAP 자격증, 프로젝트 포트폴리오 PDF/DOCX</small>
                </label>
                {attachments.length > 0 && (
                  <div className="apply-file-list">
                    {attachments.map((file) => (
                      <div key={`${file.name}-${file.size}`}>
                        <span className="resume-file-icon" aria-hidden="true" />
                        <strong>{file.name}</strong>
                        <small>{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </section>

            <aside className="apply-submit-panel">
              <section>
                <h2>지원 요약</h2>
                <div className="apply-summary-score">
                  <span>매칭 점수</span>
                  <strong>{matchScore || 0}%</strong>
                </div>
              </section>

              <section className="apply-ready-list">
                <strong>필수 항목 작성 현황</strong>
                {readyItems.map((item) => (
                  <div key={item.label}>
                    <span className={item.done ? 'done' : ''} aria-hidden="true" />
                    <p>{item.label}</p>
                    <small>{item.value}</small>
                  </div>
                ))}
              </section>

              {(error || success) && <p className={success ? 'form-success' : 'form-error'}>{success || error}</p>}

              <button type="submit" className="primary-action" disabled={submitting || resumes.length === 0}>
                {submitting ? '제출 중...' : 'AI 최적화 지원하기'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate(`${ROUTES.JOB_DETAIL}?id=${job.id}`)}>
                공고 상세로 돌아가기
              </button>
              <p className="apply-helper-copy">
                SAPPhire AI는 지원자의 역량이 {job.title} 직무에 잘 드러나도록 지원서를 정리합니다.
              </p>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}
