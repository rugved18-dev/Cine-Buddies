package com.cinebuddies.controller;

import com.cinebuddies.dto.recommendation.RecommendationResponse;
import com.cinebuddies.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms/{code}/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@PathVariable("code") String code) {
        List<RecommendationResponse> recommendations = recommendationService.getRecommendations(code);
        return ResponseEntity.ok(recommendations);
    }
}

