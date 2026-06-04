import { useEffect, useMemo, useRef, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { resumeApi } from '../../../api/resumeApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { formatFileSize } from '../../../utils/fileUtils.js';
import { navigate } from '../../../utils/authUtils.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ['pdf', 'docx'];

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

  useEffect(() => {
    loadRecentFiles();
  }, []);

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
      });
      navigate(ROUTES.RESUMES);
    } catch (err) {
      setError(err.message || '이력서 업로드에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

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
