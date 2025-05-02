document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 폼 기본 동작(페이지 이동) 방지

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
            window.location.href = data.redirect;
        }
        else{
            alert(data.message);
        }

    } catch (error) {
        console.error('로그인 요청 실패:', error);
        alert('서버 연결에 실패했습니다.');
    }
});