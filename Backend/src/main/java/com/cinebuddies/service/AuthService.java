package com.cinebuddies.service;

import com.cinebuddies.dto.auth.AuthResponse;
import com.cinebuddies.model.User;
import com.cinebuddies.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${cinebuddies.auth.google.client-id}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostConstruct
    public void init() {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    public AuthResponse authenticateWithGoogle(String idTokenString) {
        if (idTokenString == null || idTokenString.trim().isEmpty()) {
            throw new IllegalArgumentException("Google ID Token must not be empty.");
        }

        GoogleIdToken googleIdToken;
        try {
            googleIdToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google ID Token: " + e.getMessage(), e);
        }

        if (googleIdToken == null) {
            throw new IllegalArgumentException("Invalid Google ID Token.");
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Google ID Token payload does not contain a verified email.");
        }

        String displayName = (name != null && !name.trim().isEmpty())
                ? name.trim()
                : email.split("@")[0];

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User(email, null, displayName);
                    return userRepository.save(newUser);
                });

        String jwt = jwtService.generateToken(user);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getDisplayName());
    }

    public AuthResponse updateProfile(UUID userId, String displayName) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName.trim());
            user.setUpdatedAt(java.time.Instant.now());
            userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user);
        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getDisplayName());
    }
}

