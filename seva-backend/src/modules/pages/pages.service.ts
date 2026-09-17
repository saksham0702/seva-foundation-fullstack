import { IPage, ISection, PageModel } from "./pages.model";

const createPage = async (payload: Partial<IPage>): Promise<IPage> => {
  const result = await PageModel.create(payload);
  return result;
};

const getAllPages = async (): Promise<IPage[]> => {
  const result = await PageModel.find({ isDeleted: false }).sort({ createdAt: -1 });
  return result;
};

const getPageById = async (id: string): Promise<IPage | null> => {
  const result = await PageModel.findOne({ _id: id, isDeleted: false });
  return result;
};

// PUBLIC — used by the actual website to render a page by its slug
const getPageBySlug = async (slug: string): Promise<IPage | null> => {
  const result = await PageModel.findOne({
    slug,
    isDeleted: false,
    isPublished: true,
  });
  return result;
};

const updatePageMeta = async (
  id: string,
  payload: Partial<Pick<IPage, "name" | "slug" | "seoTitle" | "seoDescription" | "updatedBy">>
): Promise<IPage | null> => {
  const result = await PageModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// Admin submits the whole sections array at once — page's section list/order
// is predefined by the frontend template, admin is just filling values in.
const updateSections = async (
  id: string,
  sections: ISection[],
  updatedBy?: string
): Promise<IPage | null> => {
  const result = await PageModel.findByIdAndUpdate(
    id,
    { sections, updatedBy },
    { new: true, runValidators: true }
  );
  return result;
};

const togglePublish = async (
  id: string,
  isPublished: boolean,
  updatedBy?: string
): Promise<IPage | null> => {
  const result = await PageModel.findByIdAndUpdate(
    id,
    { isPublished, updatedBy },
    { new: true }
  );
  return result;
};

const deletePage = async (id: string): Promise<IPage | null> => {
  const result = await PageModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return result;
};

const getPageOptions = async () => {
  const result = await PageModel.find({ isDeleted: false }, { name: 1, slug: 1, _id: 1 });
  return result;
};

export const PageService = {
  createPage,
  getAllPages,
  getPageById,
  getPageBySlug,
  updatePageMeta,
  updateSections,
  togglePublish,
  deletePage,
  getPageOptions,
};