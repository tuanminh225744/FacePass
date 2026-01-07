from fastapi import FastAPI, UploadFile, File
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import torch
import io
import os
import torch.nn.functional as F

app = FastAPI()

# Load model
mtcnn = MTCNN(image_size=160, margin=14)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

EMB_DIR = "data/embeddings"
os.makedirs(EMB_DIR, exist_ok=True)

# 🔹 API đăng ký khuôn mặt
@app.post("/register/{user_id}")
async def register_face(user_id: str, file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))

    face = mtcnn(img)
    if face is None:
        return {"success": False, "message": "Không phát hiện khuôn mặt"}

    embedding = resnet(face.unsqueeze(0))
    torch.save(embedding, f"{EMB_DIR}/{user_id}.pt")

    return {"success": True, "message": "Đã đăng ký khuôn mặt"}

# 🔹 API xác thực
@app.post("/verify")
async def verify_face(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))

    face = mtcnn(img)
    if face is None:
        return {"success": False, "message": "Không phát hiện khuôn mặt"}

    live_emb = resnet(face.unsqueeze(0))

    best_score = -1
    best_user = None

    for f in os.listdir(EMB_DIR):
        db_emb = torch.load(f"{EMB_DIR}/{f}")
        score = F.cosine_similarity(live_emb, db_emb).item()

        if score > best_score:
            best_score = score
            best_user = f.replace(".pt", "")

    return {
        "success": best_score > 0.8,
        "user_id": best_user,
        "score": best_score
    }

@app.get("/check-connect")
async def check_connect():
    
    return {
        "success": 1
    }