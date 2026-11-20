// ============================================================================
//  YOUR GAME LIVES IN THIS FILE.  Edit it, save, refresh the page.
//  (If you edit mid-game, use "Teams / Reset" -> "Reset board" to start clean.)
//
//  Each clue has:
//    q       the clue text the host reads            (required)
//    a       the response                            (required)
//    qMedia  optional media shown with the clue
//    aMedia  optional media shown with the answer
//
//  Text can include simple HTML, e.g.  "The novel <i>Moby-Dick</i>..."
//  Use \n for a line break.
//
//  MEDIA (qMedia / aMedia) accepts any of these - the type is auto-detected:
//    "media/photo.jpg"                        image or gif  (put files in the media/ folder)
//    "media/clip.mp4"                         video (.mp4 / .webm) with play controls
//    "media/sound.mp3"                        audio
//    "https://www.youtube.com/watch?v=ID"     YouTube embed
//    "https://youtu.be/ID?start=30&end=45"    YouTube clip (start/end in seconds, optional)
//    '<iframe src="..."></iframe>'            any pasted embed code (Vimeo, Spotify, ...)
//    ["media/a.jpg", "media/b.jpg"]           several items at once
// ============================================================================

window.GAME = {
  title: "The One With the Gosses in Florida",
  uppercase: false, // set false to show clue text exactly as typed

  rounds: [
    {
      name: "Round 1",
      values: [200, 400, 600, 800, 1000],
      categories: [
        {
          name: "TOW All the Thanksgivings",
          clues: [
            { q: "In Season 8, Monica cooks Joey an entire turkey all for himself. Before he eats it, he changes into these.",
              a: "Phoebe's maternity pants. (Sure, we'll accept \"Joey Pants\", even though he never <i>actually</i> calls them that.)",
              aMedia: "media/JoeyPants.jpg"
            },
            { q: "In Season 7's Thanksgiving episode, the Friends try to name all the states. Say hello to this champ of Chandler's Dumb States game.\n(Bonus points if you remember how many states the champ named.)",
              a: "Joey, with 56 states.", aMedia: "https://www.youtube.com/watch?v=svy8zw-2XRM&start=54&end=64" },
            { q: "In Season 6, this friend ruins Thanksgiving dessert by putting beef in the English Trifle.",
              a: "Rachel", aMedia: "media/PagesStuck.gif" },
            { q: "In Season 4, Chandler kisses Joey's girlfriend, Kathy. As punishment, Chandler spends Thanksgiving here.",
              a: "In a box.", aMedia: "https://www.youtube.com/watch?v=IZMzJPIMQjA&start=46&end=60" },
            { q: "Season 8's Thanksgiving episode, \"The One With the Rumor\", features this guest star as a member of the \"I Hate Rachel Green Club\".\n(Bonus points if you can name the character.)",
              a: "Brad Pitt (Will)", aMedia: "media/Will_Colbert.jpg" },
          ],
        },
        {
          name: "TOW The Friends Play Jeopardy",
          clues: [
            { q: "In \"The One with the Embryos\", Ross writes the questions for these 4 other Friends to square off in a Jeopardy-esque competition.",
              a: "Monica & Rachel vs. Joey & Chandler", aMedia: "media/CoinToss.png" },
            { q: "When the competition ends in a tie, Ross reveals he has prepared a tiebreaker round, which he calls this.",
              a: "The Lightning Round", aMedia: "media/LightningRound.jpg" },
            { q: "Spoiler alert: the guys team wins Ross' Jeopardy competition. This is their prize.",
              a: "Swapping apartments with the girls.", aMedia: "media/AptSwap.jpg" },
            { q: "Had the girls won the competition, this would have been their prize.",
              a: "The guys get rid of the rooster & the duck.", aMedia: "media/ChickenDuck.avif" },
            { q: "What is Chandler Bing's job?",
              a: "Statistical Analysis and Data Reconfiguration\n(Half credit for \"Transponster\")", aMedia: "media/Transponster.gif" },
          ],
        },
        {
          name: "TOW Their Catchphrases",
          clues: [
            { q: "Ross frequently repeats this phrase to remind everyone he didn't technically cheat on Rachel.",
              a: "WE WERE ON A BREAK", aMedia: "https://www.youtube.com/watch?v=GWV4e3_DBn8" },
            { q: "Phoebe sings many songs throughout the show, but this recurring one is the only one for which she records a music video.",
              a: "Smelly Cat", aMedia: "media/SmellyCat.jpg" },
            { q: "Ross is well-known for screaming this word while trying to carry a couch up the stairs.",
              a: "PIVOT!", aMedia: "https://www.youtube.com/watch?v=hWruEaP4ysI" },
            { q: "Joey famously uses this line to hit on girls.",
              a: "How you doin'?", aMedia: "media/HYD.gif" },
            { q: "Not quite a catchphrase, but Monica and Ross replaced the middle finger with this action to hide it from their parents.",
              a: " ", aMedia: "media/FU.gif" },
          ],
        },
        {
          name: "TOW It's All Relative",
          clues: [
            { q: "Season 8, Episode 24, titled \"The One Where Rachel Has a Baby: Part 2\", aired on this date. (Month, Day, and Year please)",
              a: "May 16, 2002", aMedia: "media/BabyWill.JPG" },
            { q: "Monica and Chandler have this many kids.",
              a: "2 (twins)", aMedia: "https://www.youtube.com/watch?v=evYEy8T7feY&start=10&end=23" },
            { q: "These are the names of Ross and Monica's parents.",
              a: "Jack and Judy Geller.", aMedia: "media/JackJudy.jpg" },
            { q: "Joey has this many sisters.", a: "7", aMedia: "media/7.gif" },
            { q: "Name at least one of Phoebe's triplets. Points for each one you name.",
              a: "Leslie, Chandler, Frank Jr.", aMedia: "media/Triplets.jpg" },
          ],
        },
        {
          name: "TOW My Favorite Jokes",
          clues: [
            { q: "When Chandler steals Joey's underwear, this is how Joey retaliates.",
              a: "He does the opposite.", aMedia: "https://www.youtube.com/watch?v=zxCY0KsCCLI&end=86" },
            { q: "Pictured below is Joey's reaction when he discovers this secret.", qMedia: "media/JoeyFindsOut.png",
              a: "Monica and Chandler are dating.", aMedia: "https://www.youtube.com/watch?v=XZVHmRvfDHM&start=98&end=143" },
            { q: "Chandler convinces Joey to choose a stage name that he unknowingly shares with this Soviet dictator.",
              a: "Joseph Stalin", aMedia: "https://www.youtube.com/watch?v=Z-eu2oYxYOA" },
            { q: "When Ross gets a spray tan, he ends up spraying his front 4 times and his back none. All because he counted this way.",
              a: "Mississippilessly!", aMedia: "https://www.youtube.com/watch?v=k4EklmtJWlQ&start=48" },
            { q: "When Chandler and Joey lose baby Ben, they can't figure out which baby he is. \
                  They flip a coin to decide whether he is the one wearing a shirt with ducks or these oftentimes scary people.",
              a: "Clowns", aMedia: "https://www.youtube.com/watch?v=NSLp-m5XctM" },
          ],
        },
      ],
    },
  ],

  // Final Jeopardy (remove this whole block if you don't want one)
  final: {
    category: "MUSIC",
    q: "In preparation for Monica & Chandler's wedding, Ross learns to play this instrument. Double your wager if you remember the song too!",
    a: "Bagpipes\nCelebration - Kool & The Gang",
    aMedia: "https://www.youtube.com/watch?v=g0z18rM68D8&start=16",
    seconds: 30, // timer length
    // qMedia: "media/something.jpg",
    // aMedia: "media/something-else.jpg",
  },
};
