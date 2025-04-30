document.addEventListener('DOMContentLoaded', function () {
    const paymentBtn = document.getElementById('goPaymentBtn');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', function () {
            goPaymentPage();
        });
    }
});

function goPaymentPage() {
    window.location.href = '/payment'; //결제 페이지로 이동
}