const cover = document.getElementById("cover");

let isDragging = false;
let offsetX, offsetY;

// PC용
cover.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - cover.getBoundingClientRect().left;
  offsetY = e.clientY - cover.getBoundingClientRect().top;
  cover.classList.add("dragging");
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const x = e.clientX + window.scrollX - offsetX;
    const y = e.clientY + window.scrollY - offsetY;
    cover.style.left = `${x}px`;
    cover.style.top = `${y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 모바일용
cover.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offsetX = touch.clientX - cover.getBoundingClientRect().left;
  offsetY = touch.clientY - cover.getBoundingClientRect().top;
  cover.classList.add("dragging");
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  const x = touch.clientX + window.scrollX - offsetX;
  const y = touch.clientY + window.scrollY - offsetY;
  cover.style.left = `${x}px`;
  cover.style.top = `${y}px`;
  e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 토글
document.getElementById('coverfg').addEventListener('click', function () {
  if (!cover.classList.contains('show')) {

    // 사용자가 선택한 가림판 css 적용
    const coverPanel = document.getElementById("cover");
    const backImage = document.getElementById("coverImage");
    const backText = document.getElementById("coverText");

    const saved = JSON.parse(localStorage.getItem("coverSettings"));
    if (saved) {
      // console.log(saved);
      //배경 색상,투명도 
      coverPanel.style.backgroundColor = saved.color;
      coverPanel.style.opacity = saved.opacity;
      
      //배경문구 
      backText.textContent = saved.text;
      backText.style.color = saved.text_color;
      backText.style.fontSize = saved.text_size + "px";      
      
      //배경이미지
      if (!saved.Img) {
        backImage.src = "";
        backImage.style.display = "none";  // 깨진 아이콘 숨기기
      }
      else {
        backImage.src = saved.Img;
      }
    }

    cover.classList.add('show'); // 일단 보여야 크기 측정 가능

    // 한 프레임 기다렸다가 위치 설정
    requestAnimationFrame(() => {
      const x = window.scrollX + window.innerWidth / 2 - cover.offsetWidth / 2;
      const y = window.scrollY + window.innerHeight / 2 - cover.offsetHeight / 2;

      cover.style.left = `${x}px`;
      cover.style.top = `${y + 50}px`;
    });
  } else {
    cover.classList.remove('show');
  }
});
