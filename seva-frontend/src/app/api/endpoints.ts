export const endpoint = {
  upload: {
    editor: "/upload/editor",
  },

  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    profile: "/auth/profile",
    changePassword: "/auth/change-password",
    createUser: "/auth/create-user",
    getUsers: "/auth/users",
    getUserById: "/auth/user/",
    updateUser: "/auth/update-user/",
    deleteUser: "/auth/delete-user/",
  },

  categories: {
    getAll: "/categories/get-all",
    getById: "/categories/get-by-id/",
    create: "/categories/create",
    update: "/categories/update/",
    delete: "/categories/delete/",
  },

  products: {
    getAll: "/products",
    getById: "/products/",
    create: "/products",
    update: "/products/",
    delete: "/products/",
  },

  campaigns: {
    getAll: "/campaigns",
    getOptions: "/campaigns/options",
    getBySlug: (slug: string) => `/campaigns/slug/${slug}`,
    getDonors: (slug: string) => `/campaigns/slug/${slug}/donors`,
    getById: "/campaigns/",
    create: "/campaigns",
    update: "/campaigns/",
    toggleStatus: (id: string) => `/campaigns/${id}/status`,
    delete: "/campaigns/",
  },

  blogs: {
    getAll: "/blogs",
    getOptions: "/blogs/options",
    getById: "/blogs/",
    create: "/blogs",
    update: "/blogs/",
    delete: "/blogs/",
    toggleStatus: (id: string) => `/blogs/${id}/status`,
  },

  donors: {
    getAll: "/donors",
    getById: "/donors/",
    create: "/donors",
    update: "/donors/",
    delete: "/donors/",
  },

  donations: {
    getAll: "/donations",
    getById: "/donations/",
    create: "/donations/create",
    createOrder: "/donations/create-order",
    verify: "/donations/verify",
    failed: "/donations/failed",
    delete: "/donations/",
  },

  volunteerCategories: {
    getAll: "/volunteer-categories",
    getPublic: "/volunteer-categories/public",
    getOptions: "/volunteer-categories/options",
    getById: "/volunteer-categories/",
    create: "/volunteer-categories",
    update: "/volunteer-categories/",
    delete: "/volunteer-categories/",
  },

  volunteerApplications: {
    getAll: "/volunteer-applications",
    getById: "/volunteer-applications/",
    create: "/volunteer-applications",
    updateStatus: (id: string) => `/volunteer-applications/${id}/status`,
    delete: "/volunteer-applications/",
  },

  volunteers: {
    getAll: "/volunteer-applications",
    getById: "/volunteer-applications/",
    create: "/volunteer-applications",
    update: "/volunteer-applications/",
    delete: "/volunteer-applications/",
  },

  users: {
    getAll: "/users/get-all",
    getById: "/users/get-by-id/",
    create: "/users/create",
    update: "/users/update/",
    delete: "/users/delete/",
    login: "/users/login",
    logout: "/users/logout",
  },

  certificates: {
    getAll: "/certificates",
    getStats: "/certificates/stats",
    getById: "/certificates/",
    create: "/certificates",
    update: "/certificates/",
    delete: "/certificates/",
    revoke: (id: string) => `/certificates/${id}/revoke`,
    reactivate: (id: string) => `/certificates/${id}/reactivate`,
    generatePdf: (id: string) => `/certificates/${id}/generate-pdf`,
    verify: (certificateNo: string) => `/certificates/verify/${certificateNo}`,
    fromDonor: (donorId: string) => `/certificates/from-donor/${donorId}`,
    byDonor: (donorId: string) => `/certificates/by-donor/${donorId}`,
  },

  signatures: {
    getAll: "/signatures",
    getActive: "/signatures/active",
    create: "/signatures",
    delete: "/signatures/",
  },

  cms: {
    getPages: "/cms/pages",
    getPage: (slug: string) => `/cms/pages/${slug}`,
    savePage: (slug: string) => `/cms/pages/${slug}`,
    deletePage: (slug: string) => `/cms/pages/${slug}`,
  },

  departments: {
    getAll: "/departments",
    getById: "/departments/",
    create: "/departments",
    update: "/departments/",
    delete: "/departments/",
  },

  gallery: {
    getPublic: "/gallery",
    getAdmin: "/gallery/admin",
    upload: "/gallery",
    toggleStatus: (id: string) => `/gallery/${id}/status`,
    delete: (id: string) => `/gallery/${id}`,
  },

  leads: {
    getAll: "/leads",
    getStats: "/leads/stats",
    getById: "/leads/",
    create: "/leads",
    update: "/leads/",
    delete: "/leads/",
    subscribe: "/leads/subscribe",
    capture: "/leads/capture",
  },
};