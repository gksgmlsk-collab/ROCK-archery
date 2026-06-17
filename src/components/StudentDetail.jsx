import { useMemo, useState } from 'react';
import ScoreChart from './ScoreChart.jsx';
import {
  DISTANCES,
  getBestAverage,
  getBestTotal,
  getRecentAverage,
  getStudentRecords,
  round1,
} from '../utils.js';

export default function StudentDetail({ student, records, isAdmin, onBack, onDeleteRecord }) {
  const [distanceFilter, setDistanceFilter] = useState('all');
  const studentRecords = useMemo(() => getStudentRecords(records, student.id), [records, student.id]);
  const filteredRecords = useMemo(
    () =>
      distanceFilter === 'all'
        ? studentRecords
        : studentRecords.filter((record) => Number(record.distance) === Number(distanceFilter)),
    [studentRecords, distanceFilter],
  );

  const overallAverage = studentRecords.length
    ? round1(studentRecords.reduce((sum, record) => sum + record.averageScore, 0) / studentRecords.length)
    : 0;
  const recentDate = studentRecords[0]?.date ?? '기록 없음';

  return (
    <section className="stack">
      <button className="secondary fit" type="button" onClick={onBack}>
        학생 목록으로
      </button>

      <div className="panel detail-hero">
        <div className="detail-profile">
          <div className="detail-photo">
            {student.photo ? <img src={student.photo} alt={`${student.name} 사진`} /> : <span>{student.name.slice(0, 1)}</span>}
          </div>
          <div>
            <p className="eyebrow">선수 기록 상세</p>
            <h2>{student.name}</h2>
            <p>{student.gradeClass}</p>
            {student.awards && (
              <div className="award-box">
                <strong>수상 경력</strong>
                <p>{student.awards}</p>
              </div>
            )}
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="최근 훈련일" value={recentDate} />
          <Metric label="전체 평균" value={`${overallAverage}점`} />
          <Metric label="최고 평균" value={`${getBestAverage(studentRecords)}점`} />
          <Metric label="최고 총점" value={`${getBestTotal(studentRecords)}점`} />
          <Metric label="최근 3회 평균" value={`${getRecentAverage(studentRecords)}점`} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">거리별 필터</p>
            <h2>성장 그래프</h2>
          </div>
        </div>
        <div className="segmented wrap">
          <button className={distanceFilter === 'all' ? 'active' : ''} type="button" onClick={() => setDistanceFilter('all')}>
            전체
          </button>
          {DISTANCES.map((distance) => (
            <button
              className={Number(distanceFilter) === distance ? 'active' : ''}
              key={distance}
              type="button"
              onClick={() => setDistanceFilter(distance)}
            >
              {distance}m
            </button>
          ))}
        </div>

        <div className="chart-grid">
          <div>
            <h3>날짜별 평균 점수</h3>
            <ScoreChart records={filteredRecords} mode="average" />
          </div>
          <div>
            <h3>날짜별 총점</h3>
            <ScoreChart records={filteredRecords} mode="total" />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">훈련 기록 목록</p>
            <h2>최근 기록순</h2>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <p className="empty">아직 기록이 없습니다.</p>
        ) : (
          <div className="record-list">
            {filteredRecords.map((record) => (
              <article className="record-card" key={record.id}>
                <div>
                  <strong>{record.date} · {record.distance}m</strong>
                  <p>{record.setCount}세트 · 총점 {record.totalScore}점 · 평균 {record.averageScore}점</p>
                  <small>{record.setScores.join(' / ')}</small>
                  {record.memo && <p className="memo">{record.memo}</p>}
                </div>
                {isAdmin && (
                  <button className="danger" type="button" onClick={() => onDeleteRecord(record.id)}>
                    기록 삭제
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
