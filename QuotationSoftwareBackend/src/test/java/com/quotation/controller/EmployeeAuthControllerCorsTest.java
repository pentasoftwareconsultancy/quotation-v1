package com.quotation.controller;

import com.quotation.config.WebConfig;
import com.quotation.security.JwtFilter;
import com.quotation.security.JwtUtil;
import com.quotation.security.SecurityConfig;
import com.quotation.service.EmployeeAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Explicitly pulls in the real SecurityConfig/WebConfig/JwtFilter/JwtUtil beans
// (none of these are auto-included by the @WebMvcTest slice's component filter)
// so this exercises the actual production CORS/security wiring, without needing
// a real MongoDB connection.
@WebMvcTest(controllers = EmployeeAuthController.class)
@Import({ SecurityConfig.class, WebConfig.class, JwtFilter.class, JwtUtil.class })
@TestPropertySource(properties = "app.cors.allowed-origins=https://deployed-frontend.example.com,http://localhost:5173")
class EmployeeAuthControllerCorsTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeAuthService employeeAuthService;

    @Test
    void loginEndpointExists_andRejectsBadCredentialsWith401() throws Exception {
        when(employeeAuthService.login("EMP-999", "wrong")).thenReturn(null);

        mockMvc.perform(post("/api/employee/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"EMP-999\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void preflightFromLocalDevOrigin_isAccepted() throws Exception {
        mockMvc.perform(options("/api/employee/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void preflightFromDeployedFrontendOrigin_isAccepted() throws Exception {
        mockMvc.perform(options("/api/employee/auth/login")
                        .header("Origin", "https://deployed-frontend.example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://deployed-frontend.example.com"));
    }

    @Test
    void preflightFromDisallowedOrigin_isRejected() throws Exception {
        mockMvc.perform(options("/api/employee/auth/login")
                        .header("Origin", "https://not-the-configured-frontend.example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
