package com.cinebuddies.controller;

import com.cinebuddies.dto.preference.PreferenceRequest;
import com.cinebuddies.dto.preference.PreferenceResponse;
import com.cinebuddies.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{code}/members/{memberId}/preferences")
@CrossOrigin(origins = "*")
public class PreferenceController {

    private final PreferenceService preferenceService;

    public PreferenceController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @PutMapping
    public ResponseEntity<PreferenceResponse> submitPreferences(
            @PathVariable("code") String code,
            @PathVariable("memberId") UUID memberId,
            @RequestBody PreferenceRequest request
    ) {
        PreferenceResponse response = preferenceService.submitPreferences(code, memberId, request);
        return ResponseEntity.ok(response);
    }
}

