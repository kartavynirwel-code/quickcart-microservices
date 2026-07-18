package com.quickcart.productorder.controller;

import com.quickcart.productorder.dto.CheckoutRequest;
import com.quickcart.productorder.dto.CheckoutResponse;
import com.quickcart.productorder.model.Order;
import com.quickcart.productorder.model.Product;
import com.quickcart.productorder.service.ProductOrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductOrderController {

    private final ProductOrderService productOrderService;

    public ProductOrderController(ProductOrderService productOrderService) {
        this.productOrderService = productOrderService;
    }

    @GetMapping("/products")
    public List<Product> getProducts() {
        return productOrderService.getAllProducts();
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@RequestBody CheckoutRequest request) {
        return productOrderService.checkout(request);
    }

    @GetMapping("/orders")
    public List<Order> getOrders() {
        return productOrderService.getAllOrders();
    }
}
