import pool from "../../utils/db.js";

const SLA_HOURS = 24;

export const createLead = async ({
  name,
  email,
  phone,
  source,
  assigned_to,
  branch_id,
  created_by,
}) => {
  const response_due_at = new Date(Date.now() + SLA_HOURS * 60 * 60 * 1000);
  const result = await pool.query(
    `INSERT INTO leads (name, email, phone, source, assigned_to, branch_id, response_due_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      name,
      email,
      phone,
      source,
      assigned_to,
      branch_id,
      response_due_at,
      created_by,
    ],
  );
  return result.rows[0];
};

export const getAllLeads = async (branch_id, role) => {
  let query = `
    SELECT l.*, 
           u.name as assigned_to_name,
           b.name as branch_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    LEFT JOIN branches b ON l.branch_id = b.id
  `;
  const params = [];

  if (role !== "super_admin") {
    query += ` WHERE l.branch_id = $1`;
    params.push(branch_id);
  }

  query += ` ORDER BY l.created_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getLeadsByAssignee = async (user_id) => {
  const result = await pool.query(
    `SELECT l.*, 
            u.name as assigned_to_name,
            b.name as branch_name
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     LEFT JOIN branches b ON l.branch_id = b.id
     WHERE l.assigned_to = $1
     ORDER BY l.created_at DESC`,
    [user_id],
  );
  return result.rows;
};

export const getLeadById = async (id) => {
  const result = await pool.query(
    `SELECT l.*, 
            u.name as assigned_to_name,
            b.name as branch_name
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     LEFT JOIN branches b ON l.branch_id = b.id
     WHERE l.id = $1`,
    [id],
  );
  return result.rows[0];
};

export const updateLeadStatus = async (id, status, lost_reason = null) => {
  const result = await pool.query(
    `UPDATE leads 
     SET status = $1, lost_reason = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, lost_reason, id],
  );
  return result.rows[0];
};

export const assignLead = async (id, assigned_to) => {
  const result = await pool.query(
    `UPDATE leads
     SET assigned_to = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [assigned_to, id],
  );
  return result.rows[0];
};

export const getOverdueLeads = async () => {
  const result = await pool.query(
    `SELECT l.*, 
            u.name as assigned_to_name,
            b.name as branch_name
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     LEFT JOIN branches b ON l.branch_id = b.id
     WHERE l.status = 'new'
     AND l.response_due_at < NOW()
     ORDER BY l.response_due_at ASC`,
  );
  return result.rows;
};

export const updateLeadNotes = async (id, notes) => {
  const result = await pool.query(
    `UPDATE leads
     SET notes = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [notes, id],
  );
  return result.rows[0];
};
