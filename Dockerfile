# Use an official Nginx image as a base
FROM nginx:alpine

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy all HTML, CSS, JS files to the nginx directory
COPY . .

# Create a custom nginx configuration for port 3000
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]