import { ICampaignProduct, CampaignProduct } from "./campaignProduct.model";

const createProduct = async (payload: Partial<ICampaignProduct>) => {
  if (payload.name) {
    const trimmedName = payload.name.trim();

    // Release any old deleted product holding this name
    await CampaignProduct.updateMany(
      {
        name: { $regex: `^${trimmedName}$`, $options: "i" },
        isDeleted: true,
      },
      { $set: { name: `${trimmedName} (deleted ${Date.now()})` } }
    );

    // Check if an active product has this name
    const existing = await CampaignProduct.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
      isDeleted: false,
    });

    if (existing) {
      const error: any = new Error(
        `A product with the name "${trimmedName}" already exists. Please choose a different name.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const result = await CampaignProduct.create(payload);
  return result;
};

const getAllProducts = async () => {
  const result = await CampaignProduct.find({ isDeleted: false }).sort({ createdAt: -1 });
  return result;
};

const getProductById = async (id: string) => {
  const result = await CampaignProduct.findById(id);
  if (!result || result.isDeleted) return null;
  return result;
};

const updateProduct = async (id: string, payload: Partial<ICampaignProduct>) => {
  if (payload.name) {
    const trimmedName = payload.name.trim();

    // Release any old deleted product
    await CampaignProduct.updateMany(
      {
        name: { $regex: `^${trimmedName}$`, $options: "i" },
        isDeleted: true,
        _id: { $ne: id },
      },
      { $set: { name: `${trimmedName} (deleted ${Date.now()})` } }
    );

    // Check if another active product has this name
    const existing = await CampaignProduct.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existing) {
      const error: any = new Error(
        `A product with the name "${trimmedName}" already exists. Please choose a different name.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const result = await CampaignProduct.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
  return result;
};

const deleteProduct = async (id: string) => {
  const product = await CampaignProduct.findById(id);
  if (!product) return null;

  product.isDeleted = true;
  product.name = `${product.name} (deleted ${Date.now()})`;
  await product.save();
  return product;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
