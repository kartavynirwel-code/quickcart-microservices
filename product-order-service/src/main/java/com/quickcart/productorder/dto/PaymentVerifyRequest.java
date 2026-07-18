package com.quickcart.productorder.dto;

import java.math.BigDecimal;

public class PaymentVerifyRequest {

    private BigDecimal amount;

    public PaymentVerifyRequest() {
    }

    public PaymentVerifyRequest(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
