// 드래그할 가림판 요소
const cover = document.getElementById("cover");

let isDragging = false;
let offsetX, offsetY;

// PC용: 마우스 드래그
cover.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - cover.getBoundingClientRect().left;
  offsetY = e.clientY - cover.getBoundingClientRect().top;
  cover.classList.add("dragging");
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    cover.style.left = `${x}px`;
    cover.style.top = `${y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 모바일용: 터치 드래그
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
  const x = touch.clientX - offsetX;
  const y = touch.clientY - offsetY;
  cover.style.left = `${x}px`;
  cover.style.top = `${y}px`;
  e.preventDefault(); // 기본 스크롤 방지
}, { passive: false });

document.addEventListener("touchend", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 가림판 보이기/숨기기 토글
document.getElementById('coverfg').addEventListener('click', function () {
  cover.classList.toggle('show');
});
