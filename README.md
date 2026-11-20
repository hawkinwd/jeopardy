# Jeopardy

A local Jeopardy game. Plain HTML/CSS/JS, no install, no build step.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell. Open this to play. |
| `questions.js` | **Your game**: categories, clues, answers, media, final. |
| `app.js` | Game logic. You shouldn't need to touch it. |
| `style.css` | Look and feel. |
| `media/` | Put your images, gifs, videos and audio here. |

## Running it

- **Easiest:** double-click `index.html`. Works offline for text, images, gifs, local video/audio.
- **If you use YouTube embeds:** YouTube often refuses to play embeds on pages opened from disk (`file://`). Either
  push the folder to GitHub Pages, or run a tiny local server in this folder:
  `python3 -m http.server 8000` and open http://localhost:8000.

## Writing questions

Open `questions.js`. Each category has a name and one clue per row:

```js
{
  name: "SHAPES",
  clues: [
    { q: "Clue text (what the host reads)", a: "What is the answer?" },
    {
      q: "Name this landmark",
      qMedia: "media/landmark.jpg",
      a: "What is the Eiffel Tower?",
      aMedia: "media/landmark-answer.gif",
    },
    // ...one entry per row (5 by default)
  ],
}
```

`qMedia` shows with the clue, `aMedia` with the answer. Both are optional and accept:

- `"media/photo.jpg"`: image or gif
- `"media/clip.mp4"`: video (mp4/webm) with controls
- `"media/sound.mp3"`: audio
- `"https://www.youtube.com/watch?v=ID"`: YouTube; add `&start=30&end=45` (seconds) to play just a clip
- `'<iframe ...></iframe>'`: any pasted embed code
- `["media/a.jpg", "media/b.jpg"]`: several at once

Text fields allow simple HTML (`<i>Titles</i>`) and `\n` line breaks.

The board warns you at the top if a category has the wrong number of clues or a clue is missing `q`/`a`.

**Optional second round:** uncomment the `Double Jeopardy` block in `questions.js` (doubled values are already filled in).

## Playing

- **Setup:** pick the number of teams and names (change any time via "Teams / Reset").
- **Board:** click a tile to open the clue. Scores at the bottom are clickable to edit (type a number, Enter).
- **Clue screen:** "Show answer" (or Space/Enter). "Back to board" backs out *without* using the clue up.
- **Answer screen:** per-team `+` / `−` add or subtract the clue value; click a score to type any number. Once the answer
  is shown, the tile goes blank on the board and can't be reopened.
- **Final Jeopardy:** gold button, top right of the board. Enter wagers (any amount), reveal the clue
  (optional 30s timer), show the answer, then `+` / `−` apply each team's own wager. "Final scores" shows the ranking.
- **Keyboard:** Space / Enter / → = advance; Esc = back.
- Everything (teams, scores, used clues, wagers) autosaves in the browser, so a refresh won't lose your game.
  "Teams / Reset" has Reset scores, Reset board, and Start over.
