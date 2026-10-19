package com.quotation.service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuthRateLimiter {

    private final Map<String, Window> windows = new HashMap<>();

    public synchronized void check(String scope, String key, int limit, Duration window) {
        Instant now = Instant.now();
        if (windows.size() > 10_000) {
            Iterator<Window> iterator = windows.values().iterator();
            while (iterator.hasNext()) {
                if (!iterator.next().expiresAt.isAfter(now)) {
                    iterator.remove();
                }
            }
        }

        String rateLimitKey = scope + ":" + key;
        Window current = windows.get(rateLimitKey);
        if (current == null || !current.expiresAt.isAfter(now)) {
            windows.put(rateLimitKey, new Window(1, now.plus(window)));
            return;
        }

        if (current.count >= limit) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many authentication requests. Please try again later.");
        }
        current.count++;
    }

    private static final class Window {
        private int count;
        private final Instant expiresAt;

        private Window(int count, Instant expiresAt) {
            this.count = count;
            this.expiresAt = expiresAt;
        }
    }
}
