import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const loginUser = async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password });
    return res.data;
};

export const registerUser = async (form) => {
    const res = await axios.post(`${API_URL}/auth/signup`, form);
    return res.data;
}; 