# The Ultimate Guide to Testing the LMS API

Welcome! This guide is your complete, story-driven walkthrough for testing every part of our API. We will follow a full lifecycle: an Admin will set up the system, a Teacher will build a course, a Student will take it, and finally, we'll perform maintenance tasks like updates and deletions.

All you need is an API client like **Postman** or **Hoppscotch**.

### **The Most Important Concept: The "Magic Key" (Authorization Token)**

Most API routes are protected. You need a special "key" (a JWT) to prove who you are. The process is always the same:

1.  **Log In** with a user's `email` and `password` to get a `token`.
2.  **Copy** that token.
3.  For all other protected requests, add it to the **Headers** section:
    - **Key:** `Authorization`
    - **Value:** `Bearer <PASTE_YOUR_TOKEN_HERE>` (The space after `Bearer` is crucial!)

> **Password Note:** The server uses secure password hashing. The placeholder password in the `seed.sql` file won't work. You must first **register** any user via the API to set a real password, then use that password to log in.

## Table of Contents

1.  [**Act I: The Administrator's Setup**](#act-i-the-administrators-setup)
2.  [**Act II: The Teacher's Preparation**](#act-ii-the-teachers-preparation)
3.  [**Act III: The Student's Journey**](#act-iii-the-students-journey)
4.  [**Act IV: Communication and Grading**](#act-iv-communication-and-grading)
5.  [**Epilogue: System Maintenance**](#epilogue-system-maintenance)

---

## **Act I: The Administrator's Setup**

Our story begins with the **Admin**. Their job is to create courses and manage all system users.

### **Step 1: Log in as an Admin**

We need the Admin's magic key to get started.

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/login`
- **Body** (raw, JSON): `{ "email": "admin@example.com", "password": "your_admin_password" }`

✅ **Response:** You will get a `token`. **ACTION: COPY THIS TOKEN! This is your ADMIN KEY.**

### **Step 2: Create and Manage Users**

The Admin needs to prepare the users for our story.

1.  **Register a Teacher** (Public Route)

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/auth/register`
    - **Body:** `{ "name": "Prof. Ada Lovelace", "email": "ada.lovelace@example.com", "password": "iamateacher", "role": "teacher" }`
      ✅ **Response:** Note the new user ID (e.g., `7`).

2.  **Register a Student** (Public Route)

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/auth/register`
    - **Body:** `{ "name": "Charlie Coder", "email": "charlie.coder@example.com", "password": "iamastudent", "role": "student" }`
      ✅ **Response:** Note the new user ID (e.g., `8`).

3.  **List All Users** (Admin Only)

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/admin/users`
    - **Headers:** Use your **Admin Key**.
      ✅ **Response:** A list of all users, including the two we just created.

4.  **List Pending Users** (Admin Only)

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/admin/users/pending`
    - **Headers:** Use your **Admin Key**.
      ✅ **Response:** You will see both `Prof. Ada Lovelace` and `Charlie Coder` here because they are not yet approved.

5.  **Approve Both Users** (Admin Only)
    - **Method:** `PATCH`
    - **URL 1:** `http://localhost:3001/api/admin/users/7/approve` (Use Ada's ID)
    - **URL 2:** `http://localhost:3001/api/admin/users/8/approve` (Use Charlie's ID)
    - **Headers:** Use your **Admin Key** for both requests.
      ✅ **Response:** You'll get a success message for each.

### **Step 3: Create and Manage the Course**

1.  **Create the Course** (Admin Only)

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/courses`
    - **Headers:** Use your **Admin Key**.
    - **Body:** `{ "title": "Data Structures in Practice", "description": "From arrays to hashmaps, a practical guide." }`
      ✅ **Response:** Note the new course `id` (e.g., `104`). **We will use `104` for the rest of this guide.**

2.  **Assign Teacher to Course** (Admin Only)
    > This step populates the `teachers_courses` junction table.
    - **Method:** `POST`, **URL:** `http://localhost:3001/api/courses/104/teachers`
    - **Headers:** Use your **Admin Key**.
    - **Body:** `{ "teacherId": 7 }` (Use Ada's ID)
      ✅ **Response:** A success message.

---

## **Act II: The Teacher's Preparation**

We are now **Prof. Ada Lovelace**. Her job is to build out the "Data Structures in Practice" course.

### **Step 1: Log in as the Teacher**

- **Method:** `POST`, **URL:** `http://localhost:3001/api/auth/login`
- **Body:** `{ "email": "ada.lovelace@example.com", "password": "iamateacher" }`
  ✅ **Response:** You'll get a new `token`. **ACTION: COPY THIS TOKEN! This is your TEACHER KEY.**

### **Step 2: Verify and Manage Course Content**

1.  **List My Assigned Courses**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/courses/my`
    - **Headers:** Use your **Teacher Key**.
      ✅ **Response:** You will see course `104`.

2.  **Add Course Material**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/courses/104/materials`
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "title": "Lecture 1 - Arrays.pdf", "file_path": "/uploads/arrays.pdf" }`
      ✅ **Response:** Note the new material `id` (e.g., `5`).

3.  **Oops, Uploaded Wrong File! Delete the Material**

    - **Method:** `DELETE`, **URL:** `http://localhost:3001/api/materials/5` (Use the material ID)
    - **Headers:** Use your **Teacher Key**.
      ✅ **Response:** A success message.

4.  **Add Correct Material**
    - **Method:** `POST`, **URL:** `http://localhost:3001/api/courses/104/materials`
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "title": "Lecture 1 - Linked Lists.pdf", "file_path": "/uploads/linked_lists.pdf" }`
      ✅ **Response:** Note the new material `id` (e.g., `6`).

### **Step 3: Create, Update, and Populate a Test**

1.  **Create a New Test**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/courses/104/tests`
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "title": "Quiz 1: Linear Datastructures" }`
      ✅ **Response:** Note the new test `id` (e.g., `203`).

2.  **Fix a Typo in the Test Title**

    - **Method:** `PUT`, **URL:** `http://localhost:3001/api/tests/203` (Use the test ID)
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "title": "Quiz 1: Linear Data Structures" }`
      ✅ **Response:** A success message.

3.  **Add Questions to the Test**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/tests/203/questions`
    - **Headers:** Use your **Teacher Key**.
    - **Body 1:** `{ "question_text": "What is the time complexity for accessing an element in a hash map?", "question_type": "single_choice", "points": 10 }` (Note the ID, e.g., `304`)
    - **Body 2:** `{ "question_text": "Which data structure uses a LIFO approach?", "question_type": "single_choice", "points": 10 }` (Note the ID, e.g., `305`)

4.  **Add Options for the Questions**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/questions/305/options` (For the LIFO question)
    - **Headers:** Use your **Teacher Key**.
    - **Body 1:** `{ "option_text": "Queue", "is_correct": false }`
    - **Body 2:** `{ "option_text": "Stack", "is_correct": true }`

5.  **List All Questions for the Test**
    - **Method:** `GET`, **URL:** `http://localhost:3001/api/tests/203/questions`
    - **Headers:** Use your **Teacher Key**.
      ✅ **Response:** You will see the two questions you added.

---

## **Act III: The Student's Journey**

We are now **Charlie Coder**, an approved student.

### **Step 1: Log in as the Student**

- **Method:** `POST`, **URL:** `http://localhost:3001/api/auth/login`
- **Body:** `{ "email": "charlie.coder@example.com", "password": "iamastudent" }`
  ✅ **Response:** You'll get a new `token`. **ACTION: COPY THIS TOKEN! This is your STUDENT KEY.**

### **Step 2: Explore and Enroll**

1.  **List All Available Courses**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/courses`
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** You'll see a list of all courses, including course `104`.

2.  **Enroll in the Course**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/enrollments`
    - **Headers:** Use your **Student Key**.
    - **Body:** `{ "courseId": 104 }`
      ✅ **Response:** A success message.

3.  **View My Enrolled Courses**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/enrollments/my`
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** You will see course `104`.

4.  **View Course Details (Materials & Tests)**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/courses/104/details`
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** You'll see the course info, along with the "Linked Lists" material and "Quiz 1".

5.  **Download a Material File**
    - **Method:** `GET`, **URL:** `http://localhost:3001/api/materials/6/download` (Use the material ID)
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** A message simulating a file download.

### **Step 3: Take the Test and Review**

1.  **Submit the Test**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/tests/203/submit`
    - **Headers:** Use your **Student Key**.
    - **Body:** `{ "answers": [{ "questionId": 305, "selectedOptionId": 11 }] }` (Assuming the 'Stack' option ID is 11)
      ✅ **Response:** Note the new `submissionId` (e.g., `402`).

2.  **List All My Submissions**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/submissions/my`
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** You'll see a list containing your submission for Quiz 1.

3.  **View a Specific Submission**
    - **Method:** `GET`, **URL:** `http://localhost:3001/api/submissions/402` (Use your submission ID)
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** Detailed info about your submission.

---

## **Act IV: Communication and Grading**

This Act involves both the Teacher and the Student.

### **Step 1: Student Seeks Clarification**

1.  **Student Asks a Doubt**

    - **Method:** `POST`, **URL:** `http://localhost:3001/api/doubts`
    - **Headers:** Use your **Student Key**.
    - **Body:** `{ "courseId": 104, "doubtText": "What happens if a hash map has a collision?" }`
      ✅ **Response:** Note the new doubt `id` (e.g., `4`).

2.  **Student Checks Their Doubts**
    - **Method:** `GET`, **URL:** `http://localhost:3001/api/doubts/my`
    - **Headers:** Use your **Student Key**.
      ✅ **Response:** You'll see your question with a `pending` status.

### **Step 2: Teacher Responds and Grades**

1.  **Teacher Logs In** (Use your **Teacher Key**)

2.  **Teacher Views Pending Doubts**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/doubts/pending`
    - **Headers:** Use your **Teacher Key**.
      ✅ **Response:** You will see Charlie's question.

3.  **Teacher Answers the Doubt**

    - **Method:** `PATCH`, **URL:** `http://localhost:3001/api/doubts/4/answer` (Use the doubt ID)
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "answerText": "Excellent question. The hash map uses a secondary data structure, often a linked list, at the collision index to store all colliding values." }`
      ✅ **Response:** A success message.

4.  **Teacher Views Test Results**

    - **Method:** `GET`, **URL:** `http://localhost:3001/api/tests/203/results`
    - **Headers:** Use your **Teacher Key**.
      ✅ **Response:** You'll see Charlie's submission, likely with a `null` score.

5.  **Teacher Grades the Submission**
    - **Method:** `POST`, **URL:** `http://localhost:3001/api/tests/203/grade`
    - **Headers:** Use your **Teacher Key**.
    - **Body:** `{ "submissionId": 402, "score": 10 }`
      ✅ **Response:** A success message.

---

## **Epilogue: System Maintenance**

The course is over. The Admin performs cleanup tasks.

### **Step 1: Log in as the Admin**

Use your **Admin Key** for all steps in this section.

### **Step 2: Delete a User**

A temporary user account is no longer needed.

- **Method:** `DELETE`, **URL:** `http://localhost:3001/api/users/9` (Assuming you have a user with ID 9)
- **Headers:** Use your **Admin Key**.
  ✅ **Response:** A success message.

### **Step 3: Delete the Course**

The course is outdated and needs to be removed. This will trigger a **cascading delete** in the database, removing all related materials, tests, questions, enrollments, etc. This is a powerful and destructive action.

- **Method:** `DELETE`, **URL:** `http://localhost:3001/api/courses/104`
- **Headers:** Use your **Admin Key**.
  ✅ **Response:** `{ "message": "Course 104 deleted. Cascading deletes handled by DB." }`

## Congratulations!

You have now journeyed through the entire API, from creation to cleanup. You've seen how `POST` creates data, `GET` retrieves it, `PUT`/`PATCH` updates it, and `DELETE` removes it, all while respecting user roles and permissions. You are now fully equipped to test, use, and understand this system.
