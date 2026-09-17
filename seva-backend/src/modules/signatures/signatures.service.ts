import { ISignature, SignatureModel, SignatureType } from "./signatures.model";

const uploadSignature = async (
  payload: Partial<ISignature> & { type: SignatureType; imageUrl: string; label: string }
): Promise<ISignature> => {
  // Only one active signature per type — retire the old one
  await SignatureModel.updateMany(
    { type: payload.type, isDeleted: false, isActive: true },
    { $set: { isActive: false } }
  );

  return SignatureModel.create({ ...payload, isActive: true });
};

const getActiveSignatures = async () => {
  const [president, secretary, seal] = await Promise.all([
    SignatureModel.findOne({ type: "PRESIDENT", isActive: true, isDeleted: false }).sort({ createdAt: -1 }),
    SignatureModel.findOne({ type: "SECRETARY", isActive: true, isDeleted: false }).sort({ createdAt: -1 }),
    SignatureModel.findOne({ type: "SEAL", isActive: true, isDeleted: false }).sort({ createdAt: -1 }),
  ]);
  return { president, secretary, seal };
};

const getAllSignatures = async (type?: SignatureType) => {
  const filter: any = { isDeleted: false };
  if (type) filter.type = type;
  return SignatureModel.find(filter).sort({ createdAt: -1 });
};

const getSignatureById = async (id: string) => {
  return SignatureModel.findOne({ _id: id, isDeleted: false });
};

const deleteSignature = async (id: string) => {
  return SignatureModel.findByIdAndUpdate(id, { isDeleted: true, isActive: false }, { new: true });
};

export const SignatureService = {
  uploadSignature,
  getActiveSignatures,
  getAllSignatures,
  getSignatureById,
  deleteSignature,
};