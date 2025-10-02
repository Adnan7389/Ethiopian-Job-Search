# Ethiopian Job Search Platform

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A comprehensive platform for job seekers and employers in Ethiopia, featuring a user-friendly interface, a powerful admin dashboard, and advanced features like real-time notifications and applicant matching.

## ✨ Features

### 🧑‍💼 For Job Seekers

-   **User Authentication:** Secure registration and login with JWT.
-   **Profile Management:** Create and manage a detailed profile, including uploading a profile picture and resume (PDF or DOCX).
-   **Job Search and Apply:** Search for jobs with advanced filters and apply with a few clicks.
-   **Application Tracking:** Keep track of all job applications in one place.
-   **Real-time Notifications:** Receive instant notifications for application status updates and messages from employers.

### 🏢 For Employers

-   **User Authentication:** Secure registration and login with JWT.
-   **Company Profile:** Create and manage a company profile.
-   **Post and Manage Jobs:** Post new job openings and manage existing ones.
-   **Applicant Tracking System (ATS):** View and manage applications for each job posting.
-   **Applicant Matching:** An intelligent system that suggests the most suitable candidates for a job based on their profile and resume.
-   **Real-time Notifications:** Receive instant notifications for new applications and messages from job seekers.
-   **Payment Integration:** Securely pay for job postings using **Chapa**.

### 👮‍♂️ For Admins

-   **Admin Dashboard:** A separate, feature-rich dashboard to manage the entire platform.
-   **User Management:** View, edit, and delete users (both job seekers and employers).
-   **Job Management:** View, edit, and delete job postings.
-   **System Monitoring:** Monitor system health and user activity.

## 🚀 Technologies Used

### Frontend (Job Seeker & Employer)

-   **Framework:** React (with Vite)
-   **State Management:** Redux Toolkit
-   **Routing:** React Router
-   **Styling:** Material-UI (MUI)
-   **HTTP Client:** Axios
-   **Real-time Communication:** Socket.IO Client
-   **Form Handling:** React Hook Form
-   **Notifications:** React Hot Toast & React Toastify

### Backend

-   **Framework:** Express.js
-   **Database:** MySQL
-   **Authentication:** JWT (JSON Web Tokens) & bcrypt
-   **Real-time Communication:** Socket.IO
-   **File Uploads:** Multer
-   **Payment Gateway:** Chapa
-   **Resume Parsing:** pdf-parse (for PDF) & Mammoth (for DOCX)
-   **Applicant Matching:** `natural` (for Natural Language Processing)
-   **Background Jobs:** Bull
-   **Email Service:** Nodemailer, SendGrid, Resend

### Admin Panel

-   **Frontend:** React (with Vite) & Tailwind CSS
-   **Backend:** Express.js & MySQL

## Project Structure

The project is a monorepo with the following structure:

```
/
├── admin/
│   ├── client/      # Admin panel frontend
│   └── server/      # Admin panel backend
├── backend/         # Main application backend
├── frontend/        # Main application frontend (for job seekers and employers)
...
```

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js and npm (or yarn)
-   MySQL

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/Ethiopian-Job-Search.git
    ```
2.  **Install dependencies for each package**

    -   **Root:**
        ```sh
        cd Ethiopian-Job-Search
        npm install
        ```
    -   **Backend:**
        ```sh
        cd backend
        npm install
        ```
    -   **Frontend:**
        ```sh
        cd ../frontend
        npm install
        ```
    -   **Admin Client:**
        ```sh
        cd ../admin/client
        npm install
        ```
    -   **Admin Server:**
        ```sh
        cd ../admin/server
        npm install
        ```
3.  **Set up environment variables**

    Create a `.env` file in the `backend` and `admin/server` directories and add the necessary environment variables (e.g., database credentials, JWT secret, Chapa API key).

### Running the Application

1.  **Start the backend servers**

    -   **Main Backend:**
        ```sh
        cd backend
        npm run dev
        ```
    -   **Admin Backend:**
        ```sh
        cd ../admin/server
        npm run dev
        ```
2.  **Start the frontend development servers**

    -   **Main Frontend:**
        ```sh
        cd ../frontend
        npm run dev
        ```
    -   **Admin Frontend:**
        ```sh
        cd ../admin/client
        npm run dev
        ```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
