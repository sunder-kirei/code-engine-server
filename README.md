# 🚀 **Code Engine Server**

An online code execution engine designed to run C++, C, Python, and JavaScript code securely and efficiently. The server uses **Express.js** for the API, **Kafka** for message queuing, **Redis** for caching, **Prisma** for database management, and **IOI/Isolate** for secure sandboxing. It supports both development and production environments using **Docker Compose**.

---

### ⚙️ **Features**

- 🔄 **Asynchronous Code Execution** using Kafka for efficient message queuing.
- 🔒 **Secure Sandboxing** via [IOI/Isolate](https://github.com/ioi/isolate).
- 🧑‍💻 **Supports C, C++, Python, and JavaScript**.
- 🚀 **Multiple Workers** for concurrent code execution.
- 🛡️ **JWT Authentication** for secure API access.
- 🗃️ **Redis Caching** for improved response times.
- ✅ **Validation** using Zod.
- 🐳 **Docker Compose** setup for both production and development.
- 🔑 All environment variables are strongly typed using `env.d.ts` (located inside `worker/`).

---

### 📁 **Project Structure**

```
code-engine-server/
│
├── server/                  # Express.js API server
│   ├── Dockerfile           # Server Dockerfile
│   ├── src/                 # Server source code
│   ├── env.d.ts             # Environment variable definitions
│   └── ...
│
├── worker/                  # Code execution workers
│   ├── Dockerfile           # Worker Dockerfile
│   ├── src/                 # Worker logic for running code
│   ├── env.d.ts             # Worker-specific environment variables
│   └── ...
│
├── docker-compose.yml       # Production Docker Compose setup
├── docker-compose-dev.yml   # Development Docker Compose setup
├── README.md
└── .gitignore
```

---

### 🔧 **Setup Instructions**

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/sunder-kirei/code-engine-server.git
cd code-engine-server
```

#### 2️⃣ **Configure Environment Variables**

Update the `env.d.ts` files inside both `server/` and `worker/` directories.

#### 3️⃣ **Start Services with Docker Compose**

##### 🛠️ Development

```bash
docker-compose -f docker-compose-dev.yml up --build
```

##### 🚀 Production

```bash
docker-compose -f docker-compose.yml up -d
```

#### 4️⃣ **Run Prisma Migrations**

```bash
npx prisma migrate deploy
```

---

### 📬 **API Endpoints**

| Method | Endpoint           | Description                | Auth |
| ------ | ------------------ | -------------------------- | ---- |
| POST   | `/api/execute`     | Submit code for execution  | ✅   |
| GET    | `/api/execute`     | Retrieve all executions    | ✅   |
| GET    | `/api/execute/:id` | Get execution status by ID | ✅   |
| GET    | `/api/user`        | Get user information       | ✅   |
| POST   | `/api/signup`      | User signup                | ❌   |
| POST   | `/api/login`       | User login                 | ❌   |

---

### 🔐 **Security & Validation**

- 🔍 **Zod** for strict input validation.
- 🔑 **JWT** for secure token-based authentication.
- 🛡️ **IOI/Isolate** for isolated, sandboxed execution.

---

### 📦 **Built With**

- **[Express.js](https://expressjs.com/)** – Backend server framework
- **[Kafka](https://kafka.apache.org/)** – Distributed message queue
- **[Redis](https://redis.io/)** – In-memory cache
- **[Prisma](https://www.prisma.io/)** – Database ORM
- **[IOI/Isolate](https://github.com/ioi/isolate)** – Secure code sandboxing
- **[Zod](https://zod.dev/)** – Input validation
- **[JWT](https://jwt.io/)** – Token authentication

---

### 🧑‍💻 **Contributing**

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m "Add awesome feature"`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a pull request.

---

### 📝 **License**

This project is licensed under the [MIT License](LICENSE).

---

### 💬 **Contact**

- **Sunder Kumar** – [LinkedIn](https://www.linkedin.com/in/sunder-kirei/) • [GitHub](https://github.com/sunder-kirei)

---

### Medium Article

[Building a Scalable Online Code Execution Engine with Kafka and ioi/isolate](https://medium.com/@sunder-kirei/building-a-scalable-online-code-execution-engine-with-kafka-and-ioi-isolate-c2a364b09abe)
