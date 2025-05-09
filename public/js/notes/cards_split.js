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
                        <input type="hidden" value="${cards[i].wrongCnt}" id="wrongCnt_${cards[i].card_id}"></input>
                        <input type="hidden" value="${cards[i].bookmark}" id="txtBookmark_${cards[i].card_id}"></input>
                    <div class="left"> 
                    <span id="spanBookmark_${cards[i].card_id}">`
                    if(cards[i].bookmark == '1'){
          html += `  <div class="index-sticker" id="index-sticker_${cards[i].card_id}"></div> `
                    } else {
          html += `  <div class="index-sticker hidden" id="index-sticker_${cards[i].card_id}"></div> `
                    } 
          html += `   </span>
                      <div class="meta">
                        <span class="spanHeart" id="heart_${cards[i].card_id}" onclick="setWrongCnt(${cards[i].card_id})" >`;
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
                        <img id="dots-button_${cards[i].card_id}" src="/images/dots.png" alt="설정" />
                          <!-- 팝업 메뉴 -->
                          <div class="dots-menu" id="dots-menu_${cards[i].card_id}">
                            <p>문제 편집</p>
                            <p>문제 삭제</p>
                            <p onclick="setBookmark(${cards[i].card_id})">북마크 적용</p>
                          </div>
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

document.addEventListener('click', function (e) {
  // 힌트 팝업
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

  // 메뉴 설정 팝업
  const popupMenus = document.querySelectorAll(".dots-menu");

  // 클릭한 요소가 dots-button일 경우
  if (e.target.matches("img[id^='dots-button_']")) {
    const id = e.target.id.split("_")[1];
    const targetMenu = document.getElementById(`dots-menu_${id}`);

    // 모든 메뉴 닫기
    popupMenus.forEach(menu => {
      if (menu !== targetMenu) menu.style.display = "none";
    });

    // 해당 메뉴만 토글
    targetMenu.style.display = (targetMenu.style.display === "block") ? "none" : "block";
  } 
  // 클릭한 곳이 메뉴 내부일 경우는 유지, 그 외엔 닫기
  else  {
    popupMenus.forEach(menu => {
      menu.style.display = "none";
    });
  }
});

// 하트표시 클릭 이벤트
async function setWrongCnt(card_id) {
  try {
    var wrongCnt = document.getElementById("wrongCnt_"+card_id).value;
    if(wrongCnt >= 5){wrongCnt = 0;}else {wrongCnt = ++wrongCnt;}
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
          document.getElementById("wrongCnt_"+card_id).value = result;
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
        
        const response = await fetch('/note/get_cardBookmark', {
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

//북마크 바로가기 클릭이벤트
function scrollToSticker(index) {
  const sticker = document.querySelector(`[data-index="${index}"]`);
  if (sticker) {
    sticker.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

//(설정 팝업)북마크 적용
async function setBookmark(card_id) {
  try {
    var bookmark = document.getElementById("txtBookmark_"+card_id).value;
        if(bookmark == '1'){ bookmark = '0';} else {bookmark = '1';}
        const jsonData = { card_id, bookmark };
        
        const response = await fetch('/note/set_cardBookmark', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.text();
        var html = "";
        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
          document.getElementById("txtBookmark_"+card_id).value = result;
          html = `<div class="index-sticker hidden" id="index-sticker_${card_id}"></div>`
          if (result == 1) {
            html = `<div class="index-sticker" id="index-sticker_${card_id}"></div>`
          }
          document.getElementById("spanBookmark_"+card_id).innerHTML = html;
          
          getNoteBookmarkList(noteId); //북마크 목록 재조회
        }
      }catch (error) {console.error('북마크 적용 실패:', error);} 
}