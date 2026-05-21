## Project Structure

```text
MediaVerse
├── backend
│   ├── bin
│   │   └── www
│   ├── config
│   │   └── db.js
│   ├── constants
│   │   ├── banned-words.js
│   │   ├── movie-messages.js
│   │   ├── movie-order.js
│   │   ├── movie-sortby.js
│   │   ├── movie-status.js
│   │   ├── review-contenttypes.js
│   │   ├── review-messages.js
│   │   ├── series-messages.js
│   │   ├── series-order.js
│   │   ├── series-sortby.js
│   │   ├── series-status.js
│   │   └── themes.js
│   ├── controllers
│   │   ├── genre.controller.js
│   │   ├── movie-progress.controller.js
│   │   ├── movies.controller.js
│   │   ├── quests.controller.js
│   │   ├── series-progress.controller.js
│   │   ├── series.controller.js
│   │   ├── user-reviews.controller.js
│   │   ├── user-statistics.controller.js
│   │   ├── user-themes.controller.js
│   │   ├── users.controller.js
│   │   └── wallet.controller.js
│   ├── cron
│   │   ├── movie-refresh.cron.js
│   │   ├── series-refresh.cron.js
│   │   └── user-activity.cron.js
│   ├── dao
│   │   ├── genre.dao.js
│   │   ├── movie-progress.dao.js
│   │   ├── movies.dao.js
│   │   ├── quests.dao.js
│   │   ├── series-progress.dao.js
│   │   ├── series.dao.js
│   │   ├── user-activity.dao.js
│   │   ├── user-reviews.dao.js
│   │   ├── user-statistics.dao.js
│   │   ├── user-themes.dao.js
│   │   ├── users.dao.js
│   │   └── wallet.dao.js
│   ├── middlewares
│   │   ├── auth.middleware.js
│   │   ├── check-wallet-balance.middleware.js
│   │   ├── error-handler.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── verify-wallet.middleware.js
│   ├── public
│   │   ├── images
│   │   ├── javascripts
│   │   └── stylesheets
│   │       └── style.css
│   ├── routes
│   │   ├── genre.routes.js
│   │   ├── movie-progress.routes.js
│   │   ├── movies.routes.js
│   │   ├── quests.routes.js
│   │   ├── series-progress.routes.js
│   │   ├── series.routes.js
│   │   ├── user-reviews.routes.js
│   │   ├── user-statistics.routes.js
│   │   ├── user-themes.routes.js
│   │   ├── users.routes.js
│   │   └── wallet.routes.js
│   ├── services
│   │   ├── tmdb
│   │   │   ├── tmdb-genre.service.js
│   │   │   ├── tmdb-movies.service.js
│   │   │   ├── tmdb-series.service.js
│   │   │   └── tmdb.service.js
│   │   ├── blockchain.service.js
│   │   ├── movie-progress.service.js
│   │   ├── quests.service.js
│   │   ├── series-progress.service.js
│   │   ├── user-reviews.service.js
│   │   ├── user-statistics.service.js
│   │   ├── user-themes.service.js
│   │   ├── users.service.js
│   │   └── wallet.service.js
│   ├── tests
│   │   ├── load.test.js
│   │   ├── MediaVerse_API_Test.postman_collection.json
│   │   ├── quests.service.test.js
│   │   ├── summary.json
│   │   └── users.service.test.js
│   ├── utils
│   │   ├── validation
│   │   │   ├── credentials.validator.js
│   │   │   ├── password.validator.js
│   │   │   └── username.validator.js
│   │   ├── cookie-options-helper.util.js
│   │   ├── date.util.js
│   │   ├── error-response.util.js
│   │   ├── jwt.util.js
│   │   ├── password.util.js
│   │   ├── profanity-check.util.js
│   │   └── review.util.js
│   ├── views
│   │   ├── error.jade
│   │   ├── index.jade
│   │   └── layout.jade
│   ├── .env
│   ├── .env.example
│   ├── app.js
│   └── package.json
├── blockchain
│   ├── contracts
│   │   ├── MediaVerseToken.sol
│   │   └── ThemeMarketplace.sol
│   ├── ignition
│   │   ├── deployments
│   │   │   ├── chain-11155111
│   │   │   │   ├── build-info
│   │   │   │   │   └── d32e9841422baac0787cd99e158856da.json
│   │   │   │   ├── deployed_addresses.json
│   │   │   │   └── journal.jsonl
│   │   │   └── chain-1337
│   │   │       ├── build-info
│   │   │       │   └── d32e9841422baac0787cd99e158856da.json
│   │   │       ├── deployed_addresses.json
│   │   │       └── journal.jsonl
│   │   └── modules
│   │       ├── MediaVerseTokenModule.ts
│   │       └── ThemeMarketplaceModule.ts
│   ├── scripts
│   │   ├── fund-backend-wallet.ts
│   │   └── generate-backend-wallet.ts
│   ├── test
│   │   ├── MediaVerseTokenTest.ts
│   │   ├── NetworkComparisonTest.ts
│   │   └── ThemeMarketplaceTest.ts
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── .prettierrc
│   ├── coverage.json
│   ├── hardhat.config.ts
│   ├── package.json
│   ├── setup.txt
│   └── tsconfig.json
├── docs
│   ├── application_diagrams
│   │   ├── application_architecture.png
│   │   ├── application_architecture_white.png
│   │   ├── class.png
│   │   ├── class_white.png
│   │   ├── entity_relationship.png
│   │   ├── entity_relationship_white.png
│   │   ├── gantt_chart.png
│   │   ├── get_popular_movies_sequence.png
│   │   ├── get_popular_movies_sequence_white.png
│   │   ├── package.png
│   │   ├── package_white.png
│   │   ├── relational_schema.md
│   │   ├── use_case.png
│   │   └── use_case_white.png
│   ├── blockchain_network_test_diagrams
│   │   ├── data.png
│   │   ├── data_white.png
│   │   ├── gas_estimate_comparison.png
│   │   ├── gas_estimate_comparison_white.png
│   │   ├── latency_standard_deviation.png
│   │   ├── latency_standard_deviation_white.png
│   │   ├── read_latency_measurement.png
│   │   └── read_latency_measurement_white.png
│   ├── performance_test_diagrams
│   │   ├── average_response_time_per_endpoint_group.png
│   │   ├── average_response_time_per_endpoint_group_white.png
│   │   ├── normal_and_blockchain_response_time_comparison.png
│   │   ├── normal_and_blockchain_response_time_comparison_white.png
│   │   ├── requests_per_second_by_group.png
│   │   └── requests_per_second_by_group_white.png
│   ├── wireframes
│   │   ├── details_page.png
│   │   ├── discover_page.png
│   │   ├── home_page.png
│   │   ├── login.png
│   │   ├── my_links.png
│   │   ├── profile.png
│   │   ├── profile_password_change.png
│   │   ├── profile_username_change.png
│   │   └── quests_page.png
│   ├── blockchain_setup.md
│   ├── database_schema.md
│   ├── database_schema.sql
│   ├── gantt_chart.xlsx
│   ├── requirements.md
│   ├── segitseg.txt
│   ├── tests.md
│   ├── thesis.pdf
│   └── thesis_proposal.pdf
├── frontend
│   └── media-verse
│       ├── public
│       │   ├── assets
│       │   │   ├── models
│       │   │   │   ├── christmas.glb
│       │   │   │   ├── cyberpunk.glb
│       │   │   │   ├── halloween.glb
│       │   │   │   ├── neon.glb
│       │   │   │   └── tv.glb
│       │   │   ├── banner.jpg
│       │   │   ├── banner.webp
│       │   │   ├── banner1.jpg
│       │   │   ├── christmas-lights.png
│       │   │   ├── christmas.png
│       │   │   ├── cyberpunk.png
│       │   │   ├── halloween-string.png
│       │   │   ├── halloween.png
│       │   │   ├── library-login-required.png
│       │   │   ├── logo-1.png
│       │   │   ├── logo.png
│       │   │   ├── metamask.png
│       │   │   ├── neon.png
│       │   │   ├── neon_1.png
│       │   │   ├── open-library-logo.webp
│       │   │   ├── page-not-found.png
│       │   │   ├── rawg-logo.png
│       │   │   ├── rawg-logo1.png
│       │   │   ├── tmdb-logo.svg
│       │   │   └── tmdb_no_img.png
│       │   ├── icons
│       │   └── favicon.ico
│       ├── src
│       │   ├── app
│       │   │   ├── components
│       │   │   │   ├── add-movie-to-library
│       │   │   │   │   ├── add-movie-to-library.component.html
│       │   │   │   │   ├── add-movie-to-library.component.scss
│       │   │   │   │   ├── add-movie-to-library.component.spec.ts
│       │   │   │   │   └── add-movie-to-library.component.ts
│       │   │   │   ├── add-series-to-library
│       │   │   │   │   ├── add-series-to-library.component.html
│       │   │   │   │   ├── add-series-to-library.component.scss
│       │   │   │   │   ├── add-series-to-library.component.spec.ts
│       │   │   │   │   └── add-series-to-library.component.ts
│       │   │   │   ├── content-statistics
│       │   │   │   │   ├── content-statistics.component.html
│       │   │   │   │   ├── content-statistics.component.scss
│       │   │   │   │   ├── content-statistics.component.spec.ts
│       │   │   │   │   └── content-statistics.component.ts
│       │   │   │   ├── demo-marquee
│       │   │   │   │   ├── demo-marquee.component.html
│       │   │   │   │   ├── demo-marquee.component.scss
│       │   │   │   │   ├── demo-marquee.component.spec.ts
│       │   │   │   │   └── demo-marquee.component.ts
│       │   │   │   ├── detail-reviews
│       │   │   │   │   ├── detail-reviews.component.html
│       │   │   │   │   ├── detail-reviews.component.scss
│       │   │   │   │   ├── detail-reviews.component.spec.ts
│       │   │   │   │   └── detail-reviews.component.ts
│       │   │   │   ├── discover-dropdown
│       │   │   │   │   ├── discover-dropdown.component.html
│       │   │   │   │   ├── discover-dropdown.component.scss
│       │   │   │   │   ├── discover-dropdown.component.spec.ts
│       │   │   │   │   └── discover-dropdown.component.ts
│       │   │   │   ├── filter
│       │   │   │   │   ├── filter.component.html
│       │   │   │   │   ├── filter.component.scss
│       │   │   │   │   ├── filter.component.spec.ts
│       │   │   │   │   └── filter.component.ts
│       │   │   │   ├── footer-desktop
│       │   │   │   │   ├── footer-desktop.component.html
│       │   │   │   │   ├── footer-desktop.component.scss
│       │   │   │   │   ├── footer-desktop.component.spec.ts
│       │   │   │   │   └── footer-desktop.component.ts
│       │   │   │   ├── footer-mobile
│       │   │   │   │   ├── footer-mobile.component.html
│       │   │   │   │   ├── footer-mobile.component.scss
│       │   │   │   │   ├── footer-mobile.component.spec.ts
│       │   │   │   │   └── footer-mobile.component.ts
│       │   │   │   ├── galleria
│       │   │   │   │   ├── galleria.component.html
│       │   │   │   │   ├── galleria.component.scss
│       │   │   │   │   ├── galleria.component.spec.ts
│       │   │   │   │   └── galleria.component.ts
│       │   │   │   ├── header
│       │   │   │   │   ├── header.component.html
│       │   │   │   │   ├── header.component.scss
│       │   │   │   │   ├── header.component.spec.ts
│       │   │   │   │   └── header.component.ts
│       │   │   │   ├── movie-card
│       │   │   │   │   ├── movie-card.component.html
│       │   │   │   │   ├── movie-card.component.scss
│       │   │   │   │   ├── movie-card.component.spec.ts
│       │   │   │   │   └── movie-card.component.ts
│       │   │   │   ├── plus-episode-button
│       │   │   │   │   ├── plus-episode-button.component.html
│       │   │   │   │   ├── plus-episode-button.component.scss
│       │   │   │   │   ├── plus-episode-button.component.spec.ts
│       │   │   │   │   └── plus-episode-button.component.ts
│       │   │   │   ├── profile-reviews
│       │   │   │   │   ├── profile-reviews.component.html
│       │   │   │   │   ├── profile-reviews.component.scss
│       │   │   │   │   ├── profile-reviews.component.spec.ts
│       │   │   │   │   └── profile-reviews.component.ts
│       │   │   │   ├── quest
│       │   │   │   │   ├── quest.component.html
│       │   │   │   │   ├── quest.component.scss
│       │   │   │   │   ├── quest.component.spec.ts
│       │   │   │   │   └── quest.component.ts
│       │   │   │   ├── series-card
│       │   │   │   │   ├── series-card.component.html
│       │   │   │   │   ├── series-card.component.scss
│       │   │   │   │   ├── series-card.component.spec.ts
│       │   │   │   │   └── series-card.component.ts
│       │   │   │   ├── sidebar
│       │   │   │   │   ├── sidebar.component.html
│       │   │   │   │   ├── sidebar.component.scss
│       │   │   │   │   ├── sidebar.component.spec.ts
│       │   │   │   │   └── sidebar.component.ts
│       │   │   │   ├── skeleton-card
│       │   │   │   │   ├── skeleton-card.component.html
│       │   │   │   │   ├── skeleton-card.component.scss
│       │   │   │   │   ├── skeleton-card.component.spec.ts
│       │   │   │   │   └── skeleton-card.component.ts
│       │   │   │   ├── skeleton-details
│       │   │   │   │   ├── skeleton-details.component.html
│       │   │   │   │   ├── skeleton-details.component.scss
│       │   │   │   │   ├── skeleton-details.component.spec.ts
│       │   │   │   │   └── skeleton-details.component.ts
│       │   │   │   ├── skeleton-quest
│       │   │   │   │   ├── skeleton-quest.component.html
│       │   │   │   │   ├── skeleton-quest.component.scss
│       │   │   │   │   ├── skeleton-quest.component.spec.ts
│       │   │   │   │   └── skeleton-quest.component.ts
│       │   │   │   ├── theme-card
│       │   │   │   │   ├── theme-card.component.html
│       │   │   │   │   ├── theme-card.component.scss
│       │   │   │   │   ├── theme-card.component.spec.ts
│       │   │   │   │   └── theme-card.component.ts
│       │   │   │   ├── toast
│       │   │   │   │   ├── toast.component.html
│       │   │   │   │   ├── toast.component.scss
│       │   │   │   │   ├── toast.component.spec.ts
│       │   │   │   │   └── toast.component.ts
│       │   │   │   ├── trailer
│       │   │   │   │   ├── trailer.component.html
│       │   │   │   │   ├── trailer.component.scss
│       │   │   │   │   ├── trailer.component.spec.ts
│       │   │   │   │   └── trailer.component.ts
│       │   │   │   ├── user-activity
│       │   │   │   │   ├── user-activity.component.html
│       │   │   │   │   ├── user-activity.component.scss
│       │   │   │   │   ├── user-activity.component.spec.ts
│       │   │   │   │   └── user-activity.component.ts
│       │   │   │   └── write-review
│       │   │   │       ├── write-review.component.html
│       │   │   │       ├── write-review.component.scss
│       │   │   │       ├── write-review.component.spec.ts
│       │   │   │       └── write-review.component.ts
│       │   │   ├── directives
│       │   │   │   ├── dragscroll.directive.spec.ts
│       │   │   │   └── dragscroll.directive.ts
│       │   │   ├── guards
│       │   │   │   ├── auth.guard.spec.ts
│       │   │   │   ├── auth.guard.ts
│       │   │   │   ├── public.guard.spec.ts
│       │   │   │   └── public.guard.ts
│       │   │   ├── interceptors
│       │   │   │   ├── auth.interceptor.spec.ts
│       │   │   │   ├── auth.interceptor.ts
│       │   │   │   ├── global-error.interceptor.spec.ts
│       │   │   │   ├── global-error.interceptor.ts
│       │   │   │   ├── rate-limit.interceptor.spec.ts
│       │   │   │   └── rate-limit.interceptor.ts
│       │   │   ├── models
│       │   │   │   ├── claimquestresponse.ts
│       │   │   │   ├── detailreview.ts
│       │   │   │   ├── detailreviewsresponse.ts
│       │   │   │   ├── genre.ts
│       │   │   │   ├── genresstats.ts
│       │   │   │   ├── loginresponse.ts
│       │   │   │   ├── movie.ts
│       │   │   │   ├── moviedetails.ts
│       │   │   │   ├── movieprogress.ts
│       │   │   │   ├── movieprogressresponse.ts
│       │   │   │   ├── moviesresponse.ts
│       │   │   │   ├── profilereview.ts
│       │   │   │   ├── profilereviewsresponse.ts
│       │   │   │   ├── progressfilters.ts
│       │   │   │   ├── quest.ts
│       │   │   │   ├── questsresponse.ts
│       │   │   │   ├── seasondetails.ts
│       │   │   │   ├── selectoption.ts
│       │   │   │   ├── series.ts
│       │   │   │   ├── seriesdetails.ts
│       │   │   │   ├── seriesprogress.ts
│       │   │   │   ├── seriesprogressresponse.ts
│       │   │   │   ├── seriesresponse.ts
│       │   │   │   ├── sortbyoption.ts
│       │   │   │   ├── statusstat.ts
│       │   │   │   ├── user.ts
│       │   │   │   ├── useractivity.ts
│       │   │   │   ├── userreview.ts
│       │   │   │   └── usertheme.ts
│       │   │   ├── pages
│       │   │   │   ├── about
│       │   │   │   │   ├── about.component.html
│       │   │   │   │   ├── about.component.scss
│       │   │   │   │   ├── about.component.spec.ts
│       │   │   │   │   └── about.component.ts
│       │   │   │   ├── discover
│       │   │   │   │   ├── discover.component.html
│       │   │   │   │   ├── discover.component.scss
│       │   │   │   │   ├── discover.component.spec.ts
│       │   │   │   │   └── discover.component.ts
│       │   │   │   ├── home
│       │   │   │   │   ├── home.component.html
│       │   │   │   │   ├── home.component.scss
│       │   │   │   │   ├── home.component.spec.ts
│       │   │   │   │   └── home.component.ts
│       │   │   │   ├── library
│       │   │   │   │   ├── library.component.html
│       │   │   │   │   ├── library.component.scss
│       │   │   │   │   ├── library.component.spec.ts
│       │   │   │   │   └── library.component.ts
│       │   │   │   ├── login
│       │   │   │   │   ├── login.component.html
│       │   │   │   │   ├── login.component.scss
│       │   │   │   │   ├── login.component.spec.ts
│       │   │   │   │   └── login.component.ts
│       │   │   │   ├── movie-detail
│       │   │   │   │   ├── movie-detail.component.html
│       │   │   │   │   ├── movie-detail.component.scss
│       │   │   │   │   ├── movie-detail.component.spec.ts
│       │   │   │   │   └── movie-detail.component.ts
│       │   │   │   ├── page-not-found
│       │   │   │   │   ├── page-not-found.component.html
│       │   │   │   │   ├── page-not-found.component.scss
│       │   │   │   │   ├── page-not-found.component.spec.ts
│       │   │   │   │   └── page-not-found.component.ts
│       │   │   │   ├── profile
│       │   │   │   │   ├── profile.component.html
│       │   │   │   │   ├── profile.component.scss
│       │   │   │   │   ├── profile.component.spec.ts
│       │   │   │   │   └── profile.component.ts
│       │   │   │   ├── quests
│       │   │   │   │   ├── quests.component.html
│       │   │   │   │   ├── quests.component.scss
│       │   │   │   │   ├── quests.component.spec.ts
│       │   │   │   │   └── quests.component.ts
│       │   │   │   ├── registration
│       │   │   │   │   ├── registration.component.html
│       │   │   │   │   ├── registration.component.scss
│       │   │   │   │   ├── registration.component.spec.ts
│       │   │   │   │   └── registration.component.ts
│       │   │   │   └── series-detail
│       │   │   │       ├── series-detail.component.html
│       │   │   │       ├── series-detail.component.scss
│       │   │   │       ├── series-detail.component.spec.ts
│       │   │   │       └── series-detail.component.ts
│       │   │   ├── pipes
│       │   │   │   ├── capitalize.pipe.spec.ts
│       │   │   │   ├── capitalize.pipe.ts
│       │   │   │   ├── safe-html.pipe.spec.ts
│       │   │   │   ├── safe-html.pipe.ts
│       │   │   │   ├── truncate.pipe.spec.ts
│       │   │   │   └── truncate.pipe.ts
│       │   │   ├── services
│       │   │   │   ├── auth.service.spec.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── blockchain.service.spec.ts
│       │   │   │   ├── blockchain.service.ts
│       │   │   │   ├── content.service.spec.ts
│       │   │   │   ├── content.service.ts
│       │   │   │   ├── movie-progress.service.spec.ts
│       │   │   │   ├── movie-progress.service.ts
│       │   │   │   ├── movie.service.spec.ts
│       │   │   │   ├── movie.service.ts
│       │   │   │   ├── notification.service.spec.ts
│       │   │   │   ├── notification.service.ts
│       │   │   │   ├── quests.service.spec.ts
│       │   │   │   ├── quests.service.ts
│       │   │   │   ├── reviews.service.spec.ts
│       │   │   │   ├── reviews.service.ts
│       │   │   │   ├── series-progress.service.spec.ts
│       │   │   │   ├── series-progress.service.ts
│       │   │   │   ├── series.service.spec.ts
│       │   │   │   ├── series.service.ts
│       │   │   │   ├── theme.service.spec.ts
│       │   │   │   ├── theme.service.ts
│       │   │   │   ├── user-statistics.service.spec.ts
│       │   │   │   ├── user-statistics.service.ts
│       │   │   │   ├── user.service.spec.ts
│       │   │   │   ├── user.service.ts
│       │   │   │   ├── wallet.service.spec.ts
│       │   │   │   └── wallet.service.ts
│       │   │   ├── types
│       │   │   │   ├── content.type.ts
│       │   │   │   ├── ethereum.d.ts
│       │   │   │   ├── movie-status.type.ts
│       │   │   │   ├── series-status.type.ts
│       │   │   │   └── theme.type.ts
│       │   │   ├── utils
│       │   │   │   ├── auth-endpoints.ts
│       │   │   │   ├── colors.registry.ts
│       │   │   │   ├── error-handler.ts
│       │   │   │   ├── prices.registry.ts
│       │   │   │   ├── theme-presets.ts
│       │   │   │   └── theme.registry.ts
│       │   │   ├── app.component.html
│       │   │   ├── app.component.scss
│       │   │   ├── app.component.spec.ts
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   ├── environments
│       │   │   ├── environment.development.ts
│       │   │   ├── environment.sepolia.ts
│       │   │   └── environment.ts
│       │   ├── styles
│       │   │   ├── mixins
│       │   │   │   ├── _add-movie-to-library-mixin.scss
│       │   │   │   ├── _add-series-to-library-mixin.scss
│       │   │   │   ├── _background-img-mixin.scss
│       │   │   │   ├── _card-scrollable-list-mixin.scss
│       │   │   │   ├── _content-details-galleria-media-mixin.scss
│       │   │   │   ├── _desktop-mobile-media-mixin.scss
│       │   │   │   ├── _discover-page-list-media-mixin.scss
│       │   │   │   ├── _discover-page-media-mixin.scss
│       │   │   │   ├── _header-footer-mixin.scss
│       │   │   │   ├── _login-register-content-mixin.scss
│       │   │   │   ├── _mobile-width-mixin.scss
│       │   │   │   └── _profile-settings-media-mixin.scss
│       │   │   └── _variables.scss
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── styles.scss
│       ├── .editorconfig
│       ├── .gitignore
│       ├── angular.json
│       ├── package.json
│       ├── tsconfig.app.json
│       ├── tsconfig.json
│       └── tsconfig.spec.json
├── .gitignore
└── README.md
```
