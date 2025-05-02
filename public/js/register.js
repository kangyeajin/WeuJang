// 유효성 검사
const passwordInput = document.getElementById('password');
const pwCheckInput = document.getElementById('pwCheck');
const pwAlert = document.getElementById('pwAlert');

function checkPasswordMatch() {
  if (pwCheckInput.value === '') {
    pwAlert.classList.add('d-none');
    return;
  }

  if (passwordInput.value !== pwCheckInput.value) {
    pwAlert.classList.remove('d-none');
  } else {
    pwAlert.classList.add('d-none');
  }
}

passwordInput.addEventListener('input', checkPasswordMatch);
pwCheckInput.addEventListener('input', checkPasswordMatch);

// 아이디 중복 확인 
const userIdInput = document.getElementById('user_id');
const msgDiv = document.getElementById('idCheckMsg');

let timeout = null;

userIdInput.addEventListener('input', () => {
  const userId = userIdInput.value.trim();

  // 입력 지연 후 요청
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    if (!userId) {
      msgDiv.textContent = '';
      return;
    }

    try {
      const response = await fetch('/user/chkUserId?user_id=' + encodeURIComponent(userId));
      const result = await response.json();

      if (result.available) {
        msgDiv.textContent = '사용 가능한 ID입니다.';
        msgDiv.classList.remove('text-danger');
        msgDiv.classList.add('text-success');
      } else {
        msgDiv.textContent = '이미 사용 중인 ID입니다.';
        msgDiv.classList.remove('text-success');
        msgDiv.classList.add('text-danger');
      }
    } catch (err) {
      console.error(err);
      msgDiv.textContent = '확인 중 오류 발생';
      msgDiv.classList.remove('text-success');
      msgDiv.classList.add('text-danger');
    }
  }, 500); // 0.5초 대기
});

// 회원가입 버튼
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 폼의 기본 동작(페이지 이동) 막기

    const formData = new FormData(this);
    // console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
      const response = await fetch('/user/register', {
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
        alert('회원가입 성공');
        window.location.href = '/'; // 로그인 페이지로 이동 (원하는 경로로 수정)
      }
    } catch (error) {
      console.error('예외 발생:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  });