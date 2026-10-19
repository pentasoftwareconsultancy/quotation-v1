package com.quotation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class AuthRateLimiterTest {

    @Test
    void rejectsRequestsAfterWindowLimit() {
        AuthRateLimiter limiter = new AuthRateLimiter();
        limiter.check("login", "127.0.0.1", 1, Duration.ofMinutes(1));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> limiter.check("login", "127.0.0.1", 1, Duration.ofMinutes(1)));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatusCode());
    }
}
