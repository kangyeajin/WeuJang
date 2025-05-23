const noteCon = document.querySelector('.note-container');
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";

document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener("scroll", handleScroll); // 스크롤 이벤트 등록
  getCard();  // DOM이 로드된 후 자동 실행
});

async function getCard() {
  if (loading || done) return;
  loading = true; // 로딩 상태 설정
  try {

fetch(`/api/cards?note_id=${noteId}&page=${page}`)
  .then(res => res.json())
  .then(data => {
    const cards = data.cards;
    if (!cards || cards.length === 0) {
      done = true; // 더 이상 데이터 없음 표시
      return;
    }
    for (let i = 0; i < cards.length; i++) {
      // 별 개수만큼 이모지 생성
      const stars = '⭐'.repeat(cards[i].star || 0);
      // hint 값이 있으면 ❓ 표시, 없으면 빈 문자열
      const hint = cards[i].hint ? '❓' : '';

      html += `<div class="note">
        <div class="question">
          <div class="meta">
            <span id="star">${stars}</span>
            <span class="hint-btn" data-hint="${cards[i].hint || ''}">${hint}</span>
          </div>
          ${cards[i].num}. ${cards[i].question}
        </div>
        <div class="divider"></div>
        <p class="answer">${cards[i].answer}</p>
      </div>`;
    }
    noteCon.innerHTML = html;
  })
  .catch(err => {
    console.error("카드 불러오기 실패:", err);
  });
  }catch (error) {console.error('카드 요청 실패:', error);} 
  finally {
    loading = false;
  }
}

// 스크롤 이벤트
function handleScroll() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;

  // 스크롤이 거의 바닥에 닿았을 때
  if (scrollTop + windowHeight >= bodyHeight - 100) {
    ++page; // 다음 목록 생성 
    getCard();
  }
}

// 힌트 팝업
document.addEventListener('click', function (e) {
  const popup = document.getElementById('hint-popup');
  const popupContent = popup.querySelector('.hint-content');

  if (e.target.classList.contains('hint-btn')) {
    const hintText = e.target.getAttribute('data-hint');
    const leftBox = e.target.closest('.note').querySelector('.question');

    // 팝업 내용 설정
    popupContent.textContent = hintText;

    // 위치 및 크기 설정
    const rect = leftBox.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.top + 35}px`;
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
