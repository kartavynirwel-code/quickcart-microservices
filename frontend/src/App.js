import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

// Base URL of product-order-service. Override with REACT_APP_API_BASE_URL at build time.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Couldn't load products (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = () => {
    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity,
    }));

    if (items.length === 0) {
      setCheckoutResult({ status: "FAILED", message: "Your cart is empty. Add something to ring it up." });
      return;
    }

    setCheckoutResult({ pending: true });

    fetch(`${API_BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then(async (res) => {
        const data = await res.json();
        setCheckoutResult(data);
        if (res.ok) setCart({});
      })
      .catch((err) => {
        setCheckoutResult({ status: "FAILED", message: err.message });
      });
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="state-message">printing today's price list…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="state-message state-message--error">
          {error}
          <div>
            <button className="retry-btn" onClick={fetchProducts}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultClass = checkoutResult?.pending
    ? "result-slip result-slip--pending"
    : checkoutResult?.status === "SUCCESS"
    ? "result-slip result-slip--success"
    : checkoutResult
    ? "result-slip result-slip--failed"
    : "";

  return (
    <div className="app-shell">
      <div className="receipt">
        <div className="receipt__header">
          <h1 className="receipt__store">QuickCart</h1>
          <p className="receipt__tagline">self-checkout · lane 3</p>
        </div>

        <hr className="receipt__rule" />

        <h2 className="receipt__section-title">Today's stock</h2>
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-row">
              <span className="product-row__name">{product.name}</span>
              <span className="product-row__leader" />
              <span className="product-row__price">${product.price}</span>
              <span className="product-row__controls">
                {cart[product.id] ? (
                  <>
                    <button className="qty-btn" onClick={() => removeFromCart(product.id)} aria-label={`Remove one ${product.name}`}>
                      −
                    </button>
                    <span className="qty-value">{cart[product.id]}</span>
                    <button className="qty-btn" onClick={() => addToCart(product.id)} aria-label={`Add one more ${product.name}`}>
                      +
                    </button>
                  </>
                ) : (
                  <button className="add-btn" onClick={() => addToCart(product.id)}>
                    Add
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>

        <hr className="receipt__rule" />

        <div className="cart-summary">
          <span className="cart-summary__count">
            {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in cart
          </span>
        </div>

        <button className="checkout-btn" onClick={handleCheckout} disabled={cartItemCount === 0}>
          Checkout
        </button>

        {checkoutResult && (
          <div className={resultClass}>
            {checkoutResult.pending
              ? "ringing it up…"
              : JSON.stringify(checkoutResult, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;