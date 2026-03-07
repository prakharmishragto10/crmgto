import {
  createLead,
  getAllLeads,
  getLeadsByAssignee,
  getLeadById,
  updateLeadStatus,
  assignLead,
  getOverdueLeads,
  updateLeadNotes,
} from "./leads.model.js";
import { sendSuccess, sendError } from "../../utils/response.js";

// CREATE LEAD
export const addLead = async (req, res) => {
  try {
    const { name, email, phone, source, assigned_to, branch_id } = req.body;

    if (!name || !phone) {
      return sendError(res, "Name and phone are required", 400);
    }

    const lead = await createLead({
      name,
      email,
      phone,
      source,
      assigned_to: assigned_to || req.user.id,
      branch_id: branch_id || req.user.branch_id,
      created_by: req.user.id,
    });

    return sendSuccess(res, lead, "Lead created successfully", 201);
  } catch (error) {
    console.error("Create lead error:", error);
    return sendError(res, "Failed to create lead", 500);
  }
};

// GET ALL LEADS — role based
export const getLeads = async (req, res) => {
  try {
    let leads;

    if (req.user.role_name === "super_admin") {
      leads = await getAllLeads(req.user.branch_id, "super_admin");
    } else if (req.user.role_name === "counsellor") {
      leads = await getLeadsByAssignee(req.user.id);
    } else {
      leads = await getAllLeads(req.user.branch_id, req.user.role_name);
    }

    return sendSuccess(res, leads, "Leads fetched successfully");
  } catch (error) {
    console.error("Get leads error:", error);
    return sendError(res, "Failed to fetch leads", 500);
  }
};

// GET SINGLE LEAD
export const getLead = async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) {
      return sendError(res, "Lead not found", 404);
    }
    return sendSuccess(res, lead, "Lead fetched");
  } catch (error) {
    console.error("Get lead error:", error);
    return sendError(res, "Failed to fetch lead", 500);
  }
};

// UPDATE LEAD STATUS
export const changeLeadStatus = async (req, res) => {
  try {
    const { status, lost_reason } = req.body;

    const validStatuses = [
      "new",
      "contacted",
      "counselled",
      "registered",
      "lost",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status", 400);
    }

    if (status === "lost" && !lost_reason) {
      return sendError(res, "Lost reason is required", 400);
    }

    const lead = await updateLeadStatus(req.params.id, status, lost_reason);
    if (!lead) {
      return sendError(res, "Lead not found", 404);
    }

    return sendSuccess(res, lead, "Lead status updated");
  } catch (error) {
    console.error("Update status error:", error);
    return sendError(res, "Failed to update status", 500);
  }
};

// ASSIGN LEAD
export const reassignLead = async (req, res) => {
  try {
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return sendError(res, "assigned_to is required", 400);
    }

    const lead = await assignLead(req.params.id, assigned_to);
    if (!lead) {
      return sendError(res, "Lead not found", 404);
    }

    return sendSuccess(res, lead, "Lead assigned successfully");
  } catch (error) {
    console.error("Assign lead error:", error);
    return sendError(res, "Failed to assign lead", 500);
  }
};

// GET OVERDUE LEADS
export const overdueLeads = async (req, res) => {
  try {
    const leads = await getOverdueLeads();
    return sendSuccess(res, leads, `${leads.length} overdue leads found`);
  } catch (error) {
    console.error("Overdue leads error:", error);
    return sendError(res, "Failed to fetch overdue leads", 500);
  }
};

// UPDATE NOTES
export const addNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) {
      return sendError(res, "Notes are required", 400);
    }

    const lead = await updateLeadNotes(req.params.id, notes);
    if (!lead) {
      return sendError(res, "Lead not found", 404);
    }

    return sendSuccess(res, lead, "Notes updated");
  } catch (error) {
    console.error("Notes error:", error);
    return sendError(res, "Failed to update notes", 500);
  }
};
