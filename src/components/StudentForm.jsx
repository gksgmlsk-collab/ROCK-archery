import { useEffect, useRef, useState } from 'react';
import { todayString } from '../utils.js';

const emptyForm = {
  name: '',
  gradeClass: '',
  photo: '',
  awards: '',
  memo: '',
};

export default function StudentForm({ editingStudent, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingStudent) {
      setForm({
        name: editingStudent.name ?? '',
        gradeClass: editingStudent.gradeClass ?? '',
        photo: editingStudent.photo ?? '',
        awards: editingStudent.awards ?? '',
        memo: editingStudent.memo ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingStudent]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 등록할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => update('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    update('photo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.gradeClass.trim()) {
      alert('학생 이름과 학년/반을 입력해 주세요.');
      return;
    }

    onSave({
      ...editingStudent,
      ...form,
      name: form.name.trim(),
      gradeClass: form.gradeClass.trim(),
      awards: form.awards.trim(),
      memo: form.memo.trim(),
      createdAt: editingStudent?.createdAt ?? todayString(),
    });

    if (!editingStudent) {
      setForm(emptyForm);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <form className="panel student-form" onSubmit={submit}>
      <div className="panel-title">
        <div>
          <p className="eyebrow">학생 관리</p>
          <h2>{editingStudent ? '학생 프로필 수정' : '새 선수 등록'}</h2>
        </div>
      </div>

      <div className="profile-editor">
        <div className="photo-preview">
          {form.photo ? <img src={form.photo} alt={`${form.name || '학생'} 사진`} /> : <span>PHOTO</span>}
        </div>
        <div className="photo-actions">
          <label>
            학생 사진
            <input ref={fileInputRef} type="file" accept="image/*" onChange={changePhoto} />
          </label>
          {form.photo && (
            <button className="secondary" type="button" onClick={removePhoto}>
              사진 삭제
            </button>
          )}
        </div>
      </div>

      <div className="form-grid">
        <label>
          학생 이름
          <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="예: 김하늘" />
        </label>

        <label>
          학년/반
          <input
            value={form.gradeClass}
            onChange={(event) => update('gradeClass', event.target.value)}
            placeholder="예: 6-1"
          />
        </label>

        <label className="span-2">
          수상 경력
          <textarea
            value={form.awards}
            onChange={(event) => update('awards', event.target.value)}
            placeholder="예: 2026 교육장배 개인전 2위"
          />
        </label>

        <label className="span-2">
          지도 메모
          <textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="자세, 집중력, 장비 특이사항" />
        </label>
      </div>

      <div className="button-row">
        <button className="primary" type="submit">
          {editingStudent ? '수정 저장' : '학생 추가'}
        </button>
        {editingStudent && (
          <button className="secondary" type="button" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  );
}
