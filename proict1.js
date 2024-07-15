document.getElementById('harrypotter').addEventListener('click', () => {
  startGame('harry');
});

document.getElementById('cat').addEventListener('click', () => {
  startGame('cat');
});

document.getElementById('dog').addEventListener('click', () => {
  startGame('dog');
});

document.getElementById('again').addEventListener('click', () => {
  resetGame();
});

let startTime, timerInterval;
let score = 0;
let images = [];
let firstCard, secondCard;
let lockBoard = false;

async function startGame(category) {
  document.getElementById('pre').classList.add('hidden');
  resetBoard();
  score = 0;
  startTime = new Date().getTime();
  timerInterval = setInterval(updateTime, 1000);
  await fetchData(category);
}

async function fetchData(category) {
  let url = '';
  if (category === 'harry') {
      url = 'https://hp-api.onrender.com/api/characters';
  } else if (category === 'cat') {
         url='https://api.thecatapi.com/v1/images/search?limit=6' ; 
        } else if (category === 'dog') {
      url = 'https://dog.ceo/api/breeds/image/random/6';
  }

  try {
      const response = await fetch(url);
      const data = await response.json();
      prepareGame(data, category);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

function prepareGame(data, category) {
  images = [];
  if (category === 'harry') {
      let selectedCharacters = getRandomItems(data.filter(character => character.image), 6);
      images = selectedCharacters.map(character => character.image);
  } else if (category === 'cat') {
    let selectedCats = getRandomItems(data, 6);
      images = data.map(cat => cat.url);

  } else if (category === 'dog') {
      images = data.message;
  }

  images = images.concat(images);
  images = shuffleArray(images);

  displayCards(images);
}

function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayCards(images) {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';
  images.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `<img src="${image}" alt="Card image">`;
      card.addEventListener('click', () => flipCard(card));
      gameBoard.appendChild(card);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;

  card.classList.add('flipped');

  if (!firstCard) {
      firstCard = card;
      return;
  }

  secondCard = card;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.innerHTML === secondCard.innerHTML;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', () => flipCard(firstCard));
  secondCard.removeEventListener('click', () => flipCard(secondCard));
  score++;
  if (score === images.length /2) {
      endGame();
  } else {
      resetBoard();
  }
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');

      resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function updateTime() {
  const currentTime = new Date().getTime();
  const timeElapsed = Math.floor((currentTime - startTime) / 1000);
  document.getElementById('time').textContent = timeElapsed;
}

function endGame() {
  clearInterval(timerInterval);
  document.getElementById('final').textContent = `You finished the game in ${document.getElementById('time').textContent} seconds with a score of ${score}.`;
  document.getElementById('post').classList.remove('hidden');
}

function resetGame() {
  document.getElementById('game-board').innerHTML = '';
  document.getElementById('time').textContent = '0';
  document.getElementById('score').textContent = '0';
  document.getElementById('post').classList.add('hidden');
  document.getElementById('pre').classList.remove('hidden');
}
