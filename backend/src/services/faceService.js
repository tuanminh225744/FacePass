import FaceEmbedding from '../models/FaceEmbedding.js';

// Tính Cosine Similarity giữa 2 vector
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

export const findMatchingResident = async (targetEmbedding, threshold = 0.6) => {
    // Lấy tất cả embedding từ DB (Lưu ý: Với quy mô lớn cần dùng Vector DB hoặc tối ưu hơn)
    // Với quy mô < 1000 người, load memory vẫn ổn
    const allEmbeddings = await FaceEmbedding.find().populate('residentId');

    let bestMatch = null;
    let maxScore = -1;

    for (const record of allEmbeddings) {
        const score = cosineSimilarity(targetEmbedding, record.embedding);
        if (score > maxScore) {
            maxScore = score;
            bestMatch = record;
        }
    }

    if (maxScore >= threshold && bestMatch && bestMatch.residentId) {
        return {
            match: true,
            resident: bestMatch.residentId,
            score: maxScore
        };
    }

    return {
        match: false,
        score: maxScore
    };
};
