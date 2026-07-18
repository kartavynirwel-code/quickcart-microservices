package com.quickcart.productorder.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickcart.productorder.dto.CheckoutItem;
import com.quickcart.productorder.dto.CheckoutRequest;
import com.quickcart.productorder.dto.CheckoutResponse;
import com.quickcart.productorder.dto.PaymentVerifyRequest;
import com.quickcart.productorder.dto.PaymentVerifyResponse;
import com.quickcart.productorder.model.Order;
import com.quickcart.productorder.model.Product;
import com.quickcart.productorder.repository.OrderRepository;
import com.quickcart.productorder.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ProductOrderService {

    private static final Logger log = LoggerFactory.getLogger(ProductOrderService.class);

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Base URL of payment-service. Uses the Kubernetes service name by default so this
    // resolves correctly once deployed to the cluster. Override via env var for local dev.
    @Value("${payment.service.base-url:http://payment-service:8000}")
    private String paymentServiceBaseUrl;

    public ProductOrderService(ProductRepository productRepository,
                                OrderRepository orderRepository,
                                RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public CheckoutResponse checkout(CheckoutRequest request) {
        // Calculate the total based on current product prices in the DB.
        BigDecimal total = BigDecimal.ZERO;
        for (CheckoutItem item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Unknown product id: " + item.getProductId()));
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        String status;
        String message;

        try {
            PaymentVerifyRequest paymentRequest = new PaymentVerifyRequest(total);
            PaymentVerifyResponse paymentResponse = restTemplate.postForObject(
                    paymentServiceBaseUrl + "/api/verify-payment",
                    paymentRequest,
                    PaymentVerifyResponse.class
            );

            boolean paymentSuccess = paymentResponse != null && paymentResponse.isSuccess();
            status = paymentSuccess ? "SUCCESS" : "FAILED";
            message = paymentSuccess ? "Payment verified and order placed." : "Payment was declined.";
        } catch (RestClientException ex) {
            log.error("Failed to reach payment-service", ex);
            status = "FAILED";
            message = "Could not reach payment service.";
        }

        String itemsJson = toJson(request.getItems());

        Order order = new Order(itemsJson, total, status, LocalDateTime.now());
        order = orderRepository.save(order);

        log.info("Checkout processed orderId={} status={} total={}", order.getId(), status, total);

        return new CheckoutResponse(order.getId(), status, total, message);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize checkout items to JSON", e);
            return "[]";
        }
    }
}
