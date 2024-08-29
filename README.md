
# ScamShield Backend

## Overview

The ScamShield Backend powers the machine learning tool designed to detect potential scam messages within messaging platforms. Built using Express.js and Node.js, this backend leverages the OpenAI API to analyze messages and alert users to potential scams in real-time. This README focuses on the backend setup and includes examples of messages that could trigger the scam detector for testing purposes.

## Problem

Messaging platforms are vulnerable to exploitation by scammers who send fraudulent messages to deceive users. An automated backend system is essential to analyze and identify these scams in real-time, providing users with timely alerts to protect them from potential threats.

## Example Messages That Trigger the Detector

Here are some example messages that could trigger the scam detector:

1.  **Phishing Attempt:**
    -   "Please confirm your account details by clicking this link: [malicious-link].com."
2.  **Request for Personal Information:**
    -   "We need your social security number to complete the verification process."
3.  **Fake Prize Notifications:**
    -   "Congratulations! You've won a $1000 gift card. Claim your prize by providing your credit card details."
4.  **Urgent Payment Request:**
    -   "Your account has been compromised. Pay $500 in Bitcoin to this address to secure it."

## Starting the Backend

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   **Node.js**  (v14 or higher)
-   **npm**  (v6 or higher)
-   **OpenAI API Key**  (Sign up at  [OpenAI](https://beta.openai.com/signup/)  to get your API key)

### Installation

1.  **Clone the Repository:**
    
    `git clone https://github.com/edinarostas/ScamShield-Backend.git` 
    
2.  **Install Dependencies:**
    
    `npm install` 
    
3.  **Set Up Environment Variables:**
    
    Create a `.env` file from the existing `.env.sample` file located in the root of the project. Replace the placeholder values with your own credentials:
    
    ```
    PORT=8080
    JWT_SECRET=your_jwt_secret_key
    OPENAI_API_KEY=your_openai_api_key
    PROJECT_ID=our_openai_project_id
    ORGANIZATION_ID=our_openai_organization_id
    ``` 
4.  **Use the App:**
	  To fully utilize ScamShield, you'll need to set up both the backend and the frontend.

	1.  **Clone the Client Repository & Set Up:**
    
    Clone the frontend repository from [this link](https://github.com/edinarostas/ScamShield-Frontend), and follow the instructions in the  `README.md` to install dependencies and start the development server.
    
### Running the Backend Server

1.  **Start the Backend Server:**
    
    `npm run dev` 
