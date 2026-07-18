package com.quickcart.productorder.dto;

public class PaymentVerifyResponse {

    private boolean success;

    public PaymentVerifyResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
