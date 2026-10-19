package com.quotation.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;

class EmployeeAuthExceptionHandlerTest {

    private final EmployeeAuthExceptionHandler handler = new EmployeeAuthExceptionHandler();

    @Test
    void databaseErrorsReturnSafeServiceUnavailableMessage() {
        var response = handler.handleDatabaseUnavailable(
                new DataAccessResourceFailureException("sensitive database detail"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals(
                "Sign-in is temporarily unavailable because employee records cannot be reached.",
                response.getBody().get("message"));
        assertFalse(response.getBody().toString().contains("sensitive database detail"));
    }
}
