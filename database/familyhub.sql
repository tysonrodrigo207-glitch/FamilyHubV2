-- =====================================================
-- FAMILY HUB DATABASE
-- Version : 1.0.0
-- Author  : Tyson Rodrigo & Nova
-- Database: familyhub
-- =====================================================

DROP DATABASE IF EXISTS familyhub;
CREATE DATABASE familyhub;
USE familyhub;

-- ===========================
-- USERS
-- ===========================

CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) UNIQUE NOT NULL,

    email VARCHAR(120) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role ENUM(
        'Admin',
        'Moderator',
        'Member'
    ) DEFAULT 'Member',

    profile_picture VARCHAR(255),

    bio TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_seen TIMESTAMP NULL

);

-- ===========================
-- POSTS
-- ===========================

CREATE TABLE posts (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    content TEXT NOT NULL,

    media VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- COMMENTS
-- ===========================

CREATE TABLE comments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    post_id INT NOT NULL,

    user_id INT NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- POST LIKES
-- ===========================

CREATE TABLE post_likes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    post_id INT NOT NULL,

    user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- EVENTS
-- ===========================

CREATE TABLE events (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    location VARCHAR(200),

    event_date DATE NOT NULL,

    event_time TIME,

    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(created_by)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- EVENT RSVP
-- ===========================

CREATE TABLE event_rsvp (

    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT NOT NULL,

    user_id INT NOT NULL,

    status ENUM(
        'Going',
        'Interested',
        'Not Going'
    ) DEFAULT 'Interested',

    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(event_id)
    REFERENCES events(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    UNIQUE(event_id, user_id)

);

-- ===========================
-- CONVERSATIONS
-- ===========================

CREATE TABLE conversations (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150),

    type ENUM(
        'direct',
        'group',
        'announcement'
    ) DEFAULT 'direct',

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(created_by)
    REFERENCES users(id)
    ON DELETE SET NULL

);

-- ===========================
-- CONVERSATION MEMBERS
-- ===========================

CREATE TABLE conversation_members (

    id INT AUTO_INCREMENT PRIMARY KEY,

    conversation_id INT NOT NULL,

    user_id INT NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    UNIQUE(conversation_id, user_id)

);

-- ===========================
-- MESSAGES
-- ===========================

CREATE TABLE messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    conversation_id INT NOT NULL,

    sender_id INT NOT NULL,

    message TEXT NOT NULL,

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,

    FOREIGN KEY(sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- SERVICES
-- ===========================

CREATE TABLE services (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    category VARCHAR(100),

    phone VARCHAR(50),

    email VARCHAR(150),

    website VARCHAR(255),

    location VARCHAR(200),

    description TEXT,

    rating DECIMAL(2,1) DEFAULT 0.0,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(created_by)
    REFERENCES users(id)
    ON DELETE SET NULL

);

-- ===========================
-- FAVOURITE SERVICES
-- ===========================

CREATE TABLE favourite_services (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    service_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY(service_id)
    REFERENCES services(id)
    ON DELETE CASCADE,

    UNIQUE(user_id, service_id)

);

-- ===========================
-- SURVEYS
-- ===========================

CREATE TABLE surveys (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    expiry DATE,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(created_by)
    REFERENCES users(id)
    ON DELETE SET NULL

);

-- ===========================
-- SURVEY OPTIONS
-- ===========================

CREATE TABLE survey_options (

    id INT AUTO_INCREMENT PRIMARY KEY,

    survey_id INT NOT NULL,

    option_text VARCHAR(255),

    FOREIGN KEY(survey_id)
    REFERENCES surveys(id)
    ON DELETE CASCADE

);

-- ===========================
-- SURVEY VOTES
-- ===========================

CREATE TABLE survey_votes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    survey_id INT NOT NULL,

    option_id INT NOT NULL,

    user_id INT NOT NULL,

    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(survey_id)
    REFERENCES surveys(id)
    ON DELETE CASCADE,

    FOREIGN KEY(option_id)
    REFERENCES survey_options(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    UNIQUE(survey_id, user_id)

);

-- ===========================
-- NOTIFICATIONS
-- ===========================

CREATE TABLE notifications (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    title VARCHAR(255),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

-- ===========================
-- DEFAULT ADMIN
-- Password: admin123
-- ===========================

INSERT INTO users(

    full_name,
    username,
    email,
    password,
    role

)

VALUES(

    'Tyson Rodrigo',

    'admin',

    'admin@familyhub.com',

    '$2y$12$njTxPcAeYhpA8q9McQOGJOU3GJpcQd4aXtjTpb1oTgMep3yq3SrTi',

    'Admin'



