## UI Flow for the Learning Management System

This document outlines the user's journey through the web interface, directly corresponding to the "Ultimate Guide to Testing the LMS API". It describes what the user sees, clicks, and experiences on each page.

### **Act I: The Administrator's Setup**

**Persona:** The System Administrator.

1.  **Logging In**
    *   **Page:** `/login` (Login Page)
    *   **User Action:** The Admin enters their email (`admin@example.com`) and password, then clicks the "Login" button.
    *   **Result:** The application validates the credentials. On success, the user is redirected to the Admin Dashboard.

2.  **Managing New Users**
    *   **Page:** `/admin/dashboard` (Admin Dashboard)
    *   **View:** The Admin sees welcome stats and a navigation sidebar with "Dashboard", "User Management", and "Course Management".
    *   **User Action:** Clicks on "User Management" in the sidebar.
    *   **Result:** Navigates to the User Management page.

3.  **Approving Users**
    *   **Page:** `/admin/users` (User Management Page)
    *   **View:** The page displays a table with two tabs: "Pending Approval" (active by default) and "All Users". The "Pending Approval" table shows `Prof. Ada Lovelace` and `Charlie Coder`.
    *   **User Action:** The Admin finds Ada's row and clicks the "Approve" button.
    *   **Result:** A success "toast" notification appears ("User approved!"). Ada's row disappears from the "Pending Approval" list. The Admin repeats this for Charlie.

4.  **Creating a New Course**
    *   **Page:** `/admin/courses` (Course Management Page, accessed from the sidebar)
    *   **View:** The page shows a list of existing courses and a prominent "Create New Course" button.
    *   **User Action:** Clicks "Create New Course".
    *   **Result:** A modal (pop-up form) appears, asking for "Course Title" and "Description".

5.  **Finalizing Course Creation**
    *   **Page:** `/admin/courses` (Course Management Page with open modal)
    *   **User Action:** The Admin fills in "Data Structures in Practice" and its description, then clicks "Save Course".
    *   **Result:** The modal closes. A success toast appears. The new course instantly appears in the list on the main page.

6.  **Assigning a Teacher to the Course**
    *   **Page:** `/admin/courses` (Course Management Page)
    *   **View:** The Admin sees the new course in the list with several action buttons: "Edit", "Delete", and "Manage Teachers".
    *   **User Action:** Clicks "Manage Teachers".
    *   **Result:** Navigates to a new page (`/admin/courses/104/teachers`). This page shows "Currently Assigned: None" and a simple form to "Assign a New Teacher".

7.  **Completing Teacher Assignment**
    *   **Page:** `/admin/courses/104/teachers`
    *   **User Action:** The Admin starts typing "Ada Lovelace" into an autocomplete input field, selects her from the list, and clicks "Assign".
    *   **Result:** A success toast appears. "Prof. Ada Lovelace" now appears in the "Currently Assigned" list on the same page.

---

### **Act II: The Teacher's Preparation**

**Persona:** Prof. Ada Lovelace.

1.  **Logging In & Viewing Dashboard**
    *   **Page:** `/login`
    *   **User Action:** Ada logs in with her credentials.
    *   **Result:** She is redirected to her dashboard.
    *   **Page:** `/teacher/dashboard`
    *   **View:** The page displays a grid of "Course Cards". She sees the "Data Structures in Practice" card.

2.  **Managing a Specific Course**
    *   **User Action:** Clicks on the "Data Structures in Practice" card.
    *   **Result:** Navigates to the detailed course management page.
    *   **Page:** `/teacher/courses/104`
    *   **View:** A page with the course title and a tabbed interface: "Materials", "Tests", "Students", "Doubts". The "Materials" tab is active.

3.  **Adding and Deleting Materials**
    *   **Page:** `/teacher/courses/104` (Materials Tab)
    *   **User Action 1 (Add):** Clicks a "Add New Material" button. A form appears with a file input and a title field. She fills it out and clicks "Upload".
    *   **Result 1:** The new material ("Lecture 1 - Arrays.pdf") appears in the list below.
    *   **User Action 2 (Delete):** She realizes it's the wrong file and clicks the trash can icon next to it.
    *   **Result 2:** A confirmation modal appears: "Are you sure you want to delete this material?". She clicks "Confirm". The material is removed from the list.
    *   **User Action 3 (Add Correct):** She repeats the add process for "Lecture 1 - Linked Lists.pdf".

4.  **Creating and Editing a Test**
    *   **Page:** `/teacher/courses/104`
    *   **User Action:** Clicks the "Tests" tab. The view shows "No tests created yet" and a "Create New Test" button. She clicks it.
    *   **Result:** A modal appears asking for a "Test Title". She enters "Quiz 1: Linear Datastructures" and saves. The new test now appears in a list.
    *   **User Action:** She notices the typo and clicks the "Edit" icon next to the test title.
    *   **Result:** The title becomes an editable input field. She corrects it to "Linear Data Structures" and clicks a checkmark icon to save. The title updates in place.

5.  **Populating the Test with Questions**
    *   **Page:** `/teacher/courses/104` (Tests Tab)
    *   **User Action:** Clicks the "Manage Questions" button next to "Quiz 1".
    *   **Result:** Navigates to the Test Management page.
    *   **Page:** `/teacher/tests/203`
    *   **View:** The page shows the test title, a list of existing questions (currently empty), and an "Add New Question" form.
    *   **User Action:** Fills out the form to add the two questions. For the multiple-choice question, she clicks an "Add Option" button to create input fields for each answer, marking the correct one with a radio button.
    *   **Result:** As she adds each question, it appears in the list above the form.

---

### **Act III: The Student's Journey**

**Persona:** Charlie Coder.

1.  **Logging In & Enrolling**
    *   **Page:** `/login` -> Logs in, is redirected to his dashboard.
    *   **Page:** `/student/dashboard` -> Sees "My Courses" (currently empty) and a large "Browse Course Catalog" button.
    *   **User Action:** Clicks "Browse Course Catalog".
    *   **Page:** `/student/courses` -> Sees a list of all available courses.
    *   **User Action:** Finds "Data Structures in Practice" and clicks the "Enroll" button.
    *   **Result:** The button changes to a disabled "Enrolled" state and a success toast appears.

2.  **Accessing the Course**
    *   **User Action:** Navigates back to his dashboard (via the sidebar).
    *   **Page:** `/student/dashboard`
    *   **View:** The "Data Structures in Practice" card now appears under "My Courses".
    *   **User Action:** Clicks the course card.
    *   **Page:** `/student/courses/104`
    *   **View:** A tabbed interface: "Materials", "Tests", "My Progress", "Ask a Doubt".

3.  **Interacting with Course Content**
    *   **User Action:** Clicks the "Materials" tab. He sees "Lecture 1 - Linked Lists.pdf" and clicks the "Download" button next to it.
    *   **Result:** The browser initiates a file download.
    *   **User Action:** Clicks the "Tests" tab. He sees "Quiz 1: Linear Data Structures" with a "Start Test" button.

4.  **Taking the Test**
    *   **User Action:** Clicks "Start Test".
    *   **Page:** `/student/tests/203`
    *   **View:** A clean interface showing the questions. He selects the radio button for "Stack" and answers the other question.
    *   **User Action:** Clicks the "Submit Test" button at the bottom.
    *   **Result:** A confirmation modal appears: "Are you sure you want to submit?". He clicks "Confirm". He is then redirected back to the course page (`/student/courses/104`), and a success toast appears. The button for Quiz 1 now says "View Results".

---

### **Act IV: Communication and Grading**

**Persona:** A back-and-forth between Charlie and Ada.

1.  **Charlie Asks a Question**
    *   **Page:** `/student/courses/104`
    *   **User Action:** Clicks the "Ask a Doubt" tab. He types his question into a text area and clicks "Submit Doubt".
    *   **Result:** A success toast. His question appears below the form with a "Status: Pending" badge.

2.  **Ada Answers the Question**
    *   **Login:** Ada logs in. Her main navbar has a "Doubts" link with a notification badge (e.g., "Doubts (1)").
    *   **User Action:** She clicks the "Doubts" link.
    *   **Page:** `/teacher/doubts`
    *   **View:** A list of all pending doubts. She sees Charlie's question.
    *   **User Action:** She types her answer into a reply box directly on the doubt card and clicks "Post Answer".
    *   **Result:** The card updates to show the answer and the doubt disappears from this "pending" view.

3.  **Ada Grades the Test**
    *   **Page:** `/teacher/courses/104` -> Clicks "Students" tab.
    *   **User Action:** Finds Charlie's row and clicks "View Submissions". This leads to a page showing all his test results for this course.
    *   **View:** Sees the submission for "Quiz 1" with an empty "Score" input box.
    *   **User Action:** She enters `10` into the score box and clicks "Save Grade".
    *   **Result:** A success toast. The score is saved.

---

### **Epilogue: System Maintenance**

**Persona:** The Admin.

1.  **Logging In & Cleanup**
    *   **Login:** Admin logs in and navigates to the appropriate management page.
    *   **User Deletion:**
        *   **Page:** `/admin/users` -> Clicks the "All Users" tab.
        *   **Action:** Finds the user to be deleted and clicks the trash can icon. A confirmation modal appears. Admin confirms. The user is removed from the list.
    *   **Course Deletion:**
        *   **Page:** `/admin/courses`
        *   **Action:** Finds "Data Structures in Practice" and clicks the "Delete" button.
        *   **Result:** A stern warning modal appears: "Are you sure you want to delete this course? This will permanently remove all associated tests, materials, and student enrollments. This action cannot be undone." Admin confirms. The course is removed from the list.
