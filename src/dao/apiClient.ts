import axios, { type AxiosInstance } from "axios";

const API_BASE_URL = window.location.hostname === "localhost" ?
    "http://127.0.0.1:5002/angolaeventos-cd238/us-central1/sistemaDeReservaServer"
    :
    "https://us-central1-angolaeventos-cd238.cloudfunctions.net/sistemaDeReservaServer";

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    //window.location.href = "/login";
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, params?: any) {
        return this.client.get<T>(url, { params });
    }

    async post<T>(url: string, data?: any) {
        return this.client.post<T>(url, data);
    }

    async put<T>(url: string, data?: any) {
        return this.client.put<T>(url, data);
    }

    async delete<T>(url: string) {
        return this.client.delete<T>(url);
    }
}

export default new ApiClient();