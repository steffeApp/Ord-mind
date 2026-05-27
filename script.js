let words = [];
let targetWord = "";
let currentRow = 0;

const maxRows = 5;

let streak =
  Number(localStorage.getItem("streak")) || 0;

const board =
  document.getElementById("board");

const input =
  document.getElementById("guessInput");

document
  .getElementById("guessBtn")
  .addEventListener("click", submitGuess);

document
  .getElementById("newBtn")
  .addEventListener("click", newGame);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") submitGuess();
});

async function loadWords() {
  const response = await fetch("words.txt");
  const text = await response.text();

  words = text
    .split("\n")

    // ta första delen före /  ex: "abort/5" -> "abort"
    .map(word => word.trim().split("/")[0])

    // stora bokstäver
    .map(word => word.toUpperCase())

    // exakt 5 bokstäver
    .filter(word => word.length === 5)

    // bara svenska bokstäver A-Z ÅÄÖ
    .filter(word => /^[A-ZÅÄÖ]+$/.test(word));

  console.log("Antal giltiga ord:", words.length);

  newGame();
}

function createBoard(){

  board.innerHTML="";

  for(let i=0;i<25;i++){

    const tile =
      document.createElement("div");

    tile.className="tile";

    board.appendChild(tile);
  }
}

function newGame(){

  targetWord =
    words[
      Math.floor(
        Math.random() * words.length
      )
    ];

  currentRow = 0;

  createBoard();

  input.disabled = false;
  input.value = "";
  input.focus();

  showMessage("");

  renderStats();
}

function scoreGuess(guess,target){

  const result =
    Array(5).fill("absent");

  const remaining =
    target.split("");

  for(let i=0;i<5;i++){
    if(guess[i]===target[i]){
      result[i]="correct";
      remaining[i]=null;
    }
  }

  for(let i=0;i<5;i++){

    if(result[i]==="correct")
      continue;

    const index =
      remaining.indexOf(guess[i]);

    if(index!==-1){
      result[i]="present";
      remaining[index]=null;
    }
  }

  return result;
}

function submitGuess(){

  if(input.disabled) return;

  const guess =
    input.value
      .trim()
      .toUpperCase();

  if(guess.length!==5){
    showMessage("Skriv 5 bokstäver");
    return;
  }

  const result =
    scoreGuess(guess,targetWord);

  for(let i=0;i<5;i++){

    const tile =
      board.children[currentRow*5+i];

    tile.textContent = guess[i];
    tile.classList.add(result[i]);
  }

  if(guess===targetWord){

    streak++;
    localStorage.setItem(
      "streak",
      streak
    );

    renderStats();

    showMessage(
      "🎉 Rätt! Klicka på Spela igen"
    );

    input.disabled = true;

    return;
  }

  currentRow++;

  if(currentRow===maxRows){

    streak = 0;

    localStorage.setItem(
      "streak",
      0
    );

    renderStats();

    showMessage(
      "❌ Ordet var: " + targetWord
    );

    input.disabled = true;
  }

  input.value = "";
}

function renderStats(){

  document.getElementById(
    "stats"
  ).innerHTML =
    "🔥 Vinstsvit: <strong>"
    + streak +
    "</strong>";
}

function showMessage(text){
  document.getElementById(
    "message"
  ).textContent = text;
}

loadWords();