# Express Rate Limiting

This project implements a rate-limiting solution in an Express.js application without using any third-party libraries. It limits the number of requests a user or IP address can make within a specified time frame.

## Features

- Rate limits based on user ID and IP address
- Configurable rate limit settings
- Returns HTTP 429 Too Many Requests when limits are exceeded

## Requirements

- Node.js (>= 18.x)

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Rate-limiting
   npm i 
   node index.js (`server listen on port 5000`)


## Testing
- Test cases are located in rate-limit-test.js.
- To understand the functionality more clearly, run test cases individually by using .only on specific tests.
- To run test cases, use the following command:
```bash
    npm run test