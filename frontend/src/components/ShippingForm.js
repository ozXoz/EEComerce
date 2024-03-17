import React, { useState } from "react";

function ShippingForm({ onSubmit }) {
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address && province && postalCode && country) {
      onSubmit({ address, province, postalCode, country });
      // Resetting form fields after submission
      setAddress("");
      setProvince("");
      setPostalCode("");
      setCountry("");
    } else {
      console.error("Please fill in all shipping information fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        required
      />
      <input
        type="text"
        value={province}
        onChange={(e) => setProvince(e.target.value)}
        placeholder="Province"
        required
      />
      <input
        type="text"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        placeholder="Postal Code"
        required
      />
      <input
        type="text"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Country"
        required
      />
      <button type="submit">Submit Shipping Info</button>
    </form>
  );
}

export default ShippingForm;
