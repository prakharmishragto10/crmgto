import pool from "../../utils/db.js";

// Find user by email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, b.name as branch_name 
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN branches b ON u.branch_id = b.id
     WHERE u.email = $1 AND u.is_active = true`,
    [email],
  );
  return result.rows[0];
};

// Find user by id
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, b.name as branch_name 
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN branches b ON u.branch_id = b.id
     WHERE u.id = $1 AND u.is_active = true`,
    [id],
  );
  return result.rows[0];
};

// Create user
export const createUser = async ({
  name,
  email,
  password,
  role_id,
  branch_id,
  created_by,
}) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role_id, branch_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role_id, branch_id, created_at`,
    [name, email, password, role_id, branch_id, created_by],
  );
  return result.rows[0];
};

// Get all roles
export const getAllRoles = async () => {
  const result = await pool.query(`SELECT * FROM roles`);
  return result.rows;
};

// Create new staff user
export const createStaffUser = async ({
  name,
  email,
  password,
  phone,
  role_id,
  branch_id,
  created_by,
}) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role_id, branch_id, created_by, must_change_password)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING id, name, email, phone, role_id, branch_id, created_at`,
    [name, email, password, phone, role_id, branch_id, created_by],
  );
  return result.rows[0];
};

// Get all staff
export const getAllStaff = async () => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.must_change_password,
            r.name as role_name, b.name as branch_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN branches b ON u.branch_id = b.id
     ORDER BY u.created_at DESC`,
  );
  return result.rows;
};

// Update password
export const updatePassword = async (id, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users 
     SET password = $1, must_change_password = false, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email`,
    [hashedPassword, id],
  );
  return result.rows[0];
};

// Toggle user active status
export const toggleUserStatus = async (id) => {
  const result = await pool.query(
    `UPDATE users 
     SET is_active = NOT is_active, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active`,
    [id],
  );
  return result.rows[0];
};
