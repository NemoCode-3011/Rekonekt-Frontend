import axios from "axios";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the sessionId cookie
});

// Every failed request becomes an ApiError
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(
        new ApiError(
          error.response.status,
          error.response.data?.message ?? "Something went wrong. Please try again."
        )
      );
    }
    return Promise.reject(
      new ApiError(0, "Can't reach the server. Check your connection and try again.")
    );
  }
);