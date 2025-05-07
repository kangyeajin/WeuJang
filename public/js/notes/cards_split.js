const noteList = document.querySelector('.note-list');
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
    
          html += `<li class="note-row">
                    <div class="left">
                      <div class="meta">
                        <span id="star">${stars}</span>
                        <span class="hint-btn" data-hint="${cards[i].hint || ''}">${hint}</span>
                      </div>
                    ${cards[i].num}. ${cards[i].question}</div>
                    <div class="right">
                      <div class="answer-actions">
                        <button class="wrong-btn" onclick="setWrongCnt(1, ${cards[i].card_id})" >❌</button>
                        <span class="counter" id="wrongCnt_${cards[i].card_id}">${cards[i].wrongCnt}</span>
                        <button class="correct-btn" onclick="setWrongCnt(-1, ${cards[i].card_id})" >✅</button>
                      </div>
                      ${cards[i].answer}
                    </div>
                   </li>`;
        }
        noteList.innerHTML = html;
      })
      .catch(err => {
        console.error("카드 불러오기 실패:", err);
      });
      }catch (error) {console.error('카드 요청 실패:', error);} 
      finally {
        loading = false;
      }
}

// 스크롤 이벤트(페이징)
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
    const leftBox = e.target.closest('.note-row').querySelector('.left');

    // 팝업 내용 설정
    popupContent.textContent = hintText;

    // 위치 및 크기 설정
    const rect = leftBox.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.top + 40}px`;
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

// 맞음,틀림 버튼
const messageTooltip = document.getElementById('message-tooltip');
const wrongBtns = document.querySelectorAll('.wrong-btn');
const correctBtns = document.querySelectorAll('.correct-btn');

// PC에서 마우스 호버 시
wrongBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    showMessage(btn, '틀렸어요');
  });
});

correctBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    showMessage(btn, '맞았어요');
  });
});

// 모바일 터치 시
wrongBtns.forEach(btn => {
  btn.addEventListener('touchstart', () => {
    showMessage(btn, '틀렸어요');
  });
});

correctBtns.forEach(btn => {
  btn.addEventListener('touchstart', () => {
    showMessage(btn, '맞았어요');
  });
});

// 메시지를 화면에 표시하는 함수
function showMessage(button, message) {
  // 버튼의 위치 가져오기
  const rect = button.getBoundingClientRect();
  
  // 말풍선 내용 설정
  messageTooltip.textContent = message;
  
  // 말풍선 위치 설정 (버튼 위로 고정)
  messageTooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (messageTooltip.offsetWidth / 2)}px`;
  messageTooltip.style.top = `${rect.top + window.scrollY - messageTooltip.offsetHeight - 10}px`;

  // 말풍선 표시
  messageTooltip.classList.add('show');

  // 잠시 후 말풍선 사라지기
  setTimeout(() => {
    messageTooltip.classList.remove('show');
  }, 1500);  // 1.5초 후 사라짐
}

async function setWrongCnt(answer, card_id) {
  try {
    const wrongCnt = document.getElementById("wrongCnt_"+card_id).textContent;
    if(wrongCnt == "0" && answer == "-1"){return;}
    const jsonData = { card_id, answer };
    const response = await fetch('/note/wrongCnt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    });

    const result = await response.text();

    if (!response.ok) {
        alert(result); // 오류 메시지
    } else {
      //처리 성공 후 갯수 업데이트
      document.getElementById("wrongCnt_"+card_id).textContent = result;
    }
      }catch (error) {console.error('답변 처리 실패:', error);} 
      finally {
        loading = false;
      }
}