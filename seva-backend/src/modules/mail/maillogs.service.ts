import { IMailLog, MailLogModel, MailLogStatus } from "./maillogs.model";

const createMailLog = async (payload: Partial<IMailLog>): Promise<IMailLog> => {
  return MailLogModel.create(payload);
};

const getAllMailLogs = async (query: {
  status?: MailLogStatus;
  templateKey?: string;
  search?: string;
}): Promise<IMailLog[]> => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.templateKey) filter.templateKey = query.templateKey;
  if (query.search) {
    (filter as any).$or = [
      { to: { $regex: query.search, $options: "i" } },
      { subject: { $regex: query.search, $options: "i" } },
    ];
  }

  return MailLogModel.find(filter).sort({ createdAt: -1 }).limit(500);
};

const getMailLogById = async (id: string): Promise<IMailLog | null> => {
  return MailLogModel.findById(id);
};

const markSent = async (id: string, messageId: string) => {
  return MailLogModel.findByIdAndUpdate(
    id,
    { status: "SENT", messageId, error: undefined },
    { new: true }
  );
};

const markFailed = async (id: string, error: string) => {
  return MailLogModel.findByIdAndUpdate(
    id,
    { status: "FAILED", error, $inc: { attempts: 1 } },
    { new: true }
  );
};

export const MailLogService = {
  createMailLog,
  getAllMailLogs,
  getMailLogById,
  markSent,
  markFailed,
};