let invalidWord = false;

let words = [];
let targetWord = "";
let currentRow = 0;
let currentGuess = [];

const maxRows = 6;
const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const guessBtn = document.getElementById("guessBtn");

let streak =
  Number(localStorage.getItem("streak")) || 0;

const keyboardLayout = [
  ["Q","W","E","R","T","Y","U","I","O","P","Å"],
  ["A","S","D","F","G","H","J","K","L","Ö","Ä"],
  ["Z","X","C","V","B","N","M","⌫"]
];

async function loadWords() {
  const response = await fetch("answers.txt");
  const text = await response.text();

  words = text
    .split("\n")
    .map(w => w.trim().split("/")[0])
    .map(w => w.toUpperCase())
    .filter(w => w.length === 5)
    .filter(w => /^[A-ZÅÄÖ]+$/.test(w));

  newGame();
}

function randomWord() {
  return words[
    Math.floor(Math.random() * words.length)
  ];
}

function createBoard() {
  board.innerHTML = "";

  for (let i = 0; i < maxRows * 5; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    board.appendChild(tile);
  }
}

function createKeyboard() {
  keyboard.innerHTML = "";

  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    row.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = letter;

      if(letter === "⌫"){
        btn.classList.add("wide");
      }

      btn.onclick = () => handleKey(letter);

      btn.id = "key-" + letter;

      rowDiv.appendChild(btn);
    });

    keyboard.appendChild(rowDiv);
  });
}

function handleKey(letter){

  if(letter === "⌫"){

    if(currentGuess.length > 0){
      currentGuess.pop();
      renderCurrentGuess();
    }

    if(invalidWord){
      invalidWord = false;
      guessBtn.textContent = "GISSA";
      guessBtn.style.background = "#538d4e";
    }

    return;
  }

  if(currentGuess.length >= 5)
    return;

  currentGuess.push(letter);

  renderCurrentGuess();
}

function renderCurrentGuess(){
  for(let i=0;i<5;i++){

    const tile =
      board.children[currentRow*5+i];

    tile.textContent =
      currentGuess[i] || "";
  }
}

function scoreGuess(guess,target){

  const result = Array(5).fill("absent");
  const remaining = target.split("");

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

function updateKeyboard(guess,result){

  for(let i=0;i<5;i++){

    const key =
      document.getElementById(
        "key-" + guess[i]
      );

    if(!key) continue;

    if(
      result[i] === "correct"
    ){
      key.classList.remove(
        "present",
        "absent"
      );

      key.classList.add(
        "correct"
      );
    }

    else if(
      result[i] === "present" &&
      !key.classList.contains(
        "correct"
      )
    ){
      key.classList.remove(
        "absent"
      );

      key.classList.add(
        "present"
      );
    }

    else if(
      result[i] === "absent" &&
      !key.classList.contains(
        "correct"
      ) &&
      !key.classList.contains(
        "present"
      )
    ){
      key.classList.add(
        "absent"
      );
    }
  }
}

function submitGuess(){

  const guess =
    currentGuess.join("");

  if(guess.length !== 5){
    return;
  }

  if(!words.includes(guess)){
    invalidWord = true;

guessBtn.textContent =
  "INTE ETT ORD";

guessBtn.style.background =
  "#b00020";

return;
  }

  const result =
    scoreGuess(guess,targetWord);

  for(let i=0;i<5;i++){

    const tile =
      board.children[currentRow*5+i];

    tile.classList.add(result[i]);
  }

  updateKeyboard(guess,result);

  if(guess===targetWord){

    streak++;
    localStorage.setItem(
      "streak",
      streak
    );

    renderStats();

    showMessage("🎉 Rätt!");
    guessBtn.disabled = true;
    return;
  }

  currentRow++;
  currentGuess = [];

  if(currentRow===maxRows){

    streak=0;

    localStorage.setItem(
      "streak",
      0
    );

    renderStats();

    showMessage(
      "❌ Ordet var: " + targetWord
    );

    guessBtn.disabled = true;
  }
}

function newGame(){

  targetWord = randomWord();

  currentRow = 0;
  currentGuess = [];

  guessBtn.disabled = false;

  createBoard();
  createKeyboard();

  showMessage("");

  renderStats();
}

function renderStats(){
  document.getElementById("stats")
    .innerHTML =
    "🔥 Aktuell streak: <strong>" +
    streak +
    "</strong>";
}

function showMessage(text){
  document.getElementById("message")
    .textContent = text;
}

guessBtn.addEventListener(
  "click",
  submitGuess
);

loadWords();
function showHelp() {
  document.getElementById("helpModal").style.display = "flex";
}

function closeHelp() {
  document.getElementById("helpModal").style.display = "none";
}

window.addEventListener("load", () => {
  showHelp();
});
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});