/*** Provides a standardized structure for successful and failed HTTP responses
 * to ensure consistency across the application. */
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
