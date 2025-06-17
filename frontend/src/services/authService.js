import api from './api';

export const loginUser = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
};

export const registerUser = async (form) => {
    const res = await api.post('/auth/signup', form);
    return res.data;
}; 