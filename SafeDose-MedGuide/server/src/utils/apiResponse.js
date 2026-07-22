const sendResponse = (res, statusCode, success, message, data = null, pagination = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200, pagination = null) => {
  return sendResponse(res, statusCode, true, message, data, pagination);
};

const sendError = (res, message, statusCode = 500) => {
  return sendResponse(res, statusCode, false, message);
};

module.exports = { sendResponse, sendSuccess, sendError };
