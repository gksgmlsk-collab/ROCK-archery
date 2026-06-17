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

const COLORS = ['#0e3b68', '#c83131', '#d8a316', '#2f7d5f', '#7a4cc2', '#e36f2c', '#1b7895', '#9b2f5f'];

export default function ComparisonChart({ students, records, selectedStudentIds, distance }) {
  const activeStudents = selectedStudentIds.length
    ? students.filter((student) => selectedStudentIds.includes(student.id))
    : students;

  const filteredRecords = records.filter(
    (record) =>
      activeStudents.some((student) => student.id === record.studentId) &&
      (distance === 'all' || Number(record.distance) === Number(distance)),
  );

  if (!students.length) {
    return <p className="empty">학생을 먼저 등록해 주세요.</p>;
  }

  if (!filteredRecords.length) {
    return <p className="empty">선택한 조건에 해당하는 기록이 없습니다.</p>;
  }

  const dates = [...new Set(filteredRecords.map((record) => record.date))].sort(
    (a, b) => new Date(a) - new Date(b),
  );

  const data = dates.map((date) => {
    const row = { date };
    activeStudents.forEach((student) => {
      const sameDayRecords = filteredRecords.filter(
        (record) => record.studentId === student.id && record.date === date,
      );
      if (sameDayRecords.length) {
        row[student.id] = round1(
          sameDayRecords.reduce((sum, record) => sum + Number(record.averageScore || 0), 0) /
            sameDayRecords.length,
        );
      }
    });
    return row;
  });

  return (
    <div className="chart-box comparison-chart">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {activeStudents.map((student, index) => (
            <Line
              connectNulls
              dataKey={student.id}
              dot={{ r: 4 }}
              key={student.id}
              name={student.name}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}
