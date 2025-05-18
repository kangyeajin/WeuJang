const noteList = document.querySelector('.note-list');
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";

document.addEventListener('DOMContentLoaded', function () {
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
          if (page == 1) {
            document.querySelector('.note-container').innerHTML
              = `<div class="no-data">등록된 문제가 없습니다.</div>`;
          }
          done = true; // 더 이상 데이터 없음 표시
          return;
        }
        for (let i = 0; i < cards.length; i++) {
          var heart_fivefg = false;

          html += `<li class="note-row" data-index="${cards[i].card_id}" >
                        <input type="hidden" value="${cards[i].wrongCnt}" id="wrongCnt_${cards[i].card_id}"></input>
                        <input type="hidden" value="${cards[i].bookmark}" id="txtBookmark_${cards[i].card_id}"></input>
                    <div class="left"> 
                    <span id="spanBookmark_${cards[i].card_id}">`
          // 북마크표시
          // if (cards[i].bookmark == '1') {
          //   html += `  <div class="index-sticker" id="index-sticker_${cards[i].card_id}"></div> `
          // } else {
          //   html += `  <div class="index-sticker hidden" id="index-sticker_${cards[i].card_id}"></div> `
          // }
          html += `   </span>
                      <div class="meta">
                        <span class="spanHeart" id="heart_${cards[i].card_id}" onclick="setWrongCnt(${cards[i].card_id})" >`;
          // 하트(틀린갯수)표시
          for (let j = 0; j < cards[i].wrongCnt; j++) {
            html += `       <img src="/images/heart.png" alt="틀림" class="img-heart"/>`
            if (j >= 4) { heart_fivefg = true; break; }
          }
          if (!heart_fivefg) {
            html += `       <img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`;
          }
          html += `     </span>`
          // 힌트 표시
          if (cards[i].hint) {
            html += `  <span class="hint-btn" id="spanHint_${cards[i].card_id}" data-hint="${cards[i].hint}">❓</span>`
          } else {
            html += `  <span class="hint-btn hidden" id="spanHint_${cards[i].card_id}" data-hint="">❓</span>`
          }
          html += `    </div>
                    ${cards[i].num}. <span id='spanTextLeft_${cards[i].card_id}'>${cards[i].question}</span>
                    </div>
                    <div class="right">
                      <div class="settings-icon">
                        <img id="dots-button_${cards[i].card_id}" src="/images/dots.png" alt="설정" />
                          <!-- 팝업 메뉴 -->
                          <div class="dots-menu" id="dots-menu_${cards[i].card_id}">
                            <p onclick="editCard(${cards[i].card_id},'${cards[i].question}','${cards[i].answer}')">문제 편집</p>
                            <p onclick="delCard(${cards[i].card_id})">문제 삭제</p>
                            <p onclick="setBookmark(${cards[i].card_id})">북마크 적용</p>
                          </div>
                      </div>
                      <span id='spanTextRigth_${cards[i].card_id}'>${cards[i].answer}</span>
                      <div id="answer-actions_${cards[i].card_id}" class="answer-actions">
                        <button class="edit-save-btn hidden" onclick="cardEditSave(${cards[i].card_id})">저장</button>
                        <button class="edit-cancel-btn hidden" onclick="cardEditCancel(${cards[i].card_id})">취소</button>
                      </div>
                    </div>
                   </li>`;
        }
        noteList.innerHTML = html;
      })
      .catch(err => {
        console.error("카드 불러오기 실패:", err);
      });
  } catch (error) { console.error('카드 요청 실패:', error); }
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
  else {
    popupMenus.forEach(menu => {
      menu.style.display = "none";
    });
  }
});

// 하트표시 클릭 이벤트
async function setWrongCnt(card_id) {
  try {
    var wrongCnt = document.getElementById("wrongCnt_" + card_id).value;
    if (wrongCnt >= 5) { wrongCnt = 0; } else { wrongCnt = ++wrongCnt; }
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
      document.getElementById("wrongCnt_" + card_id).value = result;
      for (let j = 0; j < result; j++) {
        html += `<img src="/images/heart.png" alt="틀림" class="img-heart"/>`
        if (j >= 4) { heart_fivefg = true; break; }
      }
      if (!heart_fivefg) {
        html += `<img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`
      }
      document.getElementById("heart_" + card_id).innerHTML = html;
    }
  } catch (error) { console.error('답변 처리 실패:', error); }
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
  } catch (error) { console.error('제목 세팅 실패:', error); }
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
    if (result) {
      data = JSON.parse(result)
    }

    if (!response.ok) {
      alert(result); // 오류 메시지
    } else {
      var html = "";
      for (let i = 0; i < data.length; i++) {
        html += `<div class="index-sticker${i === 0 ? ' active' : ''}" id="index-sticker_${data[i].card_id}" style="left: 22px; z-index: ${i === 0 ? 5 : -1};"></div>`;
      }

      document.getElementById("index-sticker-list").innerHTML = html;

      // 💡 요소 삽입 후, top 값 자동 설정
      const stickers = document.querySelectorAll('#index-sticker-list .index-sticker');
      const baseTop = 58;
      const gap = 30;

      stickers.forEach((sticker, index) => {
        sticker.style.zIndex = index === 0 ? "5" : "-1";
        sticker.style.left = `22px`;
        sticker.style.top = `${baseTop + index * gap}px`;
      });
    }
  } catch (error) { console.error('북마크 목록 세팅 실패:', error); }
  finally {
    loading = false;
  }
}

// 북마크 바로가기 클릭 이벤트
async function scrollToSticker(cardId) {
  let sticker = document.querySelector(`[data-index="${cardId}"]`);
  let maxTries = 10;
  let tries = 0;

  // 카드가 화면에 없으면 계속 로딩 시도
  while (!sticker && tries < maxTries) {
    tries++;
    page++;
    await getCard(); // 다음 페이지 로드
    await new Promise(resolve => setTimeout(resolve, 100));
    sticker = document.querySelector(`[data-index="${cardId}"]`);
  }

  if (!sticker) {
    console.warn(`cardId ${cardId} 를 찾을 수 없습니다.`);
    return; // 실패 시 종료
  }

  // 화면에 나타났으면 스크롤 이동
  sticker.scrollIntoView({ behavior: 'smooth', block: 'center' });
  sticker.classList.add('highlight'); // 강조 효과 추가
  setTimeout(() => sticker.classList.remove('highlight'), 2000); // 2초 후 강조 효과 제거

}

//(설정 팝업)북마크 적용
async function setBookmark(card_id) {
  try {
    var bookmark = document.getElementById("txtBookmark_" + card_id).value;
    if (bookmark == '1') { bookmark = '0'; } else { bookmark = '1'; }
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
      document.getElementById("txtBookmark_" + card_id).value = result;
      html = `<div class="index-sticker hidden" id="index-sticker_${card_id}"></div>`
      if (result == 1) {
        html = `<div class="index-sticker" id="index-sticker_${card_id}"></div>`
      }
      document.getElementById("spanBookmark_" + card_id).innerHTML = html;

      getNoteBookmarkList(noteId); //북마크 목록 재조회
    }
  } catch (error) { console.error('북마크 적용 실패:', error); }
}

//문제 삭제
async function delCard(card_id) {
  try {
    const confirmDelete = confirm("문제를 삭제하시겠습니까?");
    if (!confirmDelete) return; // 취소 시 함수 종료

    const jsonData = { card_id };

    const response = await fetch('/note/del_card', {
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
      document.querySelector(`[data-index="${card_id}"]`).remove(); // 카드 삭제
      getNoteBookmarkList(noteId); //북마크 목록 재조회
    }
  } catch (error) { console.error('문제 삭제 실패:', error); }
}

//문제 편집
function editCard(cardId) {
  try {
    var leftQuestion = document.getElementById("spanTextLeft_" + cardId);
    var rigthQnswer = document.getElementById("spanTextRigth_" + cardId);
    var hint = document.getElementById("spanHint_" + cardId);
    const hintText = hint.dataset.hint;

    const row = document.querySelector(`[data-index="${cardId}"]`);
    if (!row) return;
    // 원본 question/answer를 row에 임시 저장
    row.dataset.originalQuestion = leftQuestion.textContent;
    row.dataset.originalAnswer = rigthQnswer.textContent;
    row.dataset.originalHint = hintText;

    // 문제 편집 textarea 생성
    leftQuestion.innerHTML = `<textarea class="edit-textarea2 full-width">${leftQuestion.textContent}</textarea>
                            <div class="edit-wrapper">
                            <span>❓</span><textarea class="edit-textarea2 textHint">${hintText}</textarea>
                            </div>`;
    rigthQnswer.innerHTML = `<textarea class="edit-textarea full-width">${rigthQnswer.textContent}</textarea>`;

    // 버튼 보이기
    document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.remove("hidden");
    document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.remove("hidden");

    // 힌트 표기
    if (hintText != '') {
      hint.classList.remove("hidden");
    } else {
      hint.classList.add("hidden");
    }

    // 설정 버튼(점세개) 숨김
    const dotsButton = document.getElementById(`dots-button_${cardId}`);
    dotsButton.classList.add("hidden");

    return;

  } catch (error) { console.error('문제 편집 실패:', error); }
}

//문제 편집 저장
async function cardEditSave(cardId) {
  try {
    const newQuestion = document.querySelector(`#spanTextLeft_${cardId} textarea`).value;
    const newAnswer = document.querySelector(`#spanTextRigth_${cardId} textarea`).value;
    const newHint = document.querySelector(`#spanTextLeft_${cardId} .edit-wrapper textarea`).value;

    const confirmDelete = confirm("변경된 내용을 저장하시겠습니까?");
    if (!confirmDelete) return; // 취소 시 함수 종료

    if (!cardId || !newQuestion || !newAnswer) {
      alert("문제와 답변을 입력하세요.");
      return;
    }
    const bodyData = {
      card_id: cardId,
      question: newQuestion,
      answer: newAnswer,
      hint: newHint,
    };

    const response = await fetch("/note/upd_card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const result = await response.text();

    if (!response.ok) return alert(result);

    var data = '';
    if (result) {
      data = JSON.parse(result);
    }

    document.getElementById("spanTextLeft_" + cardId).innerHTML = data[0].question;
    document.getElementById("spanTextRigth_" + cardId).innerHTML = data[0].answer;
    document.getElementById("spanHint_" + cardId).dataset.hint = data[0].hint;
    if (data[0].hint != '') {
      document.getElementById("spanHint_" + cardId).classList.remove("hidden");
    }
    else {
      document.getElementById("spanHint_" + cardId).classList.add("hidden");
    }

    document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.add("hidden");
    document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.add("hidden");
    hint.classList.remove("hidden");

  } catch (err) {
    console.error("수정 실패", err);
    alert("수정 중 오류 발생");
  }
}

//문제 편집 취소
function cardEditCancel(cardId) {
  const row = document.querySelector(`[data-index="${cardId}"]`);
  if (!row) return;
  const confirmDelete = confirm("편집을 취소하시겠습니까?\n편집 내용은 저장되지 않습니다.");
  if (!confirmDelete) return; // 취소 시 함수 종료

  const originalQuestion = row.dataset.originalQuestion || '';
  const originalAnswer = row.dataset.originalAnswer || '';

  // 다시 복원
  document.getElementById("spanTextLeft_" + cardId).innerHTML = originalQuestion;
  document.getElementById("spanTextRigth_" + cardId).innerHTML = originalAnswer;

  document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.add("hidden");
  document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.add("hidden");

  const dotsButton = document.getElementById(`dots-button_${cardId}`);
  dotsButton.classList.remove("hidden");
}