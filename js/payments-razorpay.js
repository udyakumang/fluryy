
// Placeholder for Razorpay checkout on booking confirmation.
// To enable:
// 1) Add script tag in <head>: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// 2) Fill in your key_id. Create order on your backend and pass order_id here.
/*
export function openRazorpay(amountINR, orderId){
  const options = {
    key: 'rzp_test_yourkeyid',
    amount: amountINR * 100,
    currency: 'INR',
    name: 'Fluryy',
    description: 'Booking advance',
    order_id: orderId,
    handler: function (resp) {
      // TODO: verify payment on backend then show success
      alert('Payment successful: ' + resp.razorpay_payment_id);
    },
    prefill: { email: 'hello@fluryy.com' },
    theme: { color: '#2F80ED' }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}
*/
