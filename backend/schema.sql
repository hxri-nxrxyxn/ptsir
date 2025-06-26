-- Drop tables in reverse order of creation to avoid foreign key constraint errors
DROP TABLE IF EXISTS `submission_answers`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `doubts`;
DROP TABLE IF EXISTS `question_options`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `tests`;
DROP TABLE IF EXISTS `materials`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `teachers_courses`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;

-- -----------------------------------------------------
-- Table `users`
-- Stores all users, regardless of role.
-- -----------------------------------------------------
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  `is_approved` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table `courses`
-- Stores course information. Created by admins.
-- -----------------------------------------------------
CREATE TABLE `courses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_by_user_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table `teachers_courses` (Junction Table)
-- Assigns teachers to manage specific courses.
-- -----------------------------------------------------
CREATE TABLE `teachers_courses` (
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `enrollments` (Junction Table)
-- Enrolls students in courses.
-- -----------------------------------------------------
CREATE TABLE `enrollments` (
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `materials`
-- Stores course materials like PDFs, ZIPs, etc.
-- -----------------------------------------------------
CREATE TABLE `materials` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `created_by_user_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table `tests`
-- Stores tests associated with a course.
-- -----------------------------------------------------
CREATE TABLE `tests` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `created_by_user_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table `questions`
-- Stores questions for a specific test.
-- -----------------------------------------------------
CREATE TABLE `questions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `test_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('single_choice', 'multiple_choice', 'text') NOT NULL DEFAULT 'single_choice',
  `points` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `question_options`
-- Stores the possible answers for a multiple/single choice question.
-- -----------------------------------------------------
CREATE TABLE `question_options` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `question_id` INT NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `doubts`
-- Allows students to ask questions about courses or tests.
-- -----------------------------------------------------
CREATE TABLE `doubts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `test_id` INT,
  `doubt_text` TEXT NOT NULL,
  `answer_text` TEXT,
  `status` ENUM('pending', 'answered', 'closed') NOT NULL DEFAULT 'pending',
  `answered_by_user_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `answered_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`answered_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table `submissions`
-- Records that a student has taken a test.
-- -----------------------------------------------------
CREATE TABLE `submissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `test_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `score` INT,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'submitted',
  FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `submission_answers`
-- Stores the specific answers for a student's submission.
-- -----------------------------------------------------
CREATE TABLE `submission_answers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `submission_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `selected_option_id` INT,
  `text_answer` TEXT,
  FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON DELETE SET NULL
);
