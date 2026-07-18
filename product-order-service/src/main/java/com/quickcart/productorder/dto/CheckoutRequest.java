package com.quickcart.productorder.dto;

import java.util.List;

public class CheckoutRequest {

    private List<CheckoutItem> items;

    public CheckoutRequest() {
    }

    public List<CheckoutItem> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItem> items) {
        this.items = items;
    }
}
