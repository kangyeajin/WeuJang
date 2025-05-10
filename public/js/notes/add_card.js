// 카드 등록 버튼
document.getElementById('addCardForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    // console.log(Object.fromEntries(formData.entries()));
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
            // 수첩을 제외한 나머지 값 초기화
            document.getElementById('addCardForm').reset();
            document.getElementById('note_id').value = jsonData["note_id"];
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});