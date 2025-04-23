import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";


const healthcheck = asyncHandler(async  (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, "ok" , "Health check is passed"))
})
export{healthcheck}