document.getElementById('addNoteBtn').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'block';
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'none';
  });
  
  // 수첩 생성
  document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(document.getElementById('noteForm'));
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
            window.location.href = '/upload_cards';

                //   const newNote = await res.json();
  
    //   // 새 항목을 select에 추가
    //   const select = document.getElementById('noteSelect');
    //   const option = document.createElement('option');
    //   option.value = newNote.note_id;
    //   option.textContent = newNote.title;
    //   select.appendChild(option);
  
    //   // 선택도 새 항목으로 변경
    //   select.value = newNote.note_id;
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }

    // if (res.ok) {
    //   const newNote = await res.json();
  
    //   // 새 항목을 select에 추가
    //   const select = document.getElementById('noteSelect');
    //   const option = document.createElement('option');
    //   option.value = newNote.note_id;
    //   option.textContent = newNote.title;
    //   select.appendChild(option);
  
    //   // 선택도 새 항목으로 변경
    //   select.value = newNote.note_id;
  
    //   // 모달 닫기
    //   document.getElementById('noteModal').style.display = 'none';
  
    //   // 초기화
    //   document.getElementById('noteForm').reset();
    // } else {
    //   alert('수첩 추가에 실패했습니다.');
    // }
  });