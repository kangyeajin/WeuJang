let currentCardIndex = 0;
const cards = [
  { question: "문제 1", answer: "답 1" },
  { question: "문제 2", answer: "답 2" },
  { question: "문제 3", answer: "답 3" },
  // 더 많은 문제와 답을 추가
];

const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const nextButton = document.getElementById('next-button');
const preButton = document.getElementById('pre-button');
const flashcard = document.getElementById('flashcard');

// 카드 정보 업데이트 함수
function updateCard(index) {
  if (flashcard.classList.contains('rotate')) {
    flashcard.classList.remove('rotate');
    flashcard.style.transition = 'none';  // 애니메이션 일시적으로 비활성화
    setTimeout(() => {
      flashcard.style.transition = '';  // 애니메이션 재활성화
    }, 50); // 50ms 정도 대기 후 재활성화
  }
  if (index >= cards.length) {
    index = 0; // 마지막 문제에 도달하면 첫 번째 문제로 돌아갑니다.
  }
  questionElement.textContent = cards[index].question;
  answerElement.textContent = cards[index].answer;
  currentCardIndex = index;
}

// 문제 변경 함수 (다음 문제로 넘어감)
nextButton.addEventListener('click', () => {
  updateCard(currentCardIndex + 1);
});
// 문제 변경 함수 (이전 문제로 돌아감)
preButton.addEventListener('click', () => {
  updateCard(currentCardIndex - 1);
});

// 페이지 로드 시 첫 번째 문제 표시
updateCard(currentCardIndex);

// 슬라이드로 다음 문제로 이동 (스크롤)
let startY;

flashcard.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
});

flashcard.addEventListener('touchend', (e) => {
  let endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) { // 위로 스와이프
    updateCard(currentCardIndex + 1);
  } else if (endY - startY > 50) { // 아래로 스와이프
    updateCard(currentCardIndex - 1);
  }
});

flashcard.addEventListener('click', () => {
  flashcard.classList.toggle('rotate');
});