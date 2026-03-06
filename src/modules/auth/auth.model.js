import pool from "../../utils/db.js";

//find user by email id
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
