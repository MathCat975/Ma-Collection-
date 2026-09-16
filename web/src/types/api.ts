export type AuthCredentials = {
    email: string;
    password: string;
};

export type AuthToken = {
    access_token: string;
    token_type: "bearer";
};

export type ApiError = {
    detail?: string;
    erreur?: { message?: string };
};
