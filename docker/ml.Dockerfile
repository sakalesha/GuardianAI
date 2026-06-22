# ML Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY ml/requirements.txt .
RUN pip install -r requirements.txt
COPY ml/ .
EXPOSE 5000
CMD ["python", "src/ml_api.py"]
