package com.cinebuddies.controller;

import com.cinebuddies.dto.auth.AuthResponse;
import com.cinebuddies.dto.auth.GoogleLoginRequest;
import com.cinebuddies.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.authenticateWithGoogle(request.idToken());
        return ResponseEntity.ok(response);
    }
}

