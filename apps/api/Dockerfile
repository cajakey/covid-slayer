FROM node:20

# Set root working directory
WORKDIR /app

# Copy root package.json (optional, for scripts or shared deps)
COPY package.json ./

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install dependencies for API
RUN cd apps/api && npm install

# Copy API source code
COPY apps/api ./apps/api

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 4000

# Start the API server
CMD ["npm", "start"]