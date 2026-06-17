import { createId } from './utils.js';

export function createSampleData() {
  const students = [
    {
      id: 'student_sample_ha_neul',
      name: '김하늘',
      gradeClass: '6-1',
      photo: '',
      awards: '2026 교육장배 개인전 2위',
      memo: '자세 안정 필요',
      createdAt: '2026-06-17',
    },
    {
      id: 'student_sample_ba_da',
      name: '이바다',
      gradeClass: '5-2',
      photo: '',
      awards: '2026 교내 평가전 1위',
      memo: '릴리즈 타이밍이 좋음',
      createdAt: '2026-06-17',
    },
    {
      id: 'student_sample_ro_un',
      name: '박로운',
      gradeClass: '6-3',
      photo: '',
      awards: '2025 지역 스포츠클럽 대회 단체전 3위',
      memo: '후반 집중 훈련 중',
      createdAt: '2026-06-17',
    },
  ];

  const scoreSets = {
    student_sample_ha_neul: [
      ['2026-06-10', 25, [51, 53, 54, 52, 55]],
      ['2026-06-12', 25, [53, 55, 56, 54, 57]],
      ['2026-06-14', 25, [54, 56, 56, 57, 58]],
      ['2026-06-16', 30, [49, 51, 52, 53, 52]],
    ],
    student_sample_ba_da: [
      ['2026-06-10', 20, [55, 56, 57, 56]],
      ['2026-06-13', 20, [56, 57, 57, 58]],
      ['2026-06-16', 25, [52, 54, 55, 54]],
    ],
    student_sample_ro_un: [
      ['2026-06-09', 30, [47, 49, 50, 48, 51]],
      ['2026-06-11', 30, [49, 50, 52, 51, 52]],
      ['2026-06-13', 30, [50, 52, 53, 53, 54]],
      ['2026-06-15', 35, [45, 47, 48, 49, 48]],
      ['2026-06-16', 30, [52, 53, 55, 54, 55]],
      ['2026-06-17', 30, [53, 55, 56, 55, 57]],
    ],
  };

  const records = Object.entries(scoreSets).flatMap(([studentId, rows]) =>
    rows.map(([date, distance, setScores]) => {
      const totalScore = setScores.reduce((sum, score) => sum + score, 0);
      return {
        id: createId('record'),
        studentId,
        date,
        distance,
        setCount: setScores.length,
        setScores,
        totalScore,
        averageScore: Math.round((totalScore / setScores.length) * 10) / 10,
        memo: '샘플 훈련 기록',
        type: '훈련',
      };
    }),
  );

  return { students, records };
}
