document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const data = await response.json();

        if (response.status === 200) {
            // 사용자가 선택한 가림판의 설정을 localStorage에 저장
            localStorage.setItem("coverSettings", JSON.stringify(data.cover));
            window.location.href = data.redirect;
        }
        else {
            alert(data.message);
        }

    } catch (error) {
        console.error('로그인 요청 실패:', error);
        alert('서버 연결에 실패했습니다.');
    }
});