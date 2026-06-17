export const ADMIN_PIN = '1004';
export const DISTANCES = [20, 25, 30, 35];

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function calculateTotal(setScores) {
  return setScores.reduce((sum, score) => sum + Number(score || 0), 0);
}

export function calculateAverage(setScores) {
  if (!setScores.length) return 0;
  return round1(calculateTotal(setScores) / setScores.length);
}

export function getRecentAverage(records, count = 3) {
  const recent = sortRecordsByDate(records).slice(0, count);
  if (!recent.length) return 0;
  return round1(recent.reduce((sum, record) => sum + Number(record.averageScore || 0), 0) / recent.length);
}

export function getBestAverage(records) {
  if (!records.length) return 0;
  return round1(Math.max(...records.map((record) => Number(record.averageScore || 0))));
}

export function getBestTotal(records) {
  if (!records.length) return 0;
  return Math.max(...records.map((record) => Number(record.totalScore || 0)));
}

export function getDistanceAverage(records, distance) {
  const filtered = records.filter((record) => Number(record.distance) === Number(distance));
  if (!filtered.length) return 0;
  return round1(filtered.reduce((sum, record) => sum + Number(record.averageScore || 0), 0) / filtered.length);
}

export function getGrowthScore(records) {
  const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length < 6) return null;
  const firstThree = sorted.slice(0, 3);
  const recentThree = sorted.slice(-3);
  return round1(averageRecordScore(recentThree) - averageRecordScore(firstThree));
}

export function getRankingByRecentAverage(students, records) {
  return students
    .map((student) => {
      const studentRecords = getStudentRecords(records, student.id);
      return {
        student,
        score: getRecentAverage(studentRecords, 3),
        recordCount: studentRecords.length,
        status: studentRecords.length < 3 ? '기록 부족' : '',
      };
    })
    .filter((item) => item.recordCount > 0)
    .sort((a, b) => b.score - a.score);
}

export function getRankingByDistance(students, records, distance) {
  return students
    .map((student) => {
      const studentRecords = getStudentRecords(records, student.id).filter(
        (record) => Number(record.distance) === Number(distance),
      );
      return {
        student,
        score: getDistanceAverage(studentRecords, distance),
        recordCount: studentRecords.length,
      };
    })
    .filter((item) => item.recordCount > 0)
    .sort((a, b) => b.score - a.score);
}

export function getRankingByBestAverage(students, records) {
  return students
    .map((student) => {
      const studentRecords = getStudentRecords(records, student.id);
      return {
        student,
        score: getBestAverage(studentRecords),
        recordCount: studentRecords.length,
      };
    })
    .filter((item) => item.recordCount > 0)
    .sort((a, b) => b.score - a.score);
}

export function getRankingByGrowth(students, records) {
  return students
    .map((student) => {
      const studentRecords = getStudentRecords(records, student.id);
      const score = getGrowthScore(studentRecords);
      return {
        student,
        score,
        recordCount: studentRecords.length,
        status: score === null ? '분석 부족' : '',
      };
    })
    .filter((item) => item.recordCount > 0)
    .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
}

export function sortRecordsByDate(records) {
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return String(b.id).localeCompare(String(a.id));
  });
}

export function getStudentRecords(records, studentId) {
  return sortRecordsByDate(records.filter((record) => record.studentId === studentId));
}

export function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function averageRecordScore(records) {
  if (!records.length) return 0;
  return records.reduce((sum, record) => sum + Number(record.averageScore || 0), 0) / records.length;
}

export function safeReadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
