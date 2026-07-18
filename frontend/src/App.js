import React, { useEffect, useState } from "react";

// Base URL of product-order-service. Override with REACT_APP_API_BASE_URL at build time.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
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

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
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
      setCheckoutResult({ error: "Your cart is empty." });
      return;
    }

    setCheckoutResult({ loading: true });

    fetch(`${API_BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then(async (res) => {
        const data = await res.json();
        setCheckoutResult(data);
        if (res.ok) {
          setCart({});
        }
      })
      .catch((err) => {
        setCheckoutResult({ error: err.message });
      });
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading products...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>QuickCart</h1>

      <h2>Products</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((product) => (
          <li
            key={product.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "8px",
            }}
          >
            <span>
              {product.name} - ${product.price}
            </span>
            <span>
              {cart[product.id] ? (
                <>
                  <button onClick={() => removeFromCart(product.id)}>-</button>
                  <span style={{ margin: "0 8px" }}>{cart[product.id]}</span>
                  <button onClick={() => addToCart(product.id)}>+</button>
                </>
              ) : (
                <button onClick={() => addToCart(product.id)}>Add to Cart</button>
              )}
            </span>
          </li>
        ))}
      </ul>

      <h2>Cart ({cartItemCount} item{cartItemCount !== 1 ? "s" : ""})</h2>
      <button onClick={handleCheckout} disabled={cartItemCount === 0}>
        Checkout
      </button>

      {checkoutResult && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px",
            border: "1px solid #999",
            background: "#f5f5f5",
            whiteSpace: "pre-wrap",
          }}
        >
          {checkoutResult.loading
            ? "Processing checkout..."
            : JSON.stringify(checkoutResult, null, 2)}
        </div>
      )}
    </div>
  );
}

export default App;
