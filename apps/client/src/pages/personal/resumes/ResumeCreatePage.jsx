import { useEffect, useMemo, useRef, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { resumeApi } from '../../../api/resumeApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { formatFileSize } from '../../../utils/fileUtils.js';
import { navigate } from '../../../utils/authUtils.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ['pdf', 'docx'];
const proficiencyOptions = [
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
  { value: 'EXPERT', label: '전문가' },
];

function getExtension(fileName = '') {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function buildTitle(fileName = '') {
  return fileName.replace(/\.[^/.]+$/, '').replaceAll('_', ' ').trim();
}

function uploadStatusLabel(file) {
  if (!file?.createdAt) return '업로드 완료';
  return file.createdAt;
}

export default function ResumeCreatePage() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [isPrimary, setIsPrimary] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [sapSkills, setSapSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) return null;
    return `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`;
  }, [selectedFile]);

  const loadRecentFiles = async () => {
    try {
      const data = await fileApi.list({ category: 'RESUME', limit: 5 });
      setRecentFiles(Array.isArray(data) ? data : []);
    } catch {
      setRecentFiles([]);
    }
  };

  const loadSapSkills = async () => {
    try {
      const data = await sapSkillApi.list();
      setSapSkills(Array.isArray(data) ? data : []);
    } catch {
      setSapSkills([]);
    }
  };

  useEffect(() => {
    loadRecentFiles();
    loadSapSkills();
  }, []);

  const availableSkills = useMemo(
    () => sapSkills.filter((skill) => !selectedSkills.some((selected) => String(selected.sapSkillId) === String(skill.id))),
    [sapSkills, selectedSkills],
  );

  const validateFile = (file) => {
    if (!file) return '업로드할 파일을 선택해 주세요.';
    if (!allowedExtensions.includes(getExtension(file.name))) return 'PDF 또는 DOCX 파일만 업로드할 수 있습니다.';
    if (file.size > MAX_FILE_SIZE) return '이력서 파일은 최대 10MB까지 업로드할 수 있습니다.';
    return '';
  };

  const chooseFile = (file) => {
    const nextError = validateFile(file);
    setError(nextError);
    if (nextError) return;

    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(buildTitle(file.name));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextError = validateFile(selectedFile) || (!title.trim() ? '이력서 제목을 입력해 주세요.' : '');
    if (nextError) {
      setError(nextError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const uploadedFile = await fileApi.uploadResume(selectedFile);
      await resumeApi.create({
        title: title.trim(),
        summary: summary.trim(),
        visibility,
        isPrimary,
        resumeFileId: uploadedFile.id,
        skills: selectedSkills.map((skill) => ({
          sapSkillId: Number(skill.sapSkillId),
          proficiencyLevel: skill.proficiencyLevel,
          yearsOfExperience: Number(skill.yearsOfExperience || 0),
          isPrimary: skill.isPrimary,
        })),
      });
      navigate(ROUTES.RESUMES);
    } catch (err) {
      setError(err.message || '이력서 업로드에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />

      <section className="resume-upload-shell">
        <header className="resume-upload-hero">
          <p className="eyebrow">SAP RESUME UPLOAD</p>
          <h1>이력서 업로드</h1>
          <p>PDF 또는 DOCX 파일을 업로드하고 AI 분석을 시작하세요.</p>
        </header>

        <form className="resume-upload-layout" onSubmit={handleSubmit}>
          <section className="resume-upload-main">
            <button
              type="button"
              className={`resume-dropzone ${dragging ? 'is-dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              <span className="resume-drop-icon" aria-hidden="true" />
              <strong>{selectedFile ? '선택한 이력서 파일' : '이력서를 드래그하거나 업로드하세요'}</strong>
              <small>{selectedFileMeta || '지원 형식: PDF, DOCX (최대 10MB)'}</small>
              <em>파일 선택</em>
            </button>

            <section className="resume-upload-fields">
              <label>
                <span>이력서 제목</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: SAP S/4HANA 컨설턴트 이력서" />
              </label>
              <label>
                <span>요약 메모</span>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="이력서 버전, 지원 직무, 강조하고 싶은 경험을 적어두세요."
                  rows={4}
                />
              </label>
              <div className="resume-upload-options">
                <label>
                  <span>공개 범위</span>
                  <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                    <option value="PRIVATE">비공개</option>
                    <option value="COMPANY_ONLY">기업 공개</option>
                    <option value="PUBLIC">전체 공개</option>
                  </select>
                </label>
                <label className="resume-checkbox">
                  <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />
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

                {selectedSkills.length === 0 && <p className="empty-copy">FI, CO, S/4HANA처럼 이 이력서에서 강조할 SAP 역량을 추가하세요.</p>}

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

            <section className="resume-recent-card">
              <div className="resume-recent-head">
                <h2>최근 업로드 내역</h2>
                <span>총 {recentFiles.length}건</span>
              </div>
              <div className="resume-recent-list">
                {recentFiles.length === 0 && <p className="empty-copy">최근 업로드한 이력서 파일이 없습니다.</p>}
                {recentFiles.map((file) => (
                  <article className="resume-recent-item" key={file.id}>
                    <div className={`resume-file-mark ${getExtension(file.originalName) === 'pdf' ? 'pdf' : 'docx'}`}>
                      {getExtension(file.originalName).toUpperCase()}
                    </div>
                    <div>
                      <strong>{file.originalName}</strong>
                      <span>
                        {uploadStatusLabel(file)} · {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                    <small>분석 완료</small>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="resume-upload-ai">
            <div>
              <h2>AI 분석 안내</h2>
              <p>업로드된 이력서는 SAPPhire AI 엔진을 통해 즉시 분석합니다. 분석이 완료되면 다음 정보를 제공합니다.</p>
            </div>
            <ul>
              <li>
                <strong>기술 스택 추출</strong>
                <span>핵심 기술 스택 자동 추출</span>
              </li>
              <li>
                <strong>프로젝트 추출</strong>
                <span>참여 프로젝트 이력 정리</span>
              </li>
              <li>
                <strong>SAP 모듈 분석</strong>
                <span>SAP 모듈별 전문성 평가</span>
              </li>
              <li>
                <strong>AI 매칭 생성</strong>
                <span>맞춤형 포지션 제안</span>
              </li>
            </ul>
            <div className="resume-upload-time">
              <span>예상 소요 시간</span>
              <strong>약 30초</strong>
            </div>
            <button type="submit" className="resume-analyze-button" disabled={submitting}>
              {submitting ? '업로드 중...' : '이력서 분석 시작'}
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}
