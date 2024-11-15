document.addEventListener('DOMContentLoaded', () => {
    const parseButton = document.getElementById('parseButton');
    const wordInput = document.getElementById('wordInput');
    const topBlock = document.getElementById('top-block');
    const blueBlock = document.getElementById('blueBlock');
    const outputField = document.getElementById('outputField');
    const clickInfo = document.getElementById('clickInfo');

    let wordClicks = {};
    let initialOrder = [];

    // Делим слова
    parseButton.addEventListener('click', () => {
        const input = wordInput.value.trim();
        const words = input.split('-').map(word => word.trim());
        const sortedWords = sortWords(words);

        topBlock.innerHTML = '';
        blueBlock.innerHTML = '';
        outputField.innerHTML = '';
        wordClicks = {};
        initialOrder = sortedWords.map(wordObj => wordObj.word);

        sortedWords.forEach((wordObj) => {
            const { key, word } = wordObj;
            const oval = createOvalElement(`${key} ${word}`);
            oval.dataset.word = word;
            oval.dataset.key = key;
            oval.dataset.originalColor = oval.style.backgroundColor;

            addDragAndDrop(oval);
            topBlock.appendChild(oval);

            wordClicks[word] = 0;
        });
    });

    // Сортим слова
    function sortWords(words) {
        const lowercaseWords = [];
        const uppercaseWords = [];
        const numbers = [];

        words.forEach(word => {
            if (!isNaN(word)) {
                numbers.push(Number(word));
            } else if (word[0] === word[0].toUpperCase()) {
                uppercaseWords.push(word);
            } else {
                lowercaseWords.push(word);
            }
        });

        lowercaseWords.sort();
        uppercaseWords.sort();
        numbers.sort((a, b) => a - b);

        const sortedWords = [];
        lowercaseWords.forEach((word, index) => sortedWords.push({ key: `a${index + 1}`, word }));
        uppercaseWords.forEach((word, index) => sortedWords.push({ key: `b${index + 1}`, word }));
        numbers.forEach((number, index) => sortedWords.push({ key: `n${index + 1}`, word: number.toString() }));

        return sortedWords;
    }

    // Рисуем овал
    function createOvalElement(text) {
        const oval = document.createElement('div');
        oval.textContent = text;
        oval.classList.add('oval');
        oval.draggable = true;
        return oval;
    }

    // Добавляем listener-ы
    function addDragAndDrop(element) {
        element.addEventListener('click', () => {
            const word = element.dataset.word;

            if (element.parentNode === blueBlock) {
                wordClicks[word]++;
                displayClickInfo(word);

                const wordSpan = document.createElement('span');
                wordSpan.textContent = ` ${word}`;
                wordSpan.style.color = element.style.backgroundColor;
                outputField.appendChild(wordSpan);
            }
        });

        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', `${element.dataset.key} ${element.dataset.word}`);
            e.target.classList.add('dragging');
        });

        element.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    }

    blueBlock.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    blueBlock.addEventListener('drop', (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        const [key, word] = text.split(' ');

        let oval = Array.from(blueBlock.children).find(child => child.dataset.key === key);

        if (!oval) {
            oval = createOvalElement(text);
            oval.style.backgroundColor = getRandomColor();
            oval.dataset.word = word;
            oval.dataset.key = key;
            oval.classList.add('in-block-2');
            addDragAndDrop(oval);
            blueBlock.appendChild(oval);

            const originalOval = document.querySelector(`#top-block [data-key="${key}"]`);
            if (originalOval) {
                topBlock.removeChild(originalOval);
            }
        }

        const blueBlockRect = blueBlock.getBoundingClientRect();
        const topBlockRect = topBlock.getBoundingClientRect();
        const offsetX = e.clientX - blueBlockRect.left;
        const offsetY = e.clientY - blueBlockRect.top;
        oval.style.position = 'absolute';
        oval.style.left = `${offsetX}px`;
        oval.style.top = `${offsetY + topBlockRect.height * 2.0}px`;
    });


    topBlock.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    topBlock.addEventListener('drop', (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        const [key, word] = text.split(' ');

        const ovalInBlue = Array.from(blueBlock.children).find(child => child.dataset.key === key);
        if (ovalInBlue) {
            blueBlock.removeChild(ovalInBlue);

            const originalOval = createOvalElement(text);
            originalOval.dataset.word = word;
            originalOval.dataset.key = key;
            originalOval.style.backgroundColor = originalOval.dataset.originalColor;
            addDragAndDrop(originalOval);

            const existingOvals = Array.from(topBlock.children);
            existingOvals.push(originalOval);
            existingOvals.sort((a, b) => a.dataset.key.localeCompare(b.dataset.key, undefined, { numeric: true }));

            topBlock.innerHTML = '';
            existingOvals.forEach(oval => topBlock.appendChild(oval));
        }
    });

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function displayClickInfo(word) {
        clickInfo.textContent = '';
        for (const [key, value] of Object.entries(wordClicks)) {
            if (value > 0) {
                clickInfo.textContent += `${value} раз нажали на блок с текстом "${key}". `;
            }
        }
    }
});
