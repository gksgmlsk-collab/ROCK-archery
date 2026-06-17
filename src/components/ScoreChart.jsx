import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function ScoreChart({ records, mode }) {
  if (!records.length) {
    return <p className="empty">아직 기록이 없습니다.</p>;
  }

  const data = [...records]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((record) => ({
      date: record.date,
      averageScore: record.averageScore,
      totalScore: record.totalScore,
    }));

  const key = mode === 'total' ? 'totalScore' : 'averageScore';
  const label = mode === 'total' ? '총점' : '평균 점수';

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={key} name={label} stroke="#0f4c81" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
