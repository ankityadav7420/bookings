import { homeService } from "../services/home.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const getHome = asyncHandler(async (req, res) => {
  const data = await homeService.getHome(req.query);
  sendSuccess(res, data);
});
