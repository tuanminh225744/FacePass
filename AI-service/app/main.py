from fastapi import FastAPI, UploadFile, File, HTTPException
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import torch
import io
import numpy as np

app = FastAPI()

# Load model
# keep_all=False vì chúng ta chỉ cần nhận diện 1 khuôn mặt chính (hoặc xử lý logic backend sau)
# select_largest=False mặc định, nhưng nếu muốn lấy mặt to nhất thì set True
mtcnn = MTCNN(image_size=160, margin=14, keep_all=False, select_largest=True, device='cpu')
resnet = InceptionResnetV1(pretrained='vggface2').eval()

@app.get("/")
def health_check():
    return {"status": "ok", "service": "FacePass AI Service"}

@app.post("/face-embedding")
async def extract_face_embedding(file: UploadFile = File(...)):
    try:
        # Read image
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes))
        
        # Convert to RGB if needed (e.g. PNG with alpha)
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Detect and align face
        # mtcnn trả về tensor đã được cropped và normalized nếu return_prob=False (default)
        face = mtcnn(img)
        
        if face is None:
            return {
                "success": False,
                "message": "No face detected"
            }

        # Calculate embedding
        # face shape: [3, 160, 160] -> add batch dim -> [1, 3, 160, 160]
        with torch.no_grad():
            embedding = resnet(face.unsqueeze(0))
        
        # Convert tensor to list for JSON response
        embedding_list = embedding[0].detach().cpu().numpy().tolist()

        return {
            "success": True,
            "embedding": embedding_list,
            "device": str(mtcnn.device)
        }

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {
            "success": False,
            "message": f"Internal Error: {str(e)}"
        }