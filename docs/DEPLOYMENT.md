# Deployment Instructions

## Using Docker for Deployment

This application can be deployed using Docker to ensure consistent environments for both development and production.

### Prerequisites
- Make sure to install [Docker](https://www.docker.com/get-started).
- Install [Docker Compose](https://docs.docker.com/compose/install/) for managing multi-container applications.

### Building Docker Images
1. Open a terminal and navigate to the project root directory.
2. Build the Docker images with the following command:
   ```bash
   docker-compose build
   ```

### Starting the Application
To launch the application, execute:
```bash
   docker-compose up
```
This command will initiate both the frontend and backend services.

### Setting Environment Variables
Ensure that you configure the necessary environment variables in the `.env` file for the backend service. For example:
```
DATABASE_URL=mongodb://mongo:27017/blog
JWT_SECRET=your_jwt_secret
```

### Accessing the Application
- Frontend: Access the application by navigating to `http://localhost:4200/` in your web browser.
- Backend: The API can be accessed at `http://localhost:3000/`.

### Stopping Services
To stop all running services, use:
```bash
   docker-compose down
```

## Considerations for Production
- Implement a reverse proxy (e.g., Nginx) to manage HTTPS and routing.
- Optimize Docker images for production using multi-stage builds.
- Regularly monitor application performance and logs for any issues.
