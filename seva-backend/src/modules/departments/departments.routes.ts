import express from "express";
import { DepartmentController } from "./departments.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("departments")];

router.get("/", ...guard, DepartmentController.getAllDepartments);
router.get("/:id", ...guard, DepartmentController.getDepartmentById);
router.post("/", ...guard, DepartmentController.createDepartment);
router.patch("/:id", ...guard, DepartmentController.updateDepartment);
router.delete("/:id", ...guard, DepartmentController.deleteDepartment);

export const DepartmentRoutes = router;
