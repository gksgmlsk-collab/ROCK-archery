import { useMemo, useState } from 'react';
import { calculateAverage, calculateTotal, createId, DISTANCES, todayString } from '../utils.js';

export default function RecordForm({ students, onSave }) {
  const [date, setDate] = useState(todayString());
  const [studentId, setStudentId] = useState('');
  const [distance, setDistance] = useState(25);
  const [setCount, setSetCount] = useState(5);
  const [setScores, setSetScores] = useState(Array(5).fill(''));
  const [memo, setMemo] = useState('');
  const selectedStudent = students.find((student) => student.id === studentId);

  const numericScores = useMemo(() => setScores.map((score) => Number(score)), [setScores]);
  const total = setScores.every((score) => score !== '') ? calculateTotal(numericScores) : 0;
  const average = setScores.every((score) => score !== '') ? calculateAverage(numericScores) : 0;

  const changeSetCount = (value) => {
    const nextCount = Math.max(0, Number(value));
    setSetCount(nextCount);
    setSetScores((current) =>
      Array.from({ length: nextCount }, (_, index) => (current[index] === undefined ? '' : current[index])),
    );
  };

  const changeScore = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setSetScores((current) => current.map((score, scoreIndex) => (scoreIndex === index ? value : score)));
  };

  const resetScores = () => {
    setSetScores(Array(Number(setCount)).fill(''));
  };

  const submit = (event) => {
    event.preventDefault();
    if (students.length === 0) {
      alert('학생을 먼저 추가해 주세요.');
      return;
    }
    if (!studentId) {
      alert('학생을 선택해 주세요.');
      return;
    }
    if (Number(setCount) <= 0) {
      alert('세트 수는 1 이상이어야 합니다.');
      return;
    }
    if (setScores.some((score) => score === '')) {
      alert('빈 점수가 있습니다. 모든 세트 점수를 입력해 주세요.');
      return;
    }

    onSave({
      id: createId('record'),
      studentId,
      date,
      distance: Number(distance),
      setCount: Number(setCount),
      setScores: numericScores,
      totalScore: calculateTotal(numericScores),
      averageScore: calculateAverage(numericScores),
      memo: memo.trim(),
      type: '훈련',
    });

    setMemo('');
    resetScores();
  };

  return (
    <form className="panel record-form" onSubmit={submit}>
      <div className="panel-title">
        <div>
          <p className="eyebrow">훈련 기록 입력</p>
          <h2>{selectedStudent ? `${selectedStudent.name} 기록` : '새 기록 작성'}</h2>
        </div>
      </div>

      {students.length === 0 && <p className="notice">학생이 없을 때는 기록을 입력할 수 없습니다.</p>}

      <div className="form-grid">
        <label>
          날짜
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label>
          학생 선택
          <select value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={!students.length}>
            <option value="">학생 선택</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.gradeClass})
              </option>
            ))}
          </select>
        </label>

        <label>
          세트 수
          <input min="1" type="number" value={setCount} onChange={(event) => changeSetCount(event.target.value)} />
        </label>

        <div className="span-2">
          <span className="label-text">거리 선택</span>
          <div className="segmented">
            {DISTANCES.map((item) => (
              <button
                className={Number(distance) === item ? 'active' : ''}
                key={item}
                type="button"
                onClick={() => setDistance(item)}
              >
                {item}m
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="score-table">
        <div className="score-head">
          <span>세트</span>
          <span>점수</span>
        </div>
        {setScores.map((score, index) => (
          <div className="score-row" key={index}>
            <strong>{index + 1}세트</strong>
            <input
              inputMode="numeric"
              value={score}
              onChange={(event) => changeScore(index, event.target.value)}
              placeholder="점수"
            />
          </div>
        ))}
      </div>

      <div className="summary-strip">
        <span>총점 <strong>{total}</strong>점</span>
        <span>평균 <strong>{average}</strong>점</span>
      </div>

      <label>
        지도 메모
        <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="오늘 훈련 메모" />
      </label>

      <div className="button-row">
        <button className="primary" type="submit" disabled={!students.length}>
          저장
        </button>
        <button className="danger ghost" type="button" onClick={resetScores}>
          입력 초기화
        </button>
      </div>
    </form>
  );
}
