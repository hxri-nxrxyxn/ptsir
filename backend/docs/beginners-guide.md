# A Beginner's Guide to Testing This API

Welcome! If you've got the server running but don't know where to start, you're in the right place. This guide will walk you through testing the API step-by-step, just like you were a real user.

We'll pretend to be three different people:

1.  A **brand new user** who needs to register.
2.  An **Admin** who has to approve the new user.
3.  A **Student** who wants to enroll in a course.

All you need is an API client like **Postman** or **Hoppscotch**.

## The Most Important Concept: The "Magic Key" (Authorization Token)

Many API routes are protected. You can't just access them. You need a special "key" to prove who you are. We get this key by logging in.

Here's the process for almost everything we'll do:

1.  **Log In** to get a `token` (our magic key).
2.  **Copy** that token.
3.  For every other request, we'll add it to the **Headers** section like this:
    - **Key:** `Authorization`
    - **Value:** `Bearer <PASTE_YOUR_TOKEN_HERE>`

The word `Bearer` followed by a space is very important!

Ready? Let's begin!

---

### **Part 1: The New User Experience**

Our first character is **"Charlie"**, a new student who wants to sign up.

#### **Step 1.1: Charlie Registers an Account**

First, Charlie needs to create an account.

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/register`
- Go to the **Body** tab, select **raw**, and choose **JSON**. Paste this in:
  ```json
  {
    "name": "Charlie Brown",
    "email": "charlie.brown@example.com",
    "password": "goodgrief",
    "role": "student"
  }
  ```
- **Action:** Hit **Send**.

✅ **Expected Response (201 Created):**
You should get this back. Notice `is_approved` is `false`. This is important!

```json
{
  "user": {
    "id": 7, // The ID might be different
    "name": "Charlie Brown",
    "email": "charlie.brown@example.com",
    "role": "student",
    "is_approved": false
  }
}
```

---

### **Part 2: The Admin's Job**

Now we need to switch hats. We are now the **System Admin**. Our job is to approve Charlie.

#### **Step 2.1: Log in as an Admin**

We need an admin's magic key. We'll use the admin account from the `seed.sql` file.

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/login`
- **Body** (raw, JSON):

  ```json
  {
    "email": "admin@example.com",
    "password": "your_password_here"
  }
  ```

  > **IMPORTANT NOTE ON PASSWORDS:** The server uses secure hashing. The placeholder password in `seed.sql` won't work. **You must first register the admin user via the API to set a real password**, for example: register `admin@example.com` with password `adminpass`. Then use `adminpass` to log in.

- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**
You'll get a response with a `token`.

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY3ODg5MDAwMCwiZXhwIjoxNjc4OTc2NDAwfQ.very-long-string-of-characters",
    "user": { ... }
}
```

**ACTION: COPY THE `token`! THIS IS YOUR ADMIN MAGIC KEY!**

#### **Step 2.2: Find Pending Users**

Now that we are the admin, let's find users who need to be approved.

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/admin/users/pending`
- Go to the **Headers** tab and add your admin magic key:
  - **Key:** `Authorization`
  - **Value:** `Bearer <PASTE_YOUR_ADMIN_TOKEN_HERE>`
- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**
You should see Charlie in the list!

```json
[
  {
    "id": 7,
    "name": "Charlie Brown",
    "email": "charlie.brown@example.com",
    "role": "student",
    "created_at": "..."
  }
]
```

#### **Step 2.3: Approve Charlie**

Let's approve Charlie's account. Note his `id` from the response above (it's probably 7).

- **Method:** `PATCH`
- **URL:** `http://localhost:3001/api/admin/users/7/approve` (Change `7` if your ID is different)
- **Headers:** Use the same Admin `Authorization` header as the last step.
- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**

```json
{
  "message": "User 7 approved successfully."
}
```

Great! Charlie is now an approved member.

---

### **Part 3: The Student's Journey Begins**

Let's go back to being **Charlie**. He can finally log in and start learning.

#### **Step 3.1: Charlie Logs In (Successfully!)**

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/login`
- **Body** (raw, JSON):
  ```json
  {
    "email": "charlie.brown@example.com",
    "password": "goodgrief"
  }
  ```
- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**
Success! He gets his own token now.

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.another-very-long-string-of-characters",
    "user": { ... }
}
```

**ACTION: COPY THIS NEW `token`! THIS IS CHARLIE'S STUDENT MAGIC KEY!**

#### **Step 3.2: Charlie Views Available Courses**

Charlie wants to see what's on offer.

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/courses`
- **Headers:** Add Charlie's student magic key:
  - **Key:** `Authorization`
  - **Value:** `Bearer <PASTE_CHARLIE'S_STUDENT_TOKEN_HERE>`
- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**
A list of all the courses from your database.

```json
[
  {
    "id": 101,
    "title": "Introduction to Computer Science",
    "description": "Learn the fundamentals of computing, algorithms, and data structures."
  },
  {
    "id": 102,
    "title": "Web Development Basics",
    "description": "An introduction to HTML, CSS, and JavaScript."
  }
]
```

#### **Step 3.3: Charlie Enrolls in a Course**

He decides to take "Web Development Basics" (ID 102).

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/enrollments`
- **Headers:** Use the same Student `Authorization` header.
- **Body** (raw, JSON):
  ```json
  {
    "courseId": 102
  }
  ```
- **Action:** Hit **Send**.

✅ **Expected Response (201 Created):**

```json
{
  "message": "Enrolled successfully."
}
```

#### **Step 3.4: Charlie Checks His Enrolled Courses**

Let's make sure the enrollment worked.

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/enrollments/my`
- **Headers:** Use the same Student `Authorization` header.
- **Action:** Hit **Send**.

✅ **Expected Response (200 OK):**
He should now see the course he just enrolled in!

```json
[
  {
    "id": 102,
    "title": "Web Development Basics",
    "description": "An introduction to HTML, CSS, and JavaScript.",
    "created_by_user_id": 1,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

## Congratulations!

You have successfully completed a full user-flow cycle! You've seen how:

- A user registers and has to wait for approval.
- An admin logs in, uses their special powers to see and approve users.
- An approved student can log in, get their own key, and interact with the system.

From here, you can continue exploring! Try logging in as a Teacher and testing their routes, or see what other information a Student can access. You now have the fundamental skills to test any route in this API. Happy testing
