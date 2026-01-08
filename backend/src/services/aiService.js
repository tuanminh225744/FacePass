import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getFaceEmbedding = async (imageBuffer, originalFilename = 'image.jpg') => {
    try {
        const formData = new FormData();
        // FormData expects a stream or buffer with filename options
        formData.append('file', imageBuffer, { filename: originalFilename });

        const response = await axios.post(`${AI_SERVICE_URL}/face-embedding`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error calling AI Service:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        throw new Error('Failed to extract face embedding');
    }
};
