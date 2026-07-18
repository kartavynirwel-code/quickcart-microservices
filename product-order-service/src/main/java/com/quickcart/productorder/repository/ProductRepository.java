package com.quickcart.productorder.repository;

import com.quickcart.productorder.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
