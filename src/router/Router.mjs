import exp from "express";
import studentRouter from "./studentRouter.mjs";
import userRouter from "./userRouter.mjs";

const router = exp();

router.use(studentRouter);
router.use(userRouter);

export default router;