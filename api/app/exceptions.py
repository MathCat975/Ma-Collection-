from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        _request: Request,
        exception: HTTPException,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exception.status_code,
            content={
                "erreur": {
                    "code": exception.status_code,
                    "message": str(exception.detail),
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request,
        _exception: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "erreur": {
                    "code": 422,
                    "message": "Donnees de requete invalides",
                },
            },
        )
