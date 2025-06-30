let currentIndex = 0;
let totalCards = document.getElementById("hidCardNum").value; // 카드 총 개수
let failCnt = 0; // 오답 갯수

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const notes = document.getElementById("hidNotes").value;
const cardNum = document.getElementById("hidCardNum").value;

// 다음카드로 전환
function updateProgress() {
    const percent = ((currentIndex) / totalCards) * 100;
    progressText.textContent = `${currentIndex} / ${totalCards}`;
    progressFill.style.width = `${percent}%`;
}

// 시험 종료
async function finProgress() {
    try {
        const jsonData = {
            notes: notes.split(',').join('|'),
            cardNum: parseInt(cardNum),
            failCnt: failCnt
        };
        const response = await fetch('/note/setExamResult', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
            alert("시험이 종료되었습니다.");
            // 시험 종료 후 페이지 이동
            window.location.href = `/main`;
        }
    } catch (error) {
        console.error('시험 종료 처리 실패:', error);
    }
}

// "틀림" 버튼 클릭 시
document.querySelector(".wrong-btn").addEventListener("click", () => {
    failCnt++;
    if (currentIndex < totalCards - 1) {
        updateCard(currentCardIndex + 1);
        updateProgress();
        // 다음 카드로 전환 등 추가 로직 삽입 가능
    }
});

// "정답" 버튼 클릭 시
document.querySelector(".correct-btn").addEventListener("click", () => {
    updateCard(currentCardIndex + 1);

    if (cards.length == 1) {   // 끝난 경우
        currentIndex++;
        updateProgress();
        finProgress();
        return;
    }
    if (currentIndex < totalCards - 1) {
        currentIndex++;
        updateProgress();
        // 다음 카드로 전환 등 추가 로직 삽입 가능
    }
    var card_id = cards[currentCardIndex].card_id;
    const index = cards.findIndex(card => card.card_id === card_id);
    if (index !== -1) {
        cards.splice(index, 1); // 해당 인덱스에서 1개 제거
    }
});

const urlParams = new URLSearchParams(window.location.search);
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";
const cards = []; // 카드 정보를 저장할 배열
let currentCardIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
    getCard();  // DOM이 로드된 후 자동 실행
});

async function getCard() {
    if (loading || done) return;
    loading = true; // 로딩 상태 설정
    try {
        const jsonData = {
            notes: notes.split(',').map(Number),
            cardNum: parseInt(cardNum)
        };
        const response = await fetch('/note/getExamCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {

            const newCards = result;

            if (!newCards || newCards.length === 0) {
                if (page == 1) {
                    // document.querySelector('.note-container').innerHTML
                    //   = `<a class="card no-data" href="/add_card}">등록된 문제가 없습니다.</>`;
                }
                done = true; // 데이터가 없으면 더 이상 로드 안 함
                return;
            }

            // 새로 불러온 카드 데이터를 기존 cards 배열에 추가
            cards.push(...newCards);
            if (page === 1) {
                // 페이지 로드 시 첫 번째 문제 표시
                progressText.textContent = `${currentCardIndex} / ${totalCards}`;
                updateCard(currentCardIndex);
            };
        }
    } catch (error) { console.error('카드 요청 실패:', error); }
    finally {
        loading = false;
    }
}

const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const nextButton = document.getElementById('next-button');
const preButton = document.getElementById('pre-button');
const flashcard = document.getElementById('flashcard');

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('rotate');
});

// 카드 정보 업데이트 함수
function updateCard(index) {
    try {
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
    } catch (error) {
        console.error('카드 업데이트 실패:', error);
    }
}