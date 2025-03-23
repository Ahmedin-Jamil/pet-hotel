# Baguio Pet Boarding

A full-stack application for a pet hotel service based in Baguio, providing pet boarding, grooming, and daycare services with an easy-to-use online booking system.

## Features

- Online booking system for pet boarding services
- Pet profile management
- Availability calendar
- Service selection (boarding, grooming, daycare)
- Admin dashboard for managing bookings
- AI-powered chatbot for customer support
- Secure payment integration

## Project Structure

- `/pet-hotel` - React frontend application
- `/backend` - Express backend API with MySQL database

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v8 or higher)

### Frontend

```bash
cd pet-hotel
npm install
npm start
```

The frontend will be available at http://localhost:3000

### Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at http://localhost:5000

## Technologies Used

### Frontend
- React
- React Router
- Bootstrap
- React Datepicker
- FontAwesome
- Axios for API requests

### Backend
- Express
- MySQL
- Axios
- Langchain for AI integration
- OpenAI API for chatbot functionality
- JWT for authentication

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CAPTCHA_SITE_KEY=your_captcha_site_key
```

### Backend (.env)
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=pet_hotel
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

## Deployment

The application can be deployed using services like Heroku, Vercel, or AWS.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
