from pydantic import BaseModel, EmailStr, Field, field_validator


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Le mot de passe doit tenir sur 72 octets UTF-8")
        return value


class UserRead(BaseModel):
    id: int
    email: EmailStr


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
