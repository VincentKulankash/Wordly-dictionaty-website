Wordly — Online Dictionary

Wordly is a single-page online dictionary. Search any English word to get its
pronunciation, definitions, synonyms and source, save words to a favourites
list, and switch between light and dark mode — all without the page ever
reloading.

Features


Word search — look up any English word through a simple search form.
Pronunciation — phonetic spelling plus audio playback where available.
Definitions — grouped by part of speech, with example sentences where
the API provides one. Entries with more than five definitions collapse
behind a "Show more" toggle.
Synonyms — displayed as tags under each meaning, when available.
Source attribution — links back to the dictionary's original source.
Favourites — save words with one click; saved words are stored in the
browser (localStorage) so they're still there after a refresh. Click a
favourite to look it up again, or remove it from the list.
Light / dark mode — toggle in the header, also persisted across
reloads via localStorage.
Accessible by default — semantic HTML, aria-label/aria-pressed/
aria-expanded on interactive controls, and a live region on the results
section so screen readers announce new lookups.


Wordly-dictionaty-website/
├── index.html   # Page structure and markup
├── style.css    # Layout, theming, and component styles
├── script.js    # Search, rendering, favourites, and theme logic
└── README.md
