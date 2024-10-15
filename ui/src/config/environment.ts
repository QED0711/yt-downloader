import config from "./config.json"


enum Protocol {
    HTTP="http",
    HTTPS="https",
}

export const MODE = import.meta.env.MODE;

const API_PROTOCOL = config.api?.protocol ?? Protocol.HTTP;
const API_HOST = config.api?.host ?? window.location.hostname;
const API_PORT = config.api?.port ?? 8000;

export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`