export class BaseHttpException extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundException extends BaseHttpException {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class BadRequestException extends BaseHttpException {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class NotImplementedException extends BaseHttpException {
  constructor(message = "Not Implemented") {
    super(501, message);
  }
}

export class InternalServerException extends BaseHttpException {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}
