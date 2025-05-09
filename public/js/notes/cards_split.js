const noteList = document.querySelector('.note-list');
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";

document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener("scroll", handleScroll); // 스크롤 이벤트 등록
  getNoteInfo(noteId);  //노트 제목
  getNoteBookmarkList(noteId); //북마크 목록
  getCard();  // DOM이 로드된 후 자동 실행
});

//카드 목록 가져오기
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
          // hint 값이 있으면 ❓ 표시, 없으면 빈 문자열
          const hint = cards[i].hint ? '❓' : '';
          var heart_fivefg = false;

          html += `<li class="note-row" data-index="${cards[i].card_id}" >
                    <div class="left">`
                    if(cards[i].bookmark == '1'){
          html += `  <div class="index-sticker"></div>`}
          html += `   <div class="meta">
                        <span class="spanHeart" id="heart_${cards[i].card_id}" onclick="setWrongCnt(${cards[i].card_id})" >
                        <input type="hidden" value="${cards[i].wrongCnt}" id="wrongCnt_${cards[i].card_id}"></input>`;
                        for (let j = 0; j < cards[i].wrongCnt; j++){
          html += `       <img src="/images/heart.png" alt="틀림" class="img-heart"/>`
                          if(j >= 4){ heart_fivefg= true; break;}
                        }
                        if(!heart_fivefg){
          html += `       <img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`;
                        }
          html += `     </span>
                        <span class="hint-btn" data-hint="${cards[i].hint || ''}">${hint}</span>
                      </div>
                    ${cards[i].num}. ${cards[i].question}</div>
                    <div class="right">
                      <div class="settings-icon">
                        <img src="/images/dots.png" alt="설정" />
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

// 하트표시 클릭 이벤트
async function setWrongCnt(card_id) {
  try {
    var wrongCnt = document.getElementById("wrongCnt_"+card_id).value;
    if(wrongCnt == 5){wrongCnt = 0;}else {wrongCnt = ++wrongCnt;}
    const jsonData = { card_id, wrongCnt };
    
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
      var html = "";
      var heart_fivefg = false;
      //처리 성공 후 갯수 업데이트
      html += `<input type="hidden" value="${result}" id="wrongCnt_${card_id}"></input>`;
      for (let j = 0; j < result; j++){
        html += `<img src="/images/heart.png" alt="틀림" class="img-heart"/>`
          if(j >= 4){ heart_fivefg= true; break;}
      }
      if(!heart_fivefg){
        html += `<img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`}
      document.getElementById("heart_"+card_id).innerHTML = html;
    }
      }catch (error) {console.error('답변 처리 실패:', error);} 
      finally {
        loading = false;
      }
}

//노트 제목 세팅
async function getNoteInfo(noteId) {
  try {
    const note_id = noteId;
        const jsonData = { note_id };
        
        const response = await fetch('/note/get_note', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.text();

        const data = JSON.parse(result);

        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
          var html = "";
          document.getElementById("note_title").textContent = data[0].title;
        }
      }catch (error) {console.error('제목 세팅 실패:', error);} 
      finally {
        loading = false;
      }
}


//노트 북마크 목록
async function getNoteBookmarkList(noteId) {
  try {
    const note_id = noteId;
        const jsonData = { note_id };
        
        const response = await fetch('/note/get_noteBookmark', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.text();
        
        var data = '';
        if(result){
          data = JSON.parse(result)
        }
        
        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
          var html = "";
          for (let i = 0; i < data.length; i++) {
            html += `<span class="sticker" onclick="scrollToSticker(${data[i].card_id})">뭐넣지?</span>`;
          }
          document.getElementById("index-sticker-list").innerHTML = html;
        }
      }catch (error) {console.error('북마크 목록 세팅 실패:', error);} 
      finally {
        loading = false;
      }
}

function scrollToSticker(index) {
  const sticker = document.querySelector(`[data-index="${index}"]`);
  if (sticker) {
    sticker.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}