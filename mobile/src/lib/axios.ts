import axios from "axios";

export const api = axios.create({
  baseURL: 'https://192.168.5.59:3333'
});