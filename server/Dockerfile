# 1 
FROM python:3.7

# 2
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt gunicorn

# 5
CMD exec gunicorn -b :8080 -w 2 --pythonpath "./backend" server:app