# Podini

A platform for creating podcasts.

![photo](https://www.playit3d.com/wp-content/uploads/2023/01/9423E770-A2CC-4A56-9731-5302BA6CBF71.jpeg)

# Commands for running the software

## Dependencies
Install Stripe CLI: https://stripe.com/docs/stripe-cli

Install Frontend dependencies: cd frontend && npm install

Install Backend dependencies: cd backend && pip install -r requirements.txt

## Running the software

Stripe (test mode): stripe listen --forward-to localhost:8000/payment/webhook
Frontend: cd frontend && npm run dev
Backend: cd backend/app && python main.py

# TTS
## Get docker up
docker run --rm -it -p 5002:5002 --gpus all --entrypoint bash ghcr.io/coqui-ai/tts

## Download model (it'll download but fail to run as expected, we just want it to download)
COQUI_TOS_AGREED=1 python3 TTS/server/server.py --model_name tts_models/multilingual/multi-dataset/xtts_v2

## Run it like this afterwards
tts-server \
  --model_path ~/.local/share/tts/tts_models--multilingual--multi-dataset--xtts_v2 \
  --config_path ~/.local/share/tts/tts_models--multilingual--multi-dataset--xtts_v2/config.json \
  --speakers_file_path ~/.local/share/tts/tts_models--multilingual--multi-dataset--xtts_v2/speakers_xtts.pth \
  --use_cuda true