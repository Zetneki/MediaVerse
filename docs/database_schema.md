# Database Schema

## Overview

The application uses PostgreSQL as its primary database management system.

The database is responsible for:

- user management,
- media caching,
- progress tracking,
- quest management,
- reviews,
- theme customization.

The complete SQL schema is available in `database_schema.sql`.

---

# Main Entity Groups

## User Management

- `user_profile`
- `user_themes`
- `user_activity`

These tables handle authentication, wallet integration, themes, and user activity tracking.

---

## Media Cache

- `movie_cache`
- `series_cache`
- `movie_page_cache`
- `series_page_cache`
- `genre_cache`

These tables cache TMDB API responses to reduce external API calls and improve performance.

---

## Progress Tracking

- `user_movie_progress`
- `user_series_progress`

These tables store the watched progress and status of media content.

---

## Quest System

- `quest_definitions`
- `user_quest_slots`
- `user_quest_content`
- `user_quest_reroll_cooldown`

These tables implement the gamified quest and reward system.

---

## Reviews

- `user_reviews`

Stores user ratings and written reviews for media content.

---

# Relationships

The schema heavily relies on foreign key constraints to maintain data consistency between users, progress tracking, reviews, and quests.

---

# Trigger Functions

The database contains automatic trigger logic for assigning default themes after user registration.
