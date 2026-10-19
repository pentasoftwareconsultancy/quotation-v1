package com.quotation.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class EmployeePasswordSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void passwordCanBeAcceptedButIsNeverSerialized() throws Exception {
        Employee employee = objectMapper.readValue(
                "{\"empId\":\"E-17\",\"password\":\"stored-secret\"}", Employee.class);

        assertEquals("stored-secret", employee.getPassword());
        String response = objectMapper.writeValueAsString(employee);
        assertFalse(response.contains("password"));
        assertFalse(response.contains("stored-secret"));
    }
}
