document.getElementById("imageUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch("/cover/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.url) {
            const previewImg = document.getElementById("previewImage");
            previewImg.src = data.url; // 임시 가림판에 바로 반영
        } else {
            alert("이미지 업로드에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("서버 오류: 이미지 업로드 실패");
    }
});

document.getElementById("deleteImageBtn").addEventListener("click", async () => {
    const previewImage = document.getElementById("previewImage");

    // // DB에 저장된 이미지가 있다면 서버에도 삭제 요청 (선택사항)
    // if (previewImage.src.startsWith(window.location.origin + "/uploads/")) {
    //   const filename = previewImage.src.split("/uploads/")[1];
    //   try {
    //     await fetch("/api/delete-uploaded-image", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ filename })
    //     });
    //   } catch (err) {
    //     console.error("이미지 삭제 실패:", err);
    //   }
    // }

    // 이미지 src 제거 및 아이콘 제거
    previewImage.src = "";
    previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    document.getElementById("imageUpload").value = ''; // file value 초기화
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
    document.getElementById("coverPreview").style.backgroundColor = e.target.value;
});

document.getElementById("opacitySlider").addEventListener("input", (e) => {
    document.getElementById("coverPreview").style.opacity = e.target.value;
});

document.getElementById("textInput").addEventListener("input", (e) => {
    document.getElementById("previewText").textContent = e.target.value;
});

document.getElementById("textSize").addEventListener("input", (e) => {
    document.getElementById("previewText").style.fontSize = e.target.value + "px";
});

document.getElementById("textColor").addEventListener("input", (e) => {
    document.getElementById("previewText").style.color = e.target.value;
});

document.getElementById("saveBtn").addEventListener("click", async () => {
    const settings = {
        background_image_url: document.getElementById("previewImage").src,
        background_color: document.getElementById("colorPicker").value,
        opacity: parseFloat(document.getElementById("opacitySlider").value),
        text_content: document.getElementById("textInput").value,
        text_size: parseInt(document.getElementById("textSize").value),
        text_color: document.getElementById("textColor").value
    };

    await fetch("/api/save-cover-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
    });

    alert("가림판 설정이 저장되었습니다.");
});