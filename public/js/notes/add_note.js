// 수첩 등록 버튼
document.getElementById('addNoteForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 폼의 기본 동작(페이지 이동) 막기

    const formData = new FormData(this);
    console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/note/add', {
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
            alert('수첩 등록 성공!');
            window.location.href = '/main'; // 메인 페이지로 이동
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});