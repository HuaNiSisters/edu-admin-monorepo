FROM node:20.19.0

# The /app directory should act as the main application directory
WORKDIR /app

COPY . .

# # Copy the app package and package-lock.json file
# COPY package*.json ./

# # Copy local directories to the current local directory of our docker image (/app)
# COPY ./src ./src
# COPY ./public ./public

# ENV VARS

# Install node packages, install serve, build the app, and remove dependencies at the end
RUN npm install
    # && npm install -g serve@latest \
    # && npm run build \
    # && rm -fr node_modules

EXPOSE 8888

# Start the app using serve command
# CMD [ "serve", "-s", "build" ]
CMD [ "npm", "run", "dev" ]