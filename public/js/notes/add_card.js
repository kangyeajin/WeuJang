const stars = document.querySelectorAll('.star');
const starValueInput = document.getElementById('star-value');

let selectedValue = 0;

stars.forEach(star => {
    const value = parseInt(star.dataset.value);

    // 클릭: 별점 고정
    star.addEventListener('click', () => {
        selectedValue = value;
        starValueInput.value = value;
        updateStars(value);
    });

    // 마우스 오버: 임시 하이라이트
    star.addEventListener('mouseover', () => {
        updateStars(value);
    });

    // 마우스 아웃: 원래 선택값으로 복원
    star.addEventListener('mouseout', () => {
        updateStars(selectedValue);
    });
});

function updateStars(value) {
    stars.forEach(s => {
        const sVal = parseInt(s.dataset.value);
        s.classList.toggle('selected', sVal <= value);
    });
}

// 카드 등록 버튼
document.getElementById('addCardForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 폼의 기본 동작(페이지 이동) 막기

    const formData = new FormData(this);
    console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/note/add_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.text();

        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
            alert('카드 등록 성공!');
            window.location.href = '/main'; // 메인 페이지로 이동
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});