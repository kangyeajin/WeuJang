// HTML 엔티티 디코딩 함수
function decodeHtml(html) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
// cards 데이터를 가져와서 디코딩 후 JSON으로 파싱
const jsonData = decodeHtml(document.getElementById('cards').textContent);
const cards = JSON.parse(jsonData);

const noteList = document.querySelector('.note-list');

document.addEventListener('DOMContentLoaded', function() {
  getCard();  // DOM이 로드된 후 자동 실행
});

function getCard() {
  try {
    var html = "";
    for (let i = 0; i < cards.length; i++) {
      html += `<li class="note-row">
                <div class="left">${[i+1]}. ${cards[i].question}</div>
                <div class="right">${cards[i].answer}</div>
               </li>`;
    }
    noteList.innerHTML = html;
  }catch (error) {console.error('카드 요청 실패:', error);}
}