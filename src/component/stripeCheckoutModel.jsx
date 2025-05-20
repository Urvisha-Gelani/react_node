// components/StripeCheckoutModal.js
import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../../axiosInstance";

// Load Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = ({ show, handleClose, amount, payableUserId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const amountInCents = amount * 100;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // 1️⃣ Create PaymentMethod from card
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: methodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (methodError) {
        alert(methodError.message);
        return;
      }

      // 2️⃣ Create PaymentIntent in backend
      const { data } = await axiosInstance.post("/payments", {
        amount,
        paymentMethodId: paymentMethod.id,
        payableUserId,
      });

      // 3️⃣ Confirm payment on frontend
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (result.error) {
        console.log(`❌ ${result.error.message}`);
      } else if (result.paymentIntent.status === "succeeded") {
        console.log("✅ Payment successful!");
      }
    } catch (err) {
      console.error("Payment error:", err);
      console.log("❌ Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Stripe Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handlePayment}>
          <CardElement options={{ hidePostalCode: true }} />
          <Button
            className="mt-3"
            type="submit"
            disabled={!stripe || loading}
            variant="success"
          >
            {loading ? (
              <Spinner size="sm" animation="border" />
            ) : (
              `Pay ₹${amountInCents}`
              // `Pay ₹${amountInCents}`
            )}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

const StripeCheckoutModal = ({ show, handleClose, amount, payableUserId }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        show={show}
        handleClose={handleClose}
        amount={amount}
        payableUserId={payableUserId}
      />
    </Elements>
  );
};

export default StripeCheckoutModal;
