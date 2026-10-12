package com.quotation.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.quotation.model.Admin;
import com.quotation.repository.AdminRepository;

@Configuration
public class AdminDataLoader {

    private static final Logger log = LoggerFactory.getLogger(AdminDataLoader.class);

    @Bean
    CommandLineRunner loadAdmin(AdminRepository adminRepository) {
        return args -> {
            // MongoDB may be unreachable at startup (network/DNS/Atlas outage); a failure
            // here must not crash the whole application and take Tomcat down with it.
            try {
                if (adminRepository.findByUsername("admin").isEmpty()) {
                    Admin admin = new Admin("admin", "admin123");
                    adminRepository.save(admin);
                    System.out.println("✅ Admin created in MongoDB");
                } else {
                    System.out.println("ℹ Admin already exists");
                }
            } catch (Exception e) {
                log.error("Skipping admin seed: could not reach MongoDB at startup ({})", e.getMessage());
            }
        };
    }
}
