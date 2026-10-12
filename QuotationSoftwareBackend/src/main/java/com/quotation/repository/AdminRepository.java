package com.quotation.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quotation.model.Admin;

public interface AdminRepository extends MongoRepository<Admin, String> {

    Optional<Admin> findByUsername(String username);
}
