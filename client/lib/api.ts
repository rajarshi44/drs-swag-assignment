import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Ensure this matches server port
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
