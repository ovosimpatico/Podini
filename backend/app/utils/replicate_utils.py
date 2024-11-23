import os
import replicate
import requests
from io import BytesIO
from PIL import Image

# Ensure the REPLICATE_API_TOKEN is set in the environment
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

if not REPLICATE_API_TOKEN:
    raise ValueError("REPLICATE_API_TOKEN is not set in the environment")

# Configure the Replicate client
replicate.Client(api_token=REPLICATE_API_TOKEN)

def generate_cover_art(prompt: str, output_path: str) -> str:
    """
    Generate cover art using Replicate's Stable Diffusion model.

    :param prompt: The text prompt for image generation
    :param output_path: The path where the generated image will be saved
    :return: The path of the saved image
    """
    try:
        # Use Stable Diffusion model to generate image
        output = replicate.run(
            "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input={"prompt": prompt}
        )

        # The output is a list with one item: the URL of the generated image
        image_url = output[0]

        # Download the image
        response = requests.get(image_url)
        if response.status_code != 200:
            raise Exception(f"Failed to download image: HTTP {response.status_code}")

        # Open the image and save it locally
        img = Image.open(BytesIO(response.content))
        img.save(output_path)

        return output_path

    except Exception as e:
        print(f"Error generating cover art: {str(e)}")
        return None

def resize_image(input_path: str, output_path: str, size: tuple = (300, 300)) -> str:
    """
    Resize the input image to the specified size.

    :param input_path: Path to the input image
    :param output_path: Path where the resized image will be saved
    :param size: Tuple specifying the new size (width, height)
    :return: The path of the resized image
    """
    try:
        with Image.open(input_path) as img:
            resized_img = img.resize(size, Image.LANCZOS)
            resized_img.save(output_path)
        return output_path
    except Exception as e:
        print(f"Error resizing image: {str(e)}")
        return None