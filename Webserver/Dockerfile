# Use node apline as base image
FROM node:current-alpine3.19

# Change work directory 
WORKDIR /opt/app

# Copy *.json files to container
COPY /package.json /package-lock.json ./
# Copy views
COPY /views  ./views/

# Install dependancies
RUN npm install

# Copy source code to container
COPY /index.js .

# Expose port 3000
EXPOSE 3000

# Run webserver
CMD [ "npm", "run", "start"]