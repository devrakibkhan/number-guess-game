# Two-Way Number Guessing Game - Overview

Welcome to the Two-Way Number Guessing Game! This project is a modern, real-time multiplayer web application built with a robust tech stack and designed for a fast-paced, interactive experience.

## Tech Stack
* **Framework:** [Next.js](https://nextjs.org/) (React, App Router)
* **Database & Realtime:** [Supabase](https://supabase.com/)
* **Styling:** [@stitches/react](https://stitches.dev/) (CSS-in-JS for a modern, glassmorphism UI)
* **Audio:** Web Audio API (Synthetic sound effects)
* **Language:** TypeScript

## Game Flow & Mechanics
This is a simultaneous, two-way guessing game. The objective is to be the first to guess your opponent's secret number.

1. **Creating a Game:** Player 1 (the Host) creates a game by providing their name, setting a maximum turn limit, and choosing their secret number. They are then given a unique link to share.
2. **Joining a Game:** Player 2 joins the game via the link, enters their name, sets their own secret number, and makes their very first guess of the Host's secret.
3. **The Turn Cycle:** 
   * Players take turns simultaneously.
   * On your turn, you must enter your next guess for your opponent's secret number.
   * The game automatically evaluates your opponent's latest guess and instantly provides them with a 100% accurate hint (Less, More, or Correct). You don't have to manually select hints anymore.
4. **Winning, Drawing & Continuous Play:**
   * If a player guesses correctly, they have won! However, the game **does not immediately end**.
   * The player who won simply sits back; their guess input disappears, and they automatically continue to evaluate their opponent's guesses (by submitting the turn).
   * The opponent is allowed to use their remaining attempts to also try and find the number.
   * The game ends when **both** players have found the number, or when the custom turn limit (e.g., 10 turns) is exhausted.
   * Players can also manually click the "End Game" button to instantly terminate the match.

## Key Features

### 🎨 Beautiful, Modern UI (Stitches)
The app features a custom design system built with Stitches. It includes a sleek dark mode, glassmorphism cards with backdrop blurring, vibrant neon accents, dynamic player names, and responsive layouts. An interactive "Welcome Dialogue" modal greets visitors with the rules on every load.

### 📱 Mobile-Optimized Inputs
All number input fields (secrets and guesses) are configured with `inputMode="numeric"` and `pattern="[0-9]*"`, ensuring that mobile users are automatically presented with a large, easy-to-use numeric keypad rather than a full text keyboard.

### ⚡ Real-Time Multiplayer
The game relies on Supabase's powerful Postgres changes to sync state updates (like turns and hints) instantly across both players' screens.

### ⏱️ Server-Synchronized Timer
A highly accurate game timer tracks the match duration in `MM:SS` format. By utilizing `started_at` and `ended_at` timestamps stored in Supabase, the timer remains perfectly synchronized for both players regardless of local clock discrepancies.

### 💬 Custom Realtime Text Hints & Nudges
Players can use the "Request Hint" button to ask for clues. This opens an input box for the waiting opponent to type a completely custom text message (up to 50 characters). The message is instantly transmitted via a Supabase Realtime Broadcast channel and pops up on the requester's screen. Players can also "Nudge" their opponents to hurry up!

### 🚀 Animated Toast Notifications
The game completely eschews blocking browser `alert()` popups in favor of a custom-built, CSS-animated Toast Notification system. Whether a player successfully copies a game link, receives a nudge, or hits an error state, a beautifully styled toast smoothly slides onto the screen to provide feedback without interrupting gameplay.

### 🎵 Synthetic Sound Effects
The game includes a lightweight sound engine built entirely with the browser's native Web Audio API. It plays dynamic sounds for button clicks across the entire app, successful turn submissions, incoming custom hints, and distinct arpeggios for winning or ending the game—all without requiring external MP3 files.

### 🌐 Internationalization (i18n)
The entire game features seamless, state-driven translation between English and Bengali (Bangla). Players can toggle the language instantly at any point in the game without page reloads, using a custom `LanguageContext` provider.

### 🤖 Auto-Evaluating Game Logic
To prevent human error from ruining matches, the MORE / LESS / CORRECT hint buttons are entirely automated. The state machine intelligently calculates the ongoing situation and highlights the perfect hint instantly.

### 📊 Game Report Page
Finished games redirect both players to a dedicated `/report` page. This page breaks down the final results (e.g., "Rakib Won!"), reveals both players' secret numbers, displays the total turns taken vs the max limit, shows the exact total time elapsed, and provides a quick way to play again. It is also fully translatable.

## Database Schema (Supabase)
The game uses a single `games` table with the following structure:
* `id` (uuid) - Primary Key
* `player_1_name` (text) - Name of the Host
* `player_2_name` (text) - Name of the Guest
* `secret_number` (text) - Player 1's secret
* `player_2_secret_number` (text) - Player 2's secret
* `current_guess` (text) - Player 2's latest guess
* `player_1_current_guess` (text) - Player 1's latest guess
* `hint` (text) - Player 1's hint for Player 2
* `player_2_hint` (text) - Player 2's hint for Player 1
* `total_attempts` (int) - Tracks the number of turns taken
* `max_attempts` (int) - The custom limit for maximum turns
* `game_status` (text) - Tracks the state (`waiting_player_2`, `player_1_turn`, `player_2_turn`, `player_1_won`, `player_2_won`, `draw`, `ended_manually`)
* `started_at` (timestamptz) - When Player 2 joined
* `ended_at` (timestamptz) - When the game reached a terminal state
