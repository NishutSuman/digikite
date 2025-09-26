class ResponseUtil {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, error) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }

  static validationError(res, errors, message = 'Validation failed') {
    return res.status(400).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message,
    });
  }
}

// Export class methods as individual functions for convenience
const successResponse = (res, message, data, statusCode = 200) => {
  return ResponseUtil.success(res, data, message, statusCode);
};

const errorResponse = (res, message, statusCode = 500, error) => {
  return ResponseUtil.error(res, message, statusCode, error);
};

module.exports = {
  ResponseUtil,
  successResponse,
  errorResponse
};