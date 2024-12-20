import modal
import io
import os
import requests
from datetime import datetime, timezone
from fastapi import Response, HTTPException, Query, Request



def download_model():
    from diffusers import AutoPipelineForText2Image
    import torch

    AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sdxl-turbo",
        torch_dtype=torch.float16,
        variant="fp16"
    )

image = modal.Image.debian_slim().pip_install(
    "fastapi[standard]", "transformers", "accelerate", "diffusers", "torch","requests"
).run_function(download_model)

app = modal.App("sd-demo", image=image)

@app.cls(
    image=image,
    gpu="A10G",
    secrets=[modal.Secret.from_name("API_KEY")],
    container_idle_timeout=300,
)
class Model:
    @modal.build()
    @modal.enter()
    def load_weights(self):
        from diffusers import AutoPipelineForText2Image
        import torch

        self.pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
        )
        self.pipe.to("cuda")
        self.API_KEY = os.environ["API_KEY"]

    @modal.web_endpoint()
    def generate_image(self, request: Request,prompt:str = Query(...,description="The prompt for image generation")):

        api_key = request.headers.get("X-API-Key")
        if api_key != self.API_KEY:
            raise HTTPException (
                status_code=401,
                detail="Unauthurized"
            )
    
        image = self.pipe(prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")

        return Response(content=buffer.getvalue(), media_type="image/jpeg")

    @modal.web_endpoint()
    def health(self):
        return {"status": "Healthy", "timestamp":datetime.now(timezone.utc).isoformat()}

@app.function(
    schedule=modal.Cron("0 * * * *"),
    secrets=[modal.Secret.from_name("API_KEY")],
) 


def keep_warm():
    health_url="https://obay-developer--sd-demo-model-health.modal.run/"
    generate_url = "https://obay-developer--sd-demo-model-generate-image.modal.run/"

    health_response = requests.get(health_url)
    print(f"Heatlh check at {health_response.json()["timestamp"]}")

    headers={"X-API-Key":os.environ["API_KEY"]}
    generate_response = requests.get(generate_url,headers=headers)

    print("Generate endpoint tested succesfully at:",datetime.now(timezone.utc).isoformat())