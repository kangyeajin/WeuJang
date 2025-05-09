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

        // 로그인 시 사용자가 선택한 가림판을 가져와 localStorage에 설정 정보 저장
        console.log("== 사용자가 선택한 가림판을 조회해 localStorage에 설정 정보 저장하는 기능 추가 == ");
        // localStorage.setItem("coverSettings", JSON.stringify(data));

        if (response.status === 200) {
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