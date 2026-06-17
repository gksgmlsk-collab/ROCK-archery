export default function StudentList({
  students,
  records,
  isAdmin = false,
  onSelect,
  onEdit,
  onDelete,
  onMoveStudent,
}) {
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <p className="eyebrow">선수 명단</p>
          <h2>등록 학생 {students.length}명</h2>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="empty">아직 등록된 학생이 없습니다.</p>
      ) : (
        <div className="student-grid">
          {students.map((student, index) => {
            const count = records.filter((record) => record.studentId === student.id).length;
            return (
              <article className="student-card" key={student.id}>
                <button className="card-main" type="button" onClick={() => onSelect(student.id)}>
                  <div className="student-photo">
                    {student.photo ? <img src={student.photo} alt={`${student.name} 사진`} /> : <span>{student.name.slice(0, 1)}</span>}
                  </div>
                  <div className="student-card-copy">
                    <span className="student-name">{student.name}</span>
                    <span>{student.gradeClass}</span>
                    <strong>{count}회 기록</strong>
                    {student.awards && <small className="award-line">{student.awards}</small>}
                  </div>
                </button>
                {isAdmin && (
                  <div className="card-actions admin-card-actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => onMoveStudent(student.id, 'up')}
                      disabled={index === 0}
                    >
                      위로
                    </button>
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => onMoveStudent(student.id, 'down')}
                      disabled={index === students.length - 1}
                    >
                      아래로
                    </button>
                    <button className="secondary" type="button" onClick={() => onEdit(student)}>
                      수정
                    </button>
                    <button className="danger" type="button" onClick={() => onDelete(student.id)}>
                      삭제
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
