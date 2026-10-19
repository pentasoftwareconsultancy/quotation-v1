package com.quotation;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(properties = {
        "spring.data.mongodb.uri=mongodb://127.0.0.1:27018/quotation_test?serverSelectionTimeoutMS=500",
        "spring.data.mongodb.database=quotation_test",
        "security.jwt.secret=test-only-signing-secret-with-more-than-thirty-two-bytes"
})
@AutoConfigureMockMvc
class QuotationSoftwareBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void protectedApiRejectsRequestsWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/clients"))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(get("/api/clients")
                        .header("Authorization", "Bearer opaque-otp-challenge-id"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void otpEndpointsArePublicForChallengeVerification() throws Exception {
        mockMvc.perform(post("/api/employee/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeLoginRejectsEmptyCredentialsWithValidationMessage() throws Exception {
        mockMvc.perform(post("/api/employee/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Employee ID and password are required."));
    }
}
