# Linktree Backend

This is the backend for a Linktree-like application, built with Node.js, Express, and PostgreSQL. It includes user authentication, referral tracking, and rate limiting.

## Features

- User registration and login
- Referral system
- Rate limiting
- JWT-based authentication

## Prerequisites

- Node.js
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/UB2002/Linktree-backend.git
    cd linktree-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```properties
    PORT=5000
    DATABASE_URL=url-to-PSQL
    JWT_SECRET=your-secret-key
    ```

4. Set up the PostgreSQL database:
    ```sh
    psql -U postgres -c "CREATE DATABASE linktree_db;"
    ```

5. Run database migrations (if any).

6. Start the server:
    ```sh
    npm start
    ```

## Running Tests

To run the tests, use the following command:
```sh
npm test
```

## API Endpoints

### Auth Routes

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user


### Referral Routes

- `GET /api/referrals` - Get referrals for the logged-in user
- `GET /api/referral-stats` - Get referral statistics for the logged-in user

## Postman Collection

A Postman collection is included in the repository for testing the API endpoints. Import `Linktree.postman_collection.json` into Postman to get started.

## License

This project is licensed under the MIT License.
