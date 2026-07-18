package com.quickcart.productorder.dto;

import java.math.BigDecimal;

public class CheckoutResponse {

    private Long orderId;
    private String status;
    private BigDecimal totalAmount;
    private String message;

    public CheckoutResponse() {
    }

    public CheckoutResponse(Long orderId, String status, BigDecimal totalAmount, String message) {
        this.orderId = orderId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.message = message;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
