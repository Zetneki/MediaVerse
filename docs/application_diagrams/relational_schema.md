# Tables

UserProfile(**id**, username, password_hash, wallet_address, wallet_verified, active_theme, active_dark_light_mode, created_at)

UserThemes(**id**, user_id (FK → UserProfile.id), name, created_at)

UserActivity(**id**, user_id (FK → UserProfile.id), activity_date, activity_count)

UserReviews(**id**, user_id (FK → UserProfile.id), content_id, content_type, score, review, reviewed_at)

UserMovieProgress(**user_id** (FK → UserProfile.id), **movie_id** (FK → MovieCache.id), status, last_watched)

UserSeriesProgress(**user_id** (FK → UserProfile.id), **series_id** (FK → SeriesCache.id), current_season, current_episode, status, last_watched)

MovieCache(**id**, title, overview, release_date, poster_path, backdrops, trailer, vote_average, genres, popularity, runtime, homepage, similar_movies, last_updated)

SeriesCache(**id**, name, overview, first_air_date, poster_path, backdrops, trailer, vote_average, genres, popularity, total_seasons, total_episodes, seasons, homepage, similar_series, last_updated)

QuestDefinitions(**id**, title, description, requirement_type, requirement_count, content_type, genre_filter, reward_tokens, is_active, created_at)

UserQuestSlots(**id**, user_id (FK → UserProfile.id), quest_id (FK → QuestDefinitions.id), slot_number, current_progress, required_progress, is_completed, is_claimed, started_at, completed_at, claimed_at)

UserQuestContent(**id**, user_id (FK → UserProfile.id), quest_slot_id (FK → UserQuestSlots.id), content_type, content_id, counted_at)

UserQuestRerollCooldown(**user_id** (FK → UserProfile.id), last_reroll_at, next_reroll_available_at)

## Cache Tables

MoviePageCache(**page**, **category**, movie_ids, total_results, last_updated)

SeriesPageCache(**page**, **category**, series_ids, total_results, last_updated)

GenreCache(**source**, **id**, name, last_updated)

### <ins>Legends</ins>

Bold - Primary Key  
FK - Foreign Key
