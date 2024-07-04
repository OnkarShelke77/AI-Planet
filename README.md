Application Architecture

1.Frontend:Built using React.js for a dynamic and responsive user interface.
2.Backend: Built using Node.js and Express.js to handle API requests and process PDF documents.
3.Database: MongoDB is used to store document data and questions.
4.NLP Service: A natural language processing service to analyze and extract information from the PDF documents.

## Setup Instructions

- Node.js and npm installed on your machine.
- MongoDB installed and running.


Create a .env file in the backend directory and add the following:
PORT=3000
MONGODB_URI=your_mongodb_connection_string

Start the backend server:
npm start

Start the frontend development server:
npm start
