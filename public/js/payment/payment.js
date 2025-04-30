document.addEventListener("DOMContentLoaded", () => {
    main();
  });
  
  async function main() {
    const button = document.getElementById("payment-button");
    const coupon = document.getElementById("coupon-box");
  
    const amount = {
      currency: "KRW",
      value: 50000,
    };
  
    // 결제 위젯 초기화
    const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
    const customerKey = generateRandomString();
    const tossPayments = TossPayments(clientKey);
  
    const widgets = tossPayments.widgets({ customerKey });
  
    await widgets.setAmount(amount);
  
    await widgets.renderPaymentMethods({
      selector: "#payment-method",
      variantKey: "DEFAULT",
    });
  
    await widgets.renderAgreement({
      selector: "#agreement",
      variantKey: "AGREEMENT",
    });
  
    coupon?.addEventListener("change", async function () {
      if (coupon.checked) {
        await widgets.setAmount({
          currency: "KRW",
          value: amount.value - 5000,
        });
      } else {
        await widgets.setAmount(amount); // 기존 amount 객체 그대로 사용
      }
    });
  
    button?.addEventListener("click", async function () {
      await widgets.requestPayment({
        orderId: generateRandomString(),
        orderName: "토스 티셔츠 외 2건",
        successUrl: window.location.origin + "/success.html",
        failUrl: window.location.origin + "/fail.html",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
        customerMobilePhone: "01012341234",
      });
    });
  }
  
  function generateRandomString() {
    return btoa(Math.random().toString()).slice(0, 20);
  }