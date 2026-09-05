FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY ml-engine/traffic_predictor/requirements.txt .

RUN pip install --no-cache-dir torch --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-engine/traffic_predictor/ .

ENV PORT=8501
EXPOSE 8501

CMD ["sh", "-c", "streamlit run app.py --server.port=${PORT:-8501} --server.address=0.0.0.0"]
