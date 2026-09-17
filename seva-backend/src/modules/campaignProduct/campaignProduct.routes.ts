import express from "express";
import { ProductController } from "./campaignProduct.controller";
import { ProductValidation } from "./campaignProduct.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { uploadProductImage } from "../../middlewares/upload";

const router = express.Router();

router.post(
  "/",
  uploadProductImage.single("image"),
  // validateRequest(ProductValidation.createProductSchema),
  ProductController.createProduct
);

router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.patch(
  "/:id",
  uploadProductImage.single("image"),
  // validateRequest(ProductValidation.updateProductSchema),
  ProductController.updateProduct
);

router.delete("/:id", ProductController.deleteProduct);

export const ProductRoutes = router;
