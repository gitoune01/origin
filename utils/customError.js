class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message); //super send message to parent class, Error, which handles error messages

    //methods can be inherited from parent class Error.here new method
    this.statusCode = statusCode;
  }
}


export default ErrorHandler;
