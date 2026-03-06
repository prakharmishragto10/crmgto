import pool from "../../utils/db.js";

// Mark attendance
export const markAttendance = async ({ user_id, date, status, marked_by }) => {
  const result = await pool.query(
    `INSERT INTO attendance (user_id, date, status, marked_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, date) 
     DO UPDATE SET status = $3, marked_by = $4
     RETURNING *`,
    [user_id, date, status, marked_by],
  );
  return result.rows[0];
};

// Get attendance by staff and month
export const getAttendanceByMonth = async (user_id, month, year) => {
  const result = await pool.query(
    `SELECT a.*, u.name as staff_name
     FROM attendance a
     LEFT JOIN users u ON a.user_id = u.id
     WHERE a.user_id = $1
     AND EXTRACT(MONTH FROM a.date) = $2
     AND EXTRACT(YEAR FROM a.date) = $3
     ORDER BY a.date ASC`,
    [user_id, month, year],
  );
  return result.rows;
};

// Monthly summary — total present/absent
export const getMonthlySummary = async (user_id, month, year) => {
  const result = await pool.query(
    `SELECT 
       COUNT(*) FILTER (WHERE status = 'present') as present_days,
       COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
       COUNT(*) as total_marked
     FROM attendance
     WHERE user_id = $1
     AND EXTRACT(MONTH FROM date) = $2
     AND EXTRACT(YEAR FROM date) = $3`,
    [user_id, month, year],
  );
  return result.rows[0];
};

// Get all staff attendance for a date
export const getAllStaffAttendanceByDate = async (date) => {
  const result = await pool.query(
    `SELECT u.id, u.name, r.name as role_name, 
            COALESCE(a.status, 'not marked') as status
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN attendance a ON a.user_id = u.id AND a.date = $1
     WHERE u.is_active = true
     ORDER BY u.name ASC`,
    [date],
  );
  return result.rows;
};
