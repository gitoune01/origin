export const catchErrors = (err, req, res, next) => {
  let message = err.message || 'Internal error'; //err message is property of default Error object class got from next() in the controller"
  let statusCode = err.statusCode || 500;

  if (err.code === 11000){
    message = `Duplicate value entered for ${Object.keys(err.keyValue)}`,
    statusCode = 400
  }
  if (err.name === "CastError"){
    message = `Invalid ${err.path}`;
    statusCode = 400
  }
  res.status(statusCode).json({ success: false, message:err.message});
};

