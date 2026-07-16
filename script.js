function toggleDarkMode () {
    const root = document.documentElement;
    const theme = document.getElementById('theme-toggle');
    const isDark = root.getAttribute('data-theme') === 'dark'
    const newTheme = isDark? 'light' : 'dark';
 
    root.setAttribute('data-theme', newTheme);
    theme.classList.toggle('is-dark', newTheme === 'dark');
    theme.setAttribute('aria-pressed', newTheme === 'dark');
    theme.setAttribute('aria-label', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
 
    localStorage.setItem('wordly-theme', newTheme);
}

document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);

const storedTheme = localStorage.getItem('wordly-theme');
if (storedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-toggle').classList.add('is-dark');
    document.getElementById('theme-toggle').setAttribute('aria-pressed', 'true');
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Switch to light mode');
}

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
searchForm.addEventListener('submit', handleSearch); 

const favourites_key = 'wordly-favourites';
let favourites = JSON.parse(localStorage.getItem(favourites_key)) || [];

const favouritesList = document.getElementById('favourites-list');
const favouritesEmpty = document.querySelector('.favourites-empty');
const favouritesCount = document.getElementById('favourites-count');

function saveFavourites (){
    localStorage.setItem(favourites_key, JSON.stringify(favourites));
}

function isFavourite(word) {
    return favourites.includes(word.toLowerCase());
}

function addFavourite(word){
    if (!isFavourite(word)){
        favourites.push(word.toLowerCase());
        saveFavourites();
        renderFavourites();
    }
}

function removeFavourite(word){
    favourites = favourites.filter(fav => fav !== word.toLowerCase());
    saveFavourites();
    renderFavourites();
    syncRibbonButtons(word);
}

function toggleFavourite(word, ribbonBtn){
    if(isFavourite(word)){
        removeFavourite(word);
    }else{
        addFavourite(word);
    }

    updateRibbonButton(ribbonBtn, isFavourite(word));
}

function updateRibbonButton(ribbonBtn, saved){
    ribbonBtn.classList.toggle('is-saved', saved);
    ribbonBtn.setAttribute('aria-pressed', saved);
    ribbonBtn.setAttribute('aria-label', saved ? 'Remove from favourites' : 'Save to favourites');
}

function syncRibbonButtons(word){
    const saved = isFavourite(word);
    document.querySelectorAll('.entry-result-item').forEach (item => {
        const headWord = item.querySelector('.headword');
        const ribbonBtn = item.querySelector('.ribbon-toggle');
        if (headWord && ribbonBtn && headWord.textContent.toLowerCase() === word.toLowerCase()){
            updateRibbonButton(ribbonBtn, saved);
        }
    });
}


function renderFavourites(){
    favouritesList.innerHTML = '';
    favouritesCount.textContent = favourites.length;


    if (favourites.length === 0) {
        favouritesEmpty.removeAttribute('hidden');
        favouritesList.setAttribute('hidden', '');
        return;
    }

    favouritesEmpty.setAttribute('hidden', '');
    favouritesList.removeAttribute('hidden');

    favourites.forEach(word => {
        const chip = document.createElement('li');
        chip.className = 'favourite-chip';

        const wordBtn = document.createElement('button');
        wordBtn.type = 'button';
        wordBtn.className = 'favourite-word';
        wordBtn.textContent = word;
        wordBtn.addEventListener('click', () => {
            searchInput.value = word;
            searchForm.requestSubmit();
        });

        chip.appendChild(wordBtn);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'favourite-remove';
        removeBtn.setAttribute('aria-label', `Remove ${word} from favourites`);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeFavourite(word));

        chip.appendChild(removeBtn);

        favouritesList.appendChild(chip);
    });
}



async function handleSearch(event) {
    event.preventDefault();
    const word = searchInput.value.trim(); 
    if (!word) {
        return 
    };

    const allStates = document.querySelectorAll('.entry-state');
    allStates.forEach(state => state.setAttribute('hidden', '')); 
    document.querySelector('.entry-loading').removeAttribute('hidden');
    try{
        const response = await fetch (`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        if (!response.ok) {
            throw new Error (`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayData(data);
    }
    catch (error){
        console.error('Error', error)
        allStates.forEach(state => state.setAttribute('hidden', ''));
        document.querySelector('.entry-error').removeAttribute('hidden');
    }
}

function displayData(data) {
    const resultContainer = document.getElementById('entry-results'); 
    resultContainer.innerHTML = '';
    
    const allStates = document.querySelectorAll('.entry-state');
    allStates.forEach(state => state.setAttribute('hidden', ''));
    resultContainer.removeAttribute('hidden');

    data.forEach(entry => {
        const item = document.createElement('article');
        item.className = 'entry-result-item';

        const ribbonBtn = document.createElement('button'); 
        ribbonBtn.type = 'button'
        ribbonBtn.className = 'ribbon-toggle';
        ribbonBtn.setAttribute('aria-label', 'save to favourites'); 
        ribbonBtn.setAttribute('aria-pressed', 'false');
        ribbonBtn.addEventListener('click', () => toggleFavourite(entry.word, ribbonBtn));
        updateRibbonButton(ribbonBtn, isFavourite(entry.word));

        const ribbon = document.createElement('span');
        ribbon.className = 'ribbon';
        ribbonBtn.appendChild(ribbon);
        item.appendChild(ribbonBtn);

        const head = document.createElement('div');
        head.className = 'entry-head';

        const headWord = document.createElement('h2');
        headWord.className = 'headword';
        headWord.textContent = entry.word;
        head.appendChild(headWord);

        const phoneticRow = document.createElement('div');
        phoneticRow.className = 'phonetic-row';

        (entry.phonetics || []).forEach(phonetic =>{
            if (!phonetic.text) return;

            const chip = document.createElement('div');
            chip.className = 'pronunciation-chip';

            const phoneticText = document.createElement ('div');
            phoneticText.className = 'phonetic';
            phoneticText.textContent = phonetic.text;
            chip.appendChild(phoneticText);

            if (phonetic.audio){
                const audioBtn = document.createElement('button');
                audioBtn.className = 'audio-btn';
                audioBtn.setAttribute('aria-label', 'Play pronunciation');
                audioBtn.textContent = '▶';
                audioBtn.addEventListener('click', () =>{
                    new Audio(phonetic.audio).play();
                });

                chip.appendChild(audioBtn);
            }

            phoneticRow.appendChild(chip);
        });

        head.appendChild(phoneticRow);
        item.appendChild(head);

        (entry.meanings || []).forEach(meaning => {
            const block = document.createElement('div');
            block.className = 'meaning-block';

            const pos = document.createElement ('p');
            pos.className = 'part-of-speech';
            pos.textContent = meaning.partOfSpeech;
            block.appendChild(pos);


            const list = document.createElement('ol');
            list.className = 'definitions-list';
// indexing for the array index 
            meaning.definitions.forEach((def, index) =>{
                const li = document.createElement('li');
                li.textContent = def.definition;

                if(def.example) {
                    const example = document.createElement('p');
                    example.className = 'definition-example';
                    example.textContent  = `“${def.example}”`;
                    li.appendChild(example);

                }

                if (index >= 5) {
                    li.classList.add('extra-definition');
                    li.setAttribute('hidden', '');
                } 

                list.appendChild(li);
            });

            block.appendChild(list);
// if the count is more than 5 words we add a show more button so that we don't make the page a long one if the count is more than 5 
            const extraCount = meaning.definitions.length - 5;
            if (extraCount > 0) {
                const showMoreBtn = document.createElement('button');
                showMoreBtn.className = 'show-more-btn';
                showMoreBtn.type = 'button';
                showMoreBtn.setAttribute('aria-expanded', 'false');
                showMoreBtn.textContent = `Show ${extraCount} more definitions`;
                showMoreBtn.addEventListener('click', () => {
                    const isExpanded = showMoreBtn.getAttribute('aria-expanded') === 'true';
                    const extras = list.querySelectorAll('.extra-definition');
                    extras.forEach(extra => {
                        if(isExpanded){
                            extra.setAttribute('hidden', '');
                        }else {
                            extra.removeAttribute('hidden');
                        }
                    });

                    showMoreBtn.setAttribute('aria-expanded', String(!isExpanded));
                    showMoreBtn.textContent = isExpanded ? `Show ${extraCount} more definitions`: 'Show fewer definitions';
                    
                });

                block.appendChild(showMoreBtn);

            }

            if(meaning.synonyms && meaning.synonyms.length > 0){
                const synonyms = document.createElement('div');
                synonyms.className = 'synonyms';

                const label = document.createElement('span');
                label.className = 'synonyms-label';
                label.textContent = 'Synonyms';
                synonyms.appendChild(label);

                meaning.synonyms.forEach(word => {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.textContent = word;
                    synonyms.appendChild(tag);
                });

                block.appendChild(synonyms);
            }

            item.appendChild(block);
        });
        const source = document.createElement('footer');
        source.className = 'entry-source'; 
        const sourceUrl = (entry.sourceUrls && entry.sourceUrls[0]) || '#';
        source.innerHTML = `Source: <a href="${sourceUrl}" target="_blank" rel="noopener">${sourceUrl}</a>`;
        item.appendChild(source); 

        resultContainer.appendChild(item);
    });
}
renderFavourites();