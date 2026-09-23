import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { LeadService } from "./leads.service";
import { AuthRequest } from "../../middlewares/auth/auth.middleware";

const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Valid email is required to subscribe.",
    });
  }

  const result = await LeadService.subscribeNewsletter(email, name);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isNew
      ? "Thank you for subscribing to Seva India Foundation!"
      : "You are already subscribed. Thank you for your support!",
    data: result.lead,
  });
});

const captureLead = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, campaignId, amount, reason, source } = req.body;
  if (!email && !phone) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Email or phone number is required to register lead.",
    });
  }

  let lead;
  if (source === "PAYMENT_FAILED") {
    lead = await LeadService.captureFailedPaymentLead({
      name,
      email,
      phone,
      campaignId,
      amount,
      reason,
    });
  } else {
    lead = await LeadService.createLead({
      name: name || "Website Inquiry",
      email: email || `inquiry_${Date.now()}@lead.local`,
      phone,
      source: source || "CONTACT_FORM",
      campaign: campaignId,
      amount,
      notes: reason || "Captured via public form",
    });
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Inquiry recorded successfully.",
    data: lead,
  });
});

const getAllLeads = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.getAllLeads(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leads retrieved successfully.",
    data: result,
  });
});

const getLeadStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await LeadService.getLeadStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead statistics retrieved successfully.",
    data: stats,
  });
});

const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const lead = await LeadService.getLeadById(id);
  if (!lead) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Lead not found.",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead retrieved successfully.",
    data: lead,
  });
});

const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.createLead(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Lead created successfully.",
    data: lead,
  });
});

const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updated = await LeadService.updateLead(id, req.body);
  if (!updated) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Lead not found.",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead updated successfully.",
    data: updated,
  });
});

const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const deleted = await LeadService.deleteLead(id);
  if (!deleted) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Lead not found.",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead deleted successfully.",
    data: null,
  });
});

// ── Follow-up Endpoints ───────────────────────────────────────────────────────
const addFollowUp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { channel, disposition, notes, nextFollowUpDate } = req.body;

  if (!disposition) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Follow-up disposition is required.",
    });
  }

  const updated = await LeadService.addFollowUp(id, {
    channel,
    disposition,
    notes,
    nextFollowUpDate,
    loggedBy: req.user?.userId,
    loggedByName: req.body.loggedByName || (req.user?.role === "admin" ? "Admin" : "Staff Member"),
  });

  if (!updated) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Lead not found.",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Follow-up activity recorded successfully.",
    data: updated,
  });
});

// ── Follow-up Configs Endpoints ───────────────────────────────────────────────
const getFollowUpConfigs = asyncHandler(async (_req: Request, res: Response) => {
  const configs = await LeadService.getFollowUpConfigs();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Follow-up configurations retrieved successfully.",
    data: configs,
  });
});

const createFollowUpConfig = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, color, defaultNotes, requiresNextAction, sortOrder } = req.body;
  if (!name?.trim()) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Configuration name is required.",
    });
  }

  const created = await LeadService.createFollowUpConfig({
    name: name.trim(),
    category,
    color,
    defaultNotes,
    requiresNextAction: !!requiresNextAction,
    sortOrder: Number(sortOrder) || 0,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Follow-up configuration created successfully.",
    data: created,
  });
});

const updateFollowUpConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updated = await LeadService.updateFollowUpConfig(id, req.body);
  if (!updated) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Configuration not found.",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Configuration updated successfully.",
    data: updated,
  });
});

const deleteFollowUpConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const success = await LeadService.deleteFollowUpConfig(id);
  if (!success) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Configuration not found.",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Configuration removed successfully.",
    data: null,
  });
});

export const LeadController = {
  subscribeNewsletter,
  captureLead,
  getAllLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  getFollowUpConfigs,
  createFollowUpConfig,
  updateFollowUpConfig,
  deleteFollowUpConfig,
};
