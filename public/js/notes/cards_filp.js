const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";
const cards = []; // 카드 정보를 저장할 배열

document.addEventListener('DOMContentLoaded', function() {
  getCard();  // DOM이 로드된 후 자동 실행
});

async function getCard() {
  if (loading || done) return;
  loading = true; // 로딩 상태 설정
  try {

fetch(`/api/cards?note_id=${noteId}&page=${page}`)
  .then(res => res.json())
  .then(data => {
    const newCards = data.cards;
    
    if (!newCards || newCards.length === 0) {
      done = true; // 데이터가 없으면 더 이상 로드 안 함
      return;
    }

    // 새로 불러온 카드 데이터를 기존 cards 배열에 추가
    cards.push(...newCards);
    if(page === 1) {
      // 페이지 로드 시 첫 번째 문제 표시
      updateCard(currentCardIndex);
    }
  })
  .catch(err => {
    console.error("카드 불러오기 실패:", err);
  });
  }catch (error) {console.error('카드 요청 실패:', error);} 
  finally {
    loading = false;
  }
}

let currentCardIndex = 0;

const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const nextButton = document.getElementById('next-button');
const preButton = document.getElementById('pre-button');
const flashcard = document.getElementById('flashcard');
const star = document.getElementById('star');
const hintBtn = document.getElementById('hint-btn');

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
  
  star.textContent = '⭐'.repeat(cards[index].star || 0);
  hintBtn.setAttribute('data-hint', cards[index].hint);
  questionElement.textContent = cards[index].num +'. '+cards[index].question;
  answerElement.textContent = cards[index].answer;
  currentCardIndex = index;
}

// 문제 변경 함수 (다음 문제로 넘어감)
nextButton.addEventListener('click', () => {
  updateCard(currentCardIndex + 1);
  if (currentCardIndex === cards.length - 1 && !done) {
    page++; // 다음 페이지 카드 로드
    getCard(); // 마지막 카드에 도달하면 다음 페이지 카드 로드
  }
});
// 문제 변경 함수 (이전 문제로 돌아감)
preButton.addEventListener('click', () => {
  updateCard(currentCardIndex - 1);
});

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

// 힌트 팝업
document.addEventListener('click', function (e) {
  const popup = document.getElementById('hint-popup');
  const popupContent = popup.querySelector('.hint-content');

  if (e.target.classList.contains('hint-btn')) {
    const hintText = e.target.getAttribute('data-hint');
    const flashcard = document.getElementById('flashcard');

    // 팝업 내용 설정
    popupContent.textContent = hintText;

    // 위치 및 크기 설정
    const rect = flashcard.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.top}px`;
    popup.style.left = `${rect.left}px`;
    popup.style.width = `${rect.width}px`;

    popup.style.display = popup.style.display == 'block' ? 'none' : 'block';
  } else {
    // 팝업 닫기
    if (!popup.contains(e.target)) {
      popup.style.display = 'none';
    }
  }
});
