document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.note-title').forEach(span => {
        addTitleEditListeners(span);
    });

    function addTitleEditListeners(span) {
        let timer;
        const LONG_PRESS_DURATION = 500;

        // span 복제 후 새 요소로 교체
        const newSpan = span.cloneNode(true);
        span.replaceWith(newSpan);

        // 더블클릭
        newSpan.addEventListener('dblclick', () => enterEditMode(newSpan));

        // 긴 누르기 (PC)
        newSpan.addEventListener('mousedown', () => {
            timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
        });
        newSpan.addEventListener('mouseup', () => clearTimeout(timer));
        newSpan.addEventListener('mouseleave', () => clearTimeout(timer));

        // 긴 누르기 (Mobile)
        newSpan.addEventListener('touchstart', () => {
            timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
        });
        newSpan.addEventListener('touchend', () => clearTimeout(timer));
        newSpan.addEventListener('touchcancel', () => clearTimeout(timer));
    }

    function enterEditMode(span) {
        const noteId = span.dataset.id;
        const noteTitle = span.dataset.title;
        const currentTitle = span.childNodes[0]?.textContent.trim() || '';

        // 로딩 인디케이터 & 수정 아이콘 제거
        const loader = document.createElement('span');
        loader.textContent = '저장 중...';
        loader.className = 'loading-indicator';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = noteTitle;
        input.maxLength = 50;
        input.placeholder = '제목을 입력하세요';
        input.className = 'note-title-input';
        span.replaceWith(input);
        input.focus();

        const restoreSpan = (title) => {
            const newSpan = document.createElement('span');
            newSpan.textContent = `${title.length > 5 ? title.substring(0, 5) + '...' : title}`;
            newSpan.className = 'note-title';
            newSpan.dataset.id = noteId;
            newSpan.dataset.title = title;

            const target = document.querySelector('.loading-indicator') || input;
            target.replaceWith(newSpan);
            addTitleEditListeners(newSpan);
        };

        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') restoreSpan(currentTitle);
        });

        input.addEventListener('blur', async () => {
            const newTitle = input.value.trim();
            if (!newTitle || newTitle === currentTitle) {
                restoreSpan(currentTitle);
                return;
            }
            input.replaceWith(loader);
            try {
                const response = await fetch('/note/upd_note', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ note_id: noteId, title: newTitle })
                });

                const data = await response.json();
                if (response.ok) {
                    restoreSpan(newTitle);
                } else {
                    alert(data.message || "저장에 실패했습니다.");
                    restoreSpan(currentTitle);
                }
            } catch (error) {
                console.error('에러 발생:', error);
                alert("저장 중 오류 발생");
                restoreSpan(currentTitle);
            }
            finally {
                // window.location.href = "/main";
            }
        });
    }
});