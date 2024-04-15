import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000",
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

export default client;
