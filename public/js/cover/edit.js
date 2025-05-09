
const coverPreview = document.getElementById("coverPreview");//가림판 미리보기 화면
const previewText = document.getElementById('previewText');//문제, 답 미리보기 화면
const previewImage = document.getElementById('previewImage');//배경 이미지 
const decorationText = document.getElementById('decorationText');//꾸밈 문구

// 배경 이미지 업로드
document.getElementById("imageUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch("/cover/upload-image", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.url) {
            previewImage.src = data.url; // 임시 가림판에 바로 반영
            previewImage.style.display = "block";
        } else {
            alert("이미지 업로드에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("서버 오류: 이미지 업로드 실패");
    }
});

// 배경 이미지 삭제
document.getElementById("deleteImageBtn").addEventListener("click", async () => {

    // DB에 저장된 이미지가 있다면 서버에도 삭제 요청 (선택사항)
    if (previewImage.src.startsWith(window.location.origin + "/uploads/")) {
        const filename = previewImage.src.split("/uploads/")[1];
        try {
            await fetch("/cover/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename })
            });
        } catch (err) {
            console.error("이미지 삭제 실패:", err);
        }
    }

    // 이미지 src 제거 및 아이콘 제거
    previewImage.src = "";
    previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    document.getElementById("imageUpload").value = ''; // file value 초기화
});

// 가림판 배경 색상 변경
document.getElementById('coverBackgroundColor').addEventListener("input", (e) => {
    coverPreview.style.backgroundColor = e.target.value;
});

// 가림판 투명도 변경
document.getElementById('coverOpacity').addEventListener("input", (e) => {
    coverPreview.style.opacity = e.target.value;
});

// 문구 변경
document.getElementById('textInput').addEventListener("input", (e) => {
    decorationText.textContent = e.target.value;
});

// 문구 크기 변경
document.getElementById('textSize').addEventListener("input", (e) => {
    decorationText.style.fontSize = e.target.value + "px";
});

// 문구 색상 변경
document.getElementById('textColor').addEventListener("input", (e) => {
    decorationText.style.color = e.target.value;
});

// 문제 색상 변경
document.getElementById('questionColor').addEventListener("input", (e) => {
    document.getElementById('sample-question').style.color = e.target.value;
});

// 답 색상 변경
document.getElementById('answerColor').addEventListener("input", (e) => {
    document.getElementById('sample-answer').style.color = e.target.value;
});

// 답 투명도 변경
document.getElementById('answerOpacity').addEventListener("input", (e) => {
    document.getElementById('sample-answer').style.opacity = e.target.value;
});


document.getElementById("saveBtn").addEventListener("click", async () => {
    const settings = {
        title: document.getElementById("cover-title").value,
        imgUrl: document.getElementById("previewImage").src,
        backgroundColor: document.getElementById("coverBackgroundColor").value,
        backgroundOpacity: parseFloat(document.getElementById("coverOpacity").value),
        text: document.getElementById("textInput").value,
        textSize: parseInt(document.getElementById("textSize").value),
        textColor: document.getElementById("textColor").value,
        questionColor: document.getElementById("questionColor").value,
        answerColor: document.getElementById("answerColor").value,
        answerOpacity: parseInt(document.getElementById("answerOpacity").value),
    };

    await fetch("/cover/saveSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
    });

    alert("가림판 설정이 저장되었습니다.");
});