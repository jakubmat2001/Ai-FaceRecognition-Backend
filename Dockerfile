FROM node:18.18.0

WORKDIR /the/workdir/Ai-FaceRecognition-Backend
COPY ./ ./ 
RUN npm install

CMD ["/bin/bash"]