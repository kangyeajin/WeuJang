
// 가림판 선택 버튼
document.getElementById('coverSelectForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/cover/setting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message); // 오류 메시지
        } else {
            alert('가림판 변경 성공!');
            // localStorage에 설정 정보 저장
            localStorage.setItem("coverSettings", JSON.stringify(data));
            window.location.href = '/main'; // 메인 페이지로 이동
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});