import {
  DISTANCES,
  getRankingByBestAverage,
  getRankingByDistance,
  getRankingByGrowth,
  getRankingByRecentAverage,
} from '../utils.js';

export default function AdminDashboard({ students, records }) {
  const recentRanking = getRankingByRecentAverage(students, records);
  const bestRanking = getRankingByBestAverage(students, records);
  const growthRanking = getRankingByGrowth(students, records);

  return (
    <section className="stack">
      <div className="admin-alert">이 화면은 지도자 확인용입니다. 학생 공개용이 아닙니다.</div>

      <div className="panel admin-panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">관리자 비교</p>
            <h2>전체 학생 비교표</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>학생</th>
                <th>학년/반</th>
                <th>기록 수</th>
                <th>수상 경력</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.gradeClass}</td>
                  <td>{records.filter((record) => record.studentId === student.id).length}</td>
                  <td>{student.awards || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ranking-grid">
        <RankingCard title="최근 3회 평균 순위" ranking={recentRanking} suffix="점" statusKey="status" />
        <RankingCard title="개인 최고 평균 점수 순위" ranking={bestRanking} suffix="점" />
        <RankingCard title="성장률 순위" ranking={growthRanking} suffix="점" statusKey="status" />
      </div>

      <div className="panel admin-panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">거리별 순위</p>
            <h2>같은 거리 기록끼리 비교</h2>
          </div>
        </div>
        <div className="ranking-grid distance-rankings">
          {DISTANCES.map((distance) => (
            <RankingCard
              key={distance}
              title={`${distance}m 평균 순위`}
              ranking={getRankingByDistance(students, records, distance)}
              suffix="점"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RankingCard({ title, ranking, suffix, statusKey }) {
  return (
    <article className="panel rank-card">
      <h3>{title}</h3>
      {ranking.length === 0 ? (
        <p className="empty">표시할 기록이 없습니다.</p>
      ) : (
        <ol>
          {ranking.map((item, index) => (
            <li key={item.student.id}>
              <span>{index + 1}위 {item.student.name}</span>
              <strong>
                {item.score === null ? '-' : item.score}
                {item.score === null ? '' : suffix}
              </strong>
              {statusKey && item[statusKey] && <small>{item[statusKey]}</small>}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
