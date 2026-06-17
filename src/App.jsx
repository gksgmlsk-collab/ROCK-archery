import { useEffect, useMemo, useState } from 'react';
import { loadRemoteData, saveRemoteData } from './api.js';
import AdminDashboard from './components/AdminDashboard.jsx';
import ComparisonChart from './components/ComparisonChart.jsx';
import RecordForm from './components/RecordForm.jsx';
import StudentDetail from './components/StudentDetail.jsx';
import StudentForm from './components/StudentForm.jsx';
import StudentList from './components/StudentList.jsx';
import { createSampleData } from './sampleData.js';
import {
  ADMIN_PIN,
  calculateAverage,
  calculateTotal,
  createId,
  DISTANCES,
  downloadCsv,
  safeReadStorage,
  sortRecordsByDate,
} from './utils.js';

const STORAGE_KEYS = {
  students: 'rock_archery_students',
  records: 'rock_archery_records',
};

const TABS = [
  { id: 'home', label: '홈' },
  { id: 'students', label: '학생 관리' },
  { id: 'record', label: '기록 입력' },
  { id: 'settings', label: '설정/초기화' },
];

export default function App() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSessionPin, setAdminSessionPin] = useState('');
  const [search, setSearch] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadRemoteData()
      .then((data) => {
        setStudents(data.students ?? []);
        setRecords(data.records ?? []);
      })
      .catch(() => {
        setStudents(safeReadStorage(STORAGE_KEYS.students, []));
        setRecords(safeReadStorage(STORAGE_KEYS.records, []));
        setSaveStatus('서버 연결 실패: 이 브라우저의 임시 데이터로 표시 중입니다.');
      })
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded || !adminSessionPin) return;

    setSaveStatus('저장 중...');
    const timeoutId = window.setTimeout(() => {
      saveRemoteData({ students, records }, adminSessionPin)
        .then(() => setSaveStatus('서버에 저장됨'))
        .catch((error) => setSaveStatus(error.message));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [students, records, isLoaded, adminSessionPin]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return sortRecordsByDate(records).filter((record) => {
      const student = students.find((item) => item.id === record.studentId);
      const matchName = !keyword || student?.name.toLowerCase().includes(keyword);
      const matchDistance = distanceFilter === 'all' || Number(record.distance) === Number(distanceFilter);
      return matchName && matchDistance;
    });
  }, [records, students, search, distanceFilter]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  const saveStudent = (student) => {
    if (!isAdmin) {
      alert('학생 등록과 수정은 관리자 모드에서만 가능합니다.');
      return;
    }
    if (student.id) {
      setStudents((current) => current.map((item) => (item.id === student.id ? student : item)));
      setEditingStudent(null);
    } else {
      setStudents((current) => [{ ...student, id: createId('student') }, ...current]);
    }
  };

  const deleteStudent = (studentId) => {
    if (!isAdmin) {
      alert('학생 삭제는 관리자 모드에서만 가능합니다.');
      return;
    }
    const student = students.find((item) => item.id === studentId);
    if (!window.confirm(`${student?.name ?? '학생'} 학생을 삭제하시겠습니까? 관련 기록도 함께 삭제됩니다.`)) return;
    setStudents((current) => current.filter((item) => item.id !== studentId));
    setRecords((current) => current.filter((record) => record.studentId !== studentId));
    if (selectedStudentId === studentId) setSelectedStudentId('');
  };

  const moveStudent = (studentId, direction) => {
    if (!isAdmin) return;
    setStudents((current) => {
      const index = current.findIndex((student) => student.id === studentId);
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const saveRecord = (record) => {
    setRecords((current) => [record, ...current]);
    alert('훈련 기록이 저장되었습니다.');
  };

  const deleteRecord = (recordId) => {
    if (!window.confirm('이 훈련 기록을 삭제하시겠습니까?')) return;
    setRecords((current) => current.filter((record) => record.id !== recordId));
  };

  const updateRecord = (updatedRecord) => {
    setRecords((current) => current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)));
    alert('훈련 기록이 수정되었습니다.');
  };

  const enterAdminMode = () => {
    const pin = window.prompt('관리자 PIN을 입력하세요.');
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      setAdminSessionPin(pin);
      setActiveTab('admin');
    } else if (pin !== null) {
      alert('PIN 번호가 올바르지 않습니다.');
    }
  };

  const leaveAdminMode = () => {
    setIsAdmin(false);
    setAdminSessionPin('');
    setActiveTab('home');
  };

  const resetAllData = () => {
    if (!isAdmin) return;
    if (!window.confirm('전체 데이터를 삭제하시겠습니까?')) return;
    if (!window.confirm('정말 삭제합니다')) return;
    setStudents([]);
    setRecords([]);
    setSelectedStudentId('');
    setEditingStudent(null);
  };

  const addSamples = () => {
    const sample = createSampleData();
    setStudents((current) => [...sample.students, ...current.filter((item) => !item.id.startsWith('student_sample_'))]);
    setRecords((current) => [...sample.records, ...current.filter((item) => !item.studentId.startsWith('student_sample_'))]);
  };

  const exportStudents = () => {
    downloadCsv('rock_students.csv', [
      ['id', 'name', 'gradeClass', 'awards', 'memo', 'createdAt'],
      ...students.map((student) => [
        student.id,
        student.name,
        student.gradeClass,
        student.awards,
        student.memo,
        student.createdAt,
      ]),
    ]);
  };

  const exportRecords = () => {
    downloadCsv('rock_records.csv', [
      ['id', 'studentName', 'studentId', 'date', 'distance', 'setCount', 'setScores', 'totalScore', 'averageScore', 'memo', 'type'],
      ...sortRecordsByDate(records).map((record) => [
        record.id,
        students.find((student) => student.id === record.studentId)?.name ?? '',
        record.studentId,
        record.date,
        record.distance,
        record.setCount,
        record.setScores.join('/'),
        record.totalScore,
        record.averageScore,
        record.memo,
        record.type,
      ]),
    ]);
  };

  const openDetail = (studentId) => {
    setSelectedStudentId(studentId);
    setActiveTab('detail');
  };

  const startEditStudent = (student) => {
    if (!isAdmin) return;
    setEditingStudent(student);
    setActiveTab('students');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">학교 양궁부 훈련 기록 시스템</p>
          <h1>ROCk 양궁기록장</h1>
        </div>
        <div className="top-actions">
          {isAdmin ? (
            <>
              <button className="admin-on" type="button" onClick={() => setActiveTab('admin')}>
                관리자 모드
              </button>
              <button className="secondary light" type="button" onClick={leaveAdminMode}>
                학생 모드로
              </button>
            </>
          ) : (
            <button className="secondary" type="button" onClick={enterAdminMode}>
              관리자 모드
            </button>
          )}
        </div>
      </header>

      <nav className="tabbar">
        {TABS.filter((tab) => isAdmin || ['home', 'students'].includes(tab.id)).map((tab) => (
          <button
            className={activeTab === tab.id ? 'active' : ''}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {isAdmin && (
          <button className={activeTab === 'admin' ? 'active admin-tab' : 'admin-tab'} type="button" onClick={() => setActiveTab('admin')}>
            순위/비교
          </button>
        )}
      </nav>

      {saveStatus && <div className="sync-status">{saveStatus}</div>}

      <main>
        {!isLoaded && <p className="empty">서버에서 기록을 불러오는 중입니다.</p>}

        {activeTab === 'home' && (
          <Home
            students={students}
            records={records}
            filteredRecords={filteredRecords}
            search={search}
            distanceFilter={distanceFilter}
            setSearch={setSearch}
            setDistanceFilter={setDistanceFilter}
            onOpenStudent={openDetail}
            isAdmin={isAdmin}
            onEditStudent={startEditStudent}
            onDeleteStudent={deleteStudent}
            onMoveStudent={moveStudent}
          />
        )}

        {activeTab === 'students' && (
          <div className={isAdmin ? 'two-column' : 'stack'}>
            {isAdmin && (
              <StudentForm editingStudent={editingStudent} onSave={saveStudent} onCancel={() => setEditingStudent(null)} />
            )}
            {!isAdmin && <p className="admin-alert">새 선수 등록과 학생 정보 수정은 관리자 모드에서만 가능합니다.</p>}
            <StudentList
              students={students}
              records={records}
              isAdmin={isAdmin}
              onSelect={openDetail}
              onEdit={startEditStudent}
              onDelete={deleteStudent}
              onMoveStudent={moveStudent}
            />
          </div>
        )}

        {activeTab === 'record' && isAdmin && <RecordForm students={students} onSave={saveRecord} />}

        {activeTab === 'detail' && selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            records={records}
            isAdmin={isAdmin}
            onBack={() => setActiveTab('students')}
            onDeleteRecord={deleteRecord}
          />
        )}

        {activeTab === 'admin' && isAdmin && <AdminDashboard students={students} records={records} />}

        {activeTab === 'settings' && (
          <Settings
            students={students}
            records={records}
            isAdmin={isAdmin}
            onDeleteRecord={deleteRecord}
            onUpdateRecord={updateRecord}
            onResetAllData={resetAllData}
            onExportStudents={exportStudents}
            onExportRecords={exportRecords}
            onAddSamples={addSamples}
          />
        )}
      </main>
    </div>
  );
}

function Home({
  students,
  records,
  filteredRecords,
  search,
  distanceFilter,
  setSearch,
  setDistanceFilter,
  onOpenStudent,
  isAdmin,
  onEditStudent,
  onDeleteStudent,
  onMoveStudent,
}) {
  const [comparisonDistance, setComparisonDistance] = useState('all');
  const [selectedChartStudents, setSelectedChartStudents] = useState([]);
  const searchedStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggleChartStudent = (studentId) => {
    setSelectedChartStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  return (
    <section className="stack">
      <div className="home-hero">
        <div>
          <p className="eyebrow">오늘의 사대 현황</p>
          <h2>ROCk 양궁기록장</h2>
        </div>
        <div className="home-metrics">
          <div><strong>{students.length}</strong><span>등록 학생</span></div>
          <div><strong>{records.length}</strong><span>전체 기록</span></div>
        </div>
      </div>

      <StudentList
        students={students}
        records={records}
        isAdmin={isAdmin}
        onSelect={onOpenStudent}
        onEdit={onEditStudent}
        onDelete={onDeleteStudent}
        onMoveStudent={onMoveStudent}
      />

      {isAdmin && (
        <div className="panel admin-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">관리자 성장 그래프</p>
              <h2>학생별 평균 점수 변화</h2>
            </div>
          </div>

          <div className="chart-control-grid">
            <label>
              그래프 거리
              <select value={comparisonDistance} onChange={(event) => setComparisonDistance(event.target.value)}>
                <option value="all">전체 거리</option>
                <option value="20">20m</option>
                <option value="25">25m</option>
                <option value="30">30m</option>
                <option value="35">35m</option>
              </select>
            </label>

            <div>
              <span className="label-text">학생 선택</span>
              <div className="student-toggle-row">
                <button
                  className={selectedChartStudents.length === 0 ? 'active-toggle' : 'secondary'}
                  type="button"
                  onClick={() => setSelectedChartStudents([])}
                >
                  전체
                </button>
                {students.map((student) => (
                  <button
                    className={selectedChartStudents.includes(student.id) ? 'active-toggle' : 'secondary'}
                    key={student.id}
                    type="button"
                    onClick={() => toggleChartStudent(student.id)}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ComparisonChart
            students={students}
            records={records}
            selectedStudentIds={selectedChartStudents}
            distance={comparisonDistance}
          />
        </div>
      )}

      <div className="panel">
        <div className="filter-row">
          <label>
            학생 이름 검색
            <input
              list="student-name-options"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="학생 이름"
            />
            <datalist id="student-name-options">
              {students.map((student) => (
                <option key={student.id} value={student.name} />
              ))}
            </datalist>
          </label>
          <label>
            거리별 필터
            <select value={distanceFilter} onChange={(event) => setDistanceFilter(event.target.value)}>
              <option value="all">전체</option>
              <option value="20">20m</option>
              <option value="25">25m</option>
              <option value="30">30m</option>
              <option value="35">35m</option>
            </select>
          </label>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">최근 기록</p>
            <h2>날짜순 정렬</h2>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <p className="empty">아직 기록이 없습니다.</p>
        ) : (
          <div className="record-list">
            {filteredRecords
              .filter((record) => {
                const student = students.find((item) => item.id === record.studentId);
                return !search.trim() || searchedStudents.some((item) => item.id === student?.id);
              })
              .map((record) => {
              const student = students.find((item) => item.id === record.studentId);
              return (
                <article className="record-card" key={record.id}>
                  <button className="link-card" type="button" onClick={() => student && onOpenStudent(student.id)}>
                    <strong>{student?.name ?? '삭제된 학생'} · {record.date}</strong>
                    <span>{record.distance}m · 총점 {record.totalScore}점 · 평균 {record.averageScore}점</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Settings({
  students,
  records,
  isAdmin,
  onDeleteRecord,
  onUpdateRecord,
  onResetAllData,
  onExportStudents,
  onExportRecords,
  onAddSamples,
}) {
  const [studentId, setStudentId] = useState('');
  const selectedStudent = students.find((student) => student.id === studentId);
  const selectedRecords = sortRecordsByDate(records.filter((record) => record.studentId === studentId));

  return (
    <section className="stack">
      <div className="panel">
        <div className="panel-title">
          <div>
            <p className="eyebrow">내보내기</p>
            <h2>CSV 다운로드</h2>
          </div>
        </div>
        <div className="button-row">
          <button className="secondary" type="button" onClick={onExportStudents}>
            학생 목록 CSV
          </button>
          <button className="secondary" type="button" onClick={onExportRecords}>
            훈련 기록 CSV
          </button>
        </div>
      </div>

      <div className={isAdmin ? 'panel danger-zone' : 'panel admin-locked'}>
        <div className="panel-title">
          <div>
            <p className="eyebrow">기록 관리</p>
            <h2>학생별 날짜 기록 수정/삭제</h2>
          </div>
        </div>
        {!isAdmin ? (
          <p className="empty">기록 수정과 삭제는 관리자 모드에서만 가능합니다.</p>
        ) : (
          <>
            <div className="filter-row record-manager-filter">
              <label>
                학생 선택
                <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
                  <option value="">학생 선택</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.gradeClass})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {!studentId && <p className="empty">기록을 수정하거나 삭제할 학생을 선택해 주세요.</p>}
            {studentId && selectedRecords.length === 0 && (
              <p className="empty">{selectedStudent?.name} 학생의 훈련 기록이 없습니다.</p>
            )}
            {selectedRecords.length > 0 && (
              <div className="editable-record-list">
                {selectedRecords.map((record) => (
                  <EditableRecordCard
                    key={record.id}
                    record={record}
                    studentName={selectedStudent?.name ?? '학생'}
                    onDeleteRecord={onDeleteRecord}
                    onUpdateRecord={onUpdateRecord}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <div className="panel admin-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">관리자 전용</p>
              <h2>샘플/전체 초기화</h2>
            </div>
          </div>
          <div className="button-row">
            <button className="primary" type="button" onClick={onAddSamples}>
              샘플 데이터 추가
            </button>
            <button className="danger" type="button" onClick={onResetAllData}>
              전체 데이터 초기화
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function EditableRecordCard({ record, studentName, onDeleteRecord, onUpdateRecord }) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(record.date);
  const [distance, setDistance] = useState(record.distance);
  const [setScoresText, setSetScoresText] = useState(record.setScores.join(', '));
  const [memo, setMemo] = useState(record.memo ?? '');

  const scores = setScoresText
    .split(',')
    .map((score) => score.trim())
    .filter(Boolean);
  const numericScores = scores.map((score) => Number(score));
  const hasInvalidScore = scores.length === 0 || numericScores.some((score) => Number.isNaN(score));
  const total = hasInvalidScore ? 0 : calculateTotal(numericScores);
  const average = hasInvalidScore ? 0 : calculateAverage(numericScores);

  const resetEdit = () => {
    setDate(record.date);
    setDistance(record.distance);
    setSetScoresText(record.setScores.join(', '));
    setMemo(record.memo ?? '');
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (!date) {
      alert('날짜를 입력해 주세요.');
      return;
    }
    if (hasInvalidScore) {
      alert('세트 점수는 쉼표로 구분한 숫자로 입력해 주세요. 예: 52, 55, 56');
      return;
    }

    onUpdateRecord({
      ...record,
      date,
      distance: Number(distance),
      setCount: numericScores.length,
      setScores: numericScores,
      totalScore: total,
      averageScore: average,
      memo: memo.trim(),
    });
    setIsEditing(false);
  };

  return (
    <article className="editable-record-card">
      <div className="editable-record-head">
        <div>
          <strong>{record.date} · {record.distance}m</strong>
          <p>{studentName} · {record.setCount}세트 · 총점 {record.totalScore}점 · 평균 {record.averageScore}점</p>
        </div>
        <div className="button-row">
          <button className="secondary" type="button" onClick={() => setIsEditing((current) => !current)}>
            {isEditing ? '닫기' : '수정'}
          </button>
          <button className="danger" type="button" onClick={() => onDeleteRecord(record.id)}>
            이 날짜 기록 삭제
          </button>
        </div>
      </div>

      {!isEditing && (
        <div className="record-preview">
          <span>세트 점수: {record.setScores.join(' / ')}</span>
          {record.memo && <span>메모: {record.memo}</span>}
        </div>
      )}

      {isEditing && (
        <div className="editable-record-form">
          <label>
            날짜
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            거리
            <select value={distance} onChange={(event) => setDistance(Number(event.target.value))}>
              {DISTANCES.map((item) => (
                <option key={item} value={item}>{item}m</option>
              ))}
            </select>
          </label>
          <label className="span-2">
            세트별 점수
            <input
              inputMode="numeric"
              value={setScoresText}
              onChange={(event) => setSetScoresText(event.target.value)}
              placeholder="예: 52, 55, 56, 54, 57"
            />
          </label>
          <label className="span-2">
            지도 메모
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} />
          </label>
          <div className="summary-strip span-2">
            <span>총점 <strong>{total}</strong>점</span>
            <span>평균 <strong>{average}</strong>점</span>
          </div>
          <div className="button-row span-2">
            <button className="primary" type="button" onClick={saveEdit}>
              수정 저장
            </button>
            <button className="secondary" type="button" onClick={resetEdit}>
              취소
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
