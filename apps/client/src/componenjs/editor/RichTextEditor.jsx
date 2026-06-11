import { useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function Icon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    bold: <path d="M7 5h6a4 4 0 0 1 0 8H7z M7 13h7a4 4 0 0 1 0 8H7z" />,
    italic: <path d="M16 5h-6 M14 5l-4 14 M8 19h6" />,
    strike: <path d="M5 12h14 M8 19c1.4 1 4.7 1.2 6.4.2 2-1.2 1.8-4.2-.5-5.1L10 12.6C7.4 11.6 7 8.4 9.2 6.7 11 5.3 14 5.4 16 6.8" />,
    h2: <path d="M4 5v14 M12 5v14 M4 12h8 M16 12c0-1.7 1.3-3 3-3s3 1.1 3 2.6c0 1.2-.8 2-1.8 2.8L16 19h6" />,
    h3: <path d="M4 5v14 M12 5v14 M4 12h8 M16 8h5l-3 4a3 3 0 1 1-2 5" />,
    paragraph: <path d="M7 5h8a4 4 0 0 1 0 8h-3v6 M10 5v14" />,
    bulletList: <path d="M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01" />,
    orderedList: <path d="M10 6h10 M10 12h10 M10 18h10 M4 6h1v4 M4 10h2 M4 14a2 2 0 0 1 2 2c0 1.2-2 2-2 3h2" />,
    quote: <path d="M9 7H5v5h4v5H4 M20 7h-4v5h4v5h-5" />,
    line: <path d="M5 12h14" />,
    undo: <path d="M9 14 4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-1" />,
    redo: <path d="m15 14 5-5-5-5 M20 9H10a6 6 0 0 0 0 12h1" />,
    clear: <path d="M4 7h16 M10 11v6 M14 11v6 M6 7l1 14h10l1-14 M9 7V4h6v3" />,
    attach: <path d="M21 12.5 12.5 21a6 6 0 0 1-8.5-8.5L13 3.5a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8.2-8.2" />,
    remove: <path d="M18 6 6 18 M6 6l12 12" />,
  };

  return <svg {...common}>{paths[type]}</svg>;
}

const toolbarGroups = [
  [
    { key: 'bold', label: '굵게', icon: 'bold', action: (editor) => editor.chain().focus().toggleBold().run(), active: (editor) => editor.isActive('bold') },
    { key: 'italic', label: '기울임', icon: 'italic', action: (editor) => editor.chain().focus().toggleItalic().run(), active: (editor) => editor.isActive('italic') },
    { key: 'strike', label: '취소선', icon: 'strike', action: (editor) => editor.chain().focus().toggleStrike().run(), active: (editor) => editor.isActive('strike') },
  ],
  [
    { key: 'heading2', label: '제목 2', icon: 'h2', action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: (editor) => editor.isActive('heading', { level: 2 }) },
    { key: 'heading3', label: '제목 3', icon: 'h3', action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: (editor) => editor.isActive('heading', { level: 3 }) },
    { key: 'paragraph', label: '본문', icon: 'paragraph', action: (editor) => editor.chain().focus().setParagraph().run(), active: (editor) => editor.isActive('paragraph') },
  ],
  [
    { key: 'bulletList', label: '글머리 목록', icon: 'bulletList', action: (editor) => editor.chain().focus().toggleBulletList().run(), active: (editor) => editor.isActive('bulletList') },
    { key: 'orderedList', label: '번호 목록', icon: 'orderedList', action: (editor) => editor.chain().focus().toggleOrderedList().run(), active: (editor) => editor.isActive('orderedList') },
    { key: 'blockquote', label: '인용', icon: 'quote', action: (editor) => editor.chain().focus().toggleBlockquote().run(), active: (editor) => editor.isActive('blockquote') },
  ],
  [
    { key: 'horizontalRule', label: '구분선', icon: 'line', action: (editor) => editor.chain().focus().setHorizontalRule().run(), active: () => false },
    { key: 'undo', label: '실행 취소', icon: 'undo', action: (editor) => editor.chain().focus().undo().run(), active: () => false },
    { key: 'redo', label: '다시 실행', icon: 'redo', action: (editor) => editor.chain().focus().redo().run(), active: () => false },
    { key: 'clear', label: '서식 지우기', icon: 'clear', action: (editor) => editor.chain().focus().clearNodes().unsetAllMarks().run(), active: () => false },
  ],
];

export default function RichTextEditor({
  value = '',
  onChange,
  onUploadFile,
  placeholder = '내용을 입력하세요.',
  attachments: controlledAttachments,
  onAttachmentsChange,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [localAttachments, setLocalAttachments] = useState([]);
  const attachments = controlledAttachments ?? localAttachments;

  const setAttachments = (updater) => {
    const next = typeof updater === 'function' ? updater(attachments) : updater;
    if (onAttachmentsChange) {
      onAttachmentsChange(next);
    } else {
      setLocalAttachments(next);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange?.(currentEditor.getHTML());
    },
  });

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUploadFile) return;

    setUploading(true);
    setUploadError('');
    try {
      const uploaded = await onUploadFile(file);
      setAttachments((current) => [...current, uploaded || { originalName: file.name }]);
    } catch (error) {
      setUploadError(error.message || '파일 첨부에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" aria-label="Editor toolbar">
        {toolbarGroups.map((group, groupIndex) => (
          <div className="rich-editor-toolbar-group" key={groupIndex}>
            {group.map((item) => (
              <button
                type="button"
                key={item.key}
                className={editor && item.active(editor) ? 'active' : ''}
                onClick={() => editor && item.action(editor)}
                disabled={!editor}
                title={item.label}
                aria-label={item.label}
              >
                <Icon type={item.icon} />
              </button>
            ))}
          </div>
        ))}
      </div>

      <EditorContent editor={editor} />

      {onUploadFile && (
        <div className="rich-editor-attachments">
          <button type="button" className="rich-editor-attach-button" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="파일 첨부">
            <Icon type="attach" />
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={uploadFile} hidden />

          <div className="rich-editor-attachment-list" aria-label="첨부파일 목록">
            {attachments.length === 0 && <span>{uploading ? '첨부 중...' : '첨부파일 없음'}</span>}
            {attachments.map((file, index) => (
              <span className="rich-editor-attachment-item" key={`${file.id || file.originalName}-${index}`}>
                {file.originalName || file.name}
                <button type="button" onClick={() => removeAttachment(index)} aria-label="첨부파일 제거">
                  <Icon type="remove" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {uploadError && <p className="rich-editor-error">{uploadError}</p>}
    </div>
  );
}
