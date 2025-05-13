
const mode = document.getElementById("pageMode");
const coverPreview = document.getElementById("coverPreview");//가림판 미리보기 화면
const previewText = document.getElementById('previewText');//문제, 답 미리보기 화면
const previewImage = document.getElementById('previewImage');//배경 이미지 
const decorationText = document.getElementById('decorationText');//꾸밈 문구

window.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById("selectedImgUrl").value;
    if(!img){
        console.log("img X");
        previewImage.src = "";
        previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    }
    else {
        console.log("img o");
        previewImage.src = img;
        previewImage.style.display = "block";
    }
    coverPreview.style.backgroundColor = document.getElementById("coverBackgroundColor").value;
    coverPreview.style.opacity = parseFloat(document.getElementById("coverOpacity").value);
    decorationText.textContent = document.getElementById("textInput").value;
    decorationText.style.fontSize = parseInt(document.getElementById("textSize").value) + "px";
    decorationText.style.color = document.getElementById("textColor").value;
});

// 배경 이미지 업로드
document.getElementById("imageUpload").addEventListener("change", async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    // 기존 이미지 제거 (previewImage가 있다면)
    if (previewImage) {

        // 수정 작업 중에는 이미지를 삭제하지 않고, 수정 내용 저장 시 기존 이미지 삭제 처리를 진행한다.
        // 기존에 등록한 이미지 삭제
        if (mode.value !== "update" && previewImage.src.startsWith(window.location.origin + "/uploads/")) {
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
    }

    // input 초기화 (선택된 파일을 비우고 새로 선택하게끔)
    document.getElementById("imageUpload").value = ''; // file value 초기화

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

// 가림판 등록
document.getElementById("saveBtn").addEventListener("click", async () => {
    const settings = {
        cover_id: document.getElementById("coverId").value,
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

    var response = null;

    if (mode.value !== "update"){
        response = await fetch("/cover/saveSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings)
        });
    }
    else {
        response = await fetch("/cover/updateSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings)
        });
    }

    alert("가림판 설정이 저장되었습니다.");
});