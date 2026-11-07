package com.cinebuddies.controller;

import com.cinebuddies.dto.analysis.GroupAnalysisResponse;
import com.cinebuddies.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms/{code}/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping
    public ResponseEntity<GroupAnalysisResponse> getAnalysis(@PathVariable("code") String code) {
        GroupAnalysisResponse response = analysisService.analyzeRoom(code);
        return ResponseEntity.ok(response);
    }
}

